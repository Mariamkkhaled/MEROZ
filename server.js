const express = require('express');
const mysql = require('mysql');
const path = require('path');
require("dotenv").config();
const bcrypt = require("bcrypt");
const { default: test } = require('node:test');
const { table } = require('console');

const app = express();
const db = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});
app.use(express.json());
// Route to create a new user
app.use(express.static(path.join(__dirname, 'public')));

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/HTML/sign.html')

})

app.post("/register", async (req, res) => {
    try {
        const {firstName,lastName,email,gender,birthDate,phoneNumber, password, confirmpassword} = req.body;
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedconfirm = await bcrypt.hash(confirmpassword, 10);
        // Check if the user already exists
        const searchQuery = "SELECT * FROM signup WHERE email = ?";
        db.query(searchQuery, [email], async (searchErr, searchResult) => {
            if (searchErr) {
                throw searchErr;
            }
            if (searchResult.length !== 0) {
                console.log("User already exists");
                return res.status(409).send("User already exists");
            }
            // If user doesn't exist, insert new user
            const insertQuery = "INSERT INTO signup (firstName, lastName, email, gender, birthDate,phoneNumber, password, confirmpassword) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            db.query(insertQuery, [firstName,lastName,email,gender,birthDate,phoneNumber, hashedPassword, hashedconfirm], (insertErr, insertResult) => {
                if (insertErr) {
                    throw insertErr;
                }
                console.log("New user created");
                res.status(201).send("New user created");
            });
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Error creating user");
    }
});
app.post("/login", (req, res) => {
    const user = req.body.name
    const password = req.body.password
    db.getConnection(async (err, connection) => {
        if (err) throw (err)
        const sqlSearch = "Select * from userTable where user = ?"
        const search_query = mysql.format(sqlSearch, [user])
        await connection.query(search_query, async (err, result) => {
            connection.release()
            if (err) throw (err)
            if (result.length == 0) {
                console.log("--------> User does not exist")
                res.sendStatus(404)
            } else {
                const hashedPassword = result[0].password
                //get the hashedPassword from result
                if (await bcrypt.compare(password, hashedPassword)) {
                    console.log("---------> Login Successful")
                    res.send(`${user} is logged in!`)
                } else {
                    console.log("---------> Password Incorrect")
                    res.send("Password incorrect!")
                } //end of bcrypt.compare()
            }//end of User exists i.e. results.length==0
        }) //end of connection.query()
    }) //end of db.connection()
}) //end of app.post()


 

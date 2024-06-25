CREATE DATABASE meroz;
USE meroz;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    birthdate DATE,
    gender ENUM('Male', 'Female', 'Other'),
    password VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20)
);

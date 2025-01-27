const mysql = require('mysql2');
const express = require('express');
require('dotenv').config();
const sequelize = require('./config/database');
const user = require('./model/user');
const productVendor = require('./model/productVendor');
const product = require('./model/product');
const productImage = require('./model/productImage');
const { signup, login } = require('./controller/authController');
const { authorize, authenticate } = require("./middleware/auth");
const userRoutes = require('./routes/user.js');

const productRoutes = require('./routes/product.js');

const app = express();
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// Create a connection to MySQL server (without specifying the database yet)
const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
});

// Create the database if it doesn't exist
async function createDatabase() {
    return new Promise((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                reject(`Error connecting to MySQL server: ${err.stack}`);
                return;
            }

            connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`, (err) => {
                if (err) {
                    reject(`Error creating database: ${err.stack}`);
                    return;
                }
                resolve(); // Database is ready
            });
        });
    });
}

// Initialize Sequelize after ensuring the database exists
async function sequelizeConnection() {
    try {
        await sequelize.authenticate();
        return sequelize;
    } catch (error) {
        throw error;
    }
}

async function syncDatabase() {
    try {
        await createDatabase();
        const sequelize = await sequelizeConnection();
        await sequelize.sync({ force: false }).catch(err => {
        });

    } catch (error) {
    }
}

syncDatabase();

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

app.post('/signup', signup)
app.get('/login', login)
app.use('/product', authenticate, productRoutes);
app.use('/user', authenticate, authorize("superAdmin"), userRoutes);


const disconnect = async () => {
    await sequelize.close();
}
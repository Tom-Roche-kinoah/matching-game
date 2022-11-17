// Chargement du client PG
const { Client } = require('pg');

// Configuration d'une connexion
const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});

// Connexion
client.connect(err => {
    if (err) {
        console.error('DataBase connection error', err.stack);
    } else {
        console.log('DataBase connection success');
    }
});

module.exports = client;
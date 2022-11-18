// Chargement du client PG
const { Client } = require('pg');

// Configuration d'une connexion
// const client = new Client({
//     host: process.env.PG_HOST,
//     user: process.env.PG_USER,
//     database: process.env.PG_DATABASE,
//     password: process.env.PG_PASSWORD
// });
const client = new Client(process.env.PG_URL);

// Connexion
client.connect(err => {
    if (err) {
        console.error('DataBase connection error', err.stack);
    } else {
        console.log('DataBase connection success');
    }
});

module.exports = client;
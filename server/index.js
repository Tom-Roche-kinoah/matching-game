// Charement des variables d'environnement
require('dotenv').config();

// Chargement des modules nécéssaires
const express = require('express');
// var cors = require('cors');

// Express
const app = express();

// Le front est notre partie static
// son index sera servi sur la requete '/'
app.use(express.static('front'));

// les échanges sont parsés en JSON
app.use(express.json());

// // cors
// app.use(cors());

// Router
const router = require('./router');
app.use(router);


// server instance
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur pret sur http://localhost:${PORT}`);
});
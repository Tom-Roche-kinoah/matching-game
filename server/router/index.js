// Chargement des modules nécéssaires
const express = require('express');
const router = express.Router();

// Le router est notre aiguillage !
// il transfere les requetes clients vers le bon controleur

// Router Score
const scoreController = require('../controllers/scoreController');
router.get('/score', scoreController.allScores);
router.get('/score/:id', scoreController.oneScore);
router.post('/score', scoreController.addScore);

module.exports = router;
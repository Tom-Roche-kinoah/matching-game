// Chargement du dataMapper score
const dataMapper = require('./../dataMappers/scoreDataMapper');

// Le controlleur est l'interface entre le serveur et la bdd
// il est 'db agnostic', le sgbd utilisé n'influence pas sa logique
// si demain nous choisissons un autre sgbd (mysql par ex.) seul le data mapper sera impacté

// Récuperer tout les scores
// On souhaite récuperer tous les scores
// cette fonction doit etre asynchrone, car la requete elle-meme (dans le le data mapper) est asynchrone
exports.allScores = async (req, res) => {
    try {
        // tant que la promesse (await) ci dessous n'est pas résolue
        // les autres actions du try ne seront pas executés
        const scores = await dataMapper.fetchAllScores();
        res.json(scores);
    } catch (error) {
        // si le data mapper nous retourne une erreur, on la passe au client en json
        res.json(error);
    }
};

// Récuperer un score par son ID (bonus)
exports.oneScore = async (req, res) => {
    try {
        // quand un parametre est passé dans l'url,
        // on le récupere avec 'req.params.nomDuParam'
        const scoreId = Number(req.params.id);
        const score = await dataMapper.fetchOneScore(scoreId);
        res.json(score);
    } catch (error) {
        res.json(error);
    }
};

// Insérer un nouveau score
exports.addScore = async (req, res) => {
    try {
        // l'objet newScore est fourni par un formulaire
        // on récupère le contenu du formulaire avec 'req.body'
        const newScore = await dataMapper.addOneScore(req.body);
        res.json(newScore);
    } catch (error) {
        res.json(error);
    }
};
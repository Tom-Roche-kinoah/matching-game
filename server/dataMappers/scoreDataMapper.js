// Connexion à la db
const db = require('./dbClient');

// le data mapper se connecte au sgbd avec la config client pg
// puis c'est ici qu'on écrit nos requetes sql, en asynchrone
// dans les requetes ou l'on fournit de la data, on se protège des injections en utilisant le principe de requetes paramétrées
// $1, $2 ...

exports.fetchAllScores = async () => {
    const scores = await db.query(`
        SELECT *
        FROM "score"
        ORDER BY "player_score" ASC
        `
    );
    return scores.rows;
};

exports.fetchOneScore = async (scoreId) => {
    const scores = await db.query(`
        SELECT *
        FROM "score"
        WHERE "id" = $1
        `,
        [scoreId]
    );
    return scores.rows;
};

exports.addOneScore = async (newScore) => {
    const { player_name, player_score } = newScore;
    const score = await db.query(`
        INSERT INTO "score"
        ("player_name", "player_score")
        VALUES
        ($1, $2)
        RETURNING *;
        `,      
        [player_name, player_score]
    );
    return score.rows[0];
};
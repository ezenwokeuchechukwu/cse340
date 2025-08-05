const pool = require("../database");

/* Add a vehicle to favorites */
async function addFavorite(account_id, inv_id) {
  const sql = "INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2)";
  return pool.query(sql, [account_id, inv_id]);
}

/* Get a user's favorite vehicles */
async function getFavoritesByAccount(account_id) {
  const sql = `
    SELECT f.favorite_id, i.inv_make, i.inv_model, i.inv_price 
    FROM favorites f
    JOIN inventory i ON f.inv_id = i.inv_id
    WHERE f.account_id = $1
  `;
  const data = await pool.query(sql, [account_id]);
  return data.rows;
}

module.exports = { addFavorite, getFavoritesByAccount };

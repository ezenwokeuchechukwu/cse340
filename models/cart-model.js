const pool = require("../database/");

async function addItemToCart(account_id, inv_id) {
	try {
		const checkSql = "SELECT * FROM cart WHERE account_id = $1 AND inv_id = $2";
		const checkResult = await pool.query(checkSql, [account_id, inv_id]);
		if (checkResult.rowCount > 0) {
			// Increase quantity if already exists
			const updateSql =
				"UPDATE cart SET quantity = quantity + 1 WHERE account_id = $1 AND inv_id = $2 RETURNING *";
			const updateResult = await pool.query(updateSql, [account_id, inv_id]);
			return updateResult.rows[0];
		} else {
			// Insert new row with quantity = 1
			const insertSql =
				"INSERT INTO cart (account_id, inv_id, quantity) VALUES ($1, $2, 1) RETURNING *";
			const insertResult = await pool.query(insertSql, [account_id, inv_id]);
			return insertResult.rows[0];
		}
	} catch (error) {
		console.error("Error in addItemToCart:", error);
		throw error;
	}
}

async function getCartItems(account_id) {
	try {
		const sql = `
      SELECT c.cart_id, c.inv_id, c.quantity, i.inv_make, i.inv_model, i.inv_price
      FROM cart c
      JOIN inventory i ON c.inv_id = i.inv_id
      WHERE c.account_id = $1
      ORDER BY c.added_at DESC
    `;
		const data = await pool.query(sql, [account_id]);
		return data.rows;
	} catch (error) {
		console.error("Error in getCartItems:", error);
		throw error;
	}
}

async function clearCartItems(account_id) {
	try {
		const sql = "DELETE FROM cart WHERE account_id = $1";
		const data = await pool.query(sql, [account_id]);
		return data;
	} catch (error) {
		console.error("Error in clearCartItems:", error);
		throw error;
	}
}

async function getCartCount(account_id) {
	try {
		const sql =
			"SELECT COALESCE(SUM(quantity), 0) AS count FROM cart WHERE account_id = $1";
		const data = await pool.query(sql, [account_id]);
		return parseInt(data.rows[0].count);
	} catch (error) {
		console.error("Error in getCartCount:", error);
		throw error;
	}
}

async function removeItemFromCart(cart_id, account_id) {
	try {
		const sql =
			"DELETE FROM cart WHERE cart_id = $1 AND account_id = $2 RETURNING *";
		const result = await pool.query(sql, [cart_id, account_id]);
		return result.rows[0];
	} catch (error) {
		console.error("Error in removeItemFromCart:", error);
		throw error;
	}
}

module.exports = {
	addItemToCart,
	getCartItems,
	clearCartItems,
	getCartCount,
	removeItemFromCart,
};
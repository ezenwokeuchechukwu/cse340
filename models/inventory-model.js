const pool = require("../database/")

/* ***************************
 *  Get all classification data
 *************************** */
async function getClassifications() {
  try {
    const result = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    )
    return result.rows
  } catch (error) {
    console.error("getClassifications error:", error)
    throw error
  }
}

/* ***************************
 *  Get vehicle inventory by classification ID
 *************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const sql = `
      SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
        ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1
    `
    const result = await pool.query(sql, [classification_id])
    return result.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    throw error
  }
}

/* ***************************
 *  Get vehicle details by inv_id
 *************************** */
async function getVehicleById(inv_id) {
  try {
    const sql = `
      SELECT * FROM public.inventory 
      WHERE inv_id = $1
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows[0] // Return only the first row (expected 1 result)
  } catch (error) {
    console.error("getVehicleById error:", error)
    throw error
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
}

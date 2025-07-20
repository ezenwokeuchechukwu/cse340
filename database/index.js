const { Pool } = require("pg");
require("dotenv").config();

let ssl = false;

// Render and most production Postgres services require SSL
if (process.env.NODE_ENV === "production") {
  ssl = { rejectUnauthorized: false };
} else if (process.env.NODE_ENV === "development") {
  ssl = { rejectUnauthorized: false };
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl,
});

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      console.log("executed query", { text });
      return res;
    } catch (error) {
      console.error("error in query", { text, error });
      throw error;
    }
  },
};

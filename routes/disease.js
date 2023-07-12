const express = require("express");
const router = express.Router();
const db = require("../database/connection.js");

// Retrieve all diseases
router.get("/", async (req, res) => {
  try {
    let sql = "SELECT id, title, subtitle, description, case_ids FROM disease";
    if (req.query.ids) {
      const ids = req.query.ids.split(",").map(Number);
      sql += ` WHERE id IN (${ids.join(",")})`;
    }

    const results = await db.query(sql);
    const promises = results.map(async (disease) => {
      if (!disease.case_ids) {
        return { ...disease, cases: [] };
      } else {
        const caseIds = disease.case_ids.split(",").map(Number);
        const sql2 = `SELECT id, title, subtitle FROM \`case\` WHERE id IN (${caseIds.join(",")})`;
        const cases = await db.query(sql2);
        return { ...disease, cases };
      }
    });

    const diseases = await Promise.all(promises);
    res.status(200).json({ diseases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Retrieve a specific disease by ID
router.get("/:disease_id", async (req, res) => {
  try {
    const diseaseId = parseInt(req.params.disease_id);
    const sql = `SELECT id, title, subtitle, description, case_ids FROM disease WHERE id = ?`;
    const results = await db.query(sql, [diseaseId]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Disease not found" });
    }

    const disease = results[0];
    if (!disease.case_ids) {
      return res.status(200).json({ ...disease, cases: [] });
    }

    const caseIds = disease.case_ids.split(",").map(Number);
    const sql2 = `SELECT id, title, subtitle FROM \`case\` WHERE id IN (${caseIds.join(",")})`;
    const cases = await db.query(sql2);
    res.status(200).json({ ...disease, cases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

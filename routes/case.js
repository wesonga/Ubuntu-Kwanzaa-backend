var express = require("express");
var router = express.Router();
var db = require("../database/connection.js");

router.get("/", (req, res) => {
  var sql = "select * from `case`";
  db.query(sql, function (err, result) {
    if (err) {
      res.status(400).json({
        message: "MySQL error: " + err.message,
      });
      return;
    }

    result.map((x) => {
      x.symptoms = x.symptoms.split(',');
      x.manual = JSON.parse(x.manual);
    });

    res.status(200).json({
      cases: result,
    });
  });
});

router.get("/:case_id", (req, res) => {
    var sql = "select * from `case` where id=" + req.params.case_id;
    db.query(sql, function (err, result) {
      if (err) {
        res.status(400).json({
          message: "MySQL error: " + err.message,
        });
        return;
      }

      result[0].symptoms = result[0].symptoms.split(',');
      result[0].manual = JSON.parse(result[0].manual);
  
      res.status(200).json(result[0]);
    });
  });

module.exports = router;

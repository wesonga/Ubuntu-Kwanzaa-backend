var express = require("express");
var router = express.Router();
var db = require("../database/connection.js");

router.get("/", async function (req, res) {
  var sql = "select id, title, subtitle, description, case_ids from disease";
  if (req.query.ids !== undefined) {
    sql += " where id in (" + req.query.ids + ")";
  }
  try {
    await db.query(sql, async function (err, results) {
      if (err) throw err;
      var promises = [];
      results.forEach((elem, i) => {
        if (elem.case_ids === "") {
          delete results[i].case_ids;
          promises.push(
            new Promise((resolve, reject) => {
              resolve({ ...results[i], cases: [] });
            })
          );
        } else {
          promises.push(
            new Promise((resolve, reject) => {
              var sql2 =
                "select id, title, subtitle from `case` where id in (" +
                elem.case_ids +
                ")";
              delete results[i].case_ids;
              db.query(sql2, function (err, result2) {
                if (err) throw err;
                resolve({ ...results[i], cases: result2 });
              });
            })
          );
        }
      });

      Promise.all(promises).then((x) => {
        res.status(200).json({
          diseases: x,
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: "error occured",
    });
  }
});

router.get("/:disease_id", async function (req, res) {
  var sql =
    "select id, title, subtitle, description, case_ids from disease where id =" +
    req.params.disease_id;
  await db.query(sql, async function (err, result) {
    if (err) throw err;

    function proc() {
      return new Promise((resolve, reject) => {
        var sql2 =
          "select id, title, subtitle from `case` where id in (" +
          result[0].case_ids +
          ")";
        delete result[0].case_ids;
        db.query(sql2, function (err, result2) {
          if (err) throw err;
          resolve({ ...result[0], cases: result2 });
        });
      });
    }

    if (result[0].case_ids === "") {
      delete result[0].case_ids;
      res.status(200).json({
        ...result[0],
        case: [],
      });
    } else {
      proc().then((x) => {
        res.status(200).json(x);
      });
    }
  });
});

// DEPRECATED
// router.get("/:disease_id/manual", function (req, res) {
//   var sql =
//     "select content from disease inner join manual on disease.manual_id = manual.id where disease.id = ?";
//   var datas = [req.params.disease_id];
//   db.query(sql, datas, function (err, result) {
//     if (err) {
//       res.status(400).json({
//         message: "MySQL error: " + err.message,
//       });
//       return;
//     }
//     res.status(200).json({
//       manual: JSON.parse(result[0].content),
//     });
//   });
// });

module.exports = router;

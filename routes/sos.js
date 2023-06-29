var express = require("express");
var router = express.Router();
var db = require("../database/connection.js");
const admin = require("firebase-admin");

let serviceAccount = require("../auth/fbAuth.json");

const { initializeApp } = require("firebase-admin/app");
initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

router.post("/", (req, res) => {
  var reqs = [];
  if (!req.body.location) reqs.push("location");
  if (!req.body.user) reqs.push("user");
  if (reqs.length) {
    res.status(400).json({
      message: "No " + reqs.join(", ") + " specified.",
    });
    return;
  }

  if (typeof req.body.user !== "object") {
    res.status(400).json({
      message: "Parameter 'user' should be object.",
    });
    return;
  }

  var sql =
    "insert into users (name, birth_date, height, weight, blood_type, allergies, medications, medical_notes, diseases) values (?,?,?,?,?,?,?,?,?)";
  try {
    var usr = req.body.user;
    var datas = [
      usr.name,
      usr.birthDate,
      usr.height,
      usr.weight,
      usr.bloodType,
      usr.allergies,
      usr.medications,
      usr.medicalNotes,
      usr.diseases.join(","),
    ];
    db.query(sql, datas, function (err, result) {
      if (err) {
        res.status(400).json({
          message: "MySQL error: " + err.message,
        });
        return;
      }

      var newUserId = result.insertId;
      var sql = "insert into sos (patient_id, patient_location) values (?, ?)";
      var datas = [newUserId, req.body.location];
      db.query(sql, datas, function (err, result) {
        if (err) {
          res.status(400).json({
            message: "MySQL error: " + err.message,
          });
          return;
        }

        var newSosId = result.insertId;
        res.status(200).json({
          message: "Succeeded!",
          sosId: newSosId,
        });

        // Send push notification
        // The topic name can be optionally prefixed with "/topics/".
        const topic = "SOS";

        const message = {
          data: {
            sosId: String(newSosId),
          },
          topic: topic,
        };

        // Send a message to devices subscribed to the provided topic.
        admin
          .messaging()
          .send(message)
          .then((response) => {
            // Response is a message ID string.
            console.log("Successfully sent sos message:", response);
          })
          .catch((error) => {
            console.log("Error sending sos message:", error);
          });
      });
    });
  } catch (e) {
    res.status(400).json({
      message: "Error while parsing 'user'.",
    });
    return;
  }
  return;
});

router.get("/:sos_id", (req, res) => {
  var sql =
    "select patient_location, name, birth_date, height, weight, blood_type, allergies, medications, medical_notes, diseases from sos inner join users on sos.patient_id = users.id where sos.id = ?";
  var datas = [req.params.sos_id];
  db.query(sql, datas, function (err, result) {
    if (err) {
      res.status(400).json({
        message: "MySQL error: " + err.message,
      });
      return;
    }
    res.status(200).json({
      patient: {
        name: result[0].name,
        birthDate: result[0].birth_date,
        height: result[0].height,
        weight: result[0].weight,
        bloodType: result[0].blood_type,
        allergies: result[0].allergies,
        medications: result[0].medications,
        medicalNotes: result[0].medical_notes,
        diseases: result[0].diseases.split(",").map(Number),
      },
      location: result[0].patient_location,
    });
  });
});

function distance(loc1, loc2) {
  // Reference:
  // https://cloud.google.com/blog/products/maps-platform/how-calculate-distances-map-maps-javascript-api?hl=en
  var loc1n = loc1.split(",").map(Number);
  var loc2n = loc2.split(",").map(Number);
  var lat1 = (loc1n[0] * Math.PI) / 180,
    lat2 = (loc2n[0] * Math.PI) / 180;
  var diffLat = lat1 - lat2;
  var lng1 = (loc1n[1] * Math.PI) / 180,
    lng2 = (loc2n[1] * Math.PI) / 180;
  var diffLng = lng1 - lng2;

  var R = 6371.071; // Use kilometers
  var d =
    2 *
    R *
    Math.asin(
      Math.sqrt(
        Math.sin(diffLat / 2) * Math.sin(diffLat / 2) +
          Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(diffLng / 2) *
            Math.sin(diffLng / 2)
      )
    );
  return d;
}

router.post("/:sos_id/rescuer/location", (req, res) => {
  var reqs = [];
  if (!req.body.location) reqs.push("location");
  if (reqs.length) {
    res.status(400).json({
      message: "No " + reqs.join(", ") + " specified.",
    });
    return;
  }

  var sql =
    "select patient_location, closest_rescuer_location from sos where id=?";
  var datas = [req.params.sos_id];
  db.query(sql, datas, function (err, result) {
    if (err) {
      res.status(400).json({
        message: "MySQL error: " + err.message,
      });
      return;
    }
    var patLoc = result[0].patient_location;
    var curLoc = result[0].closest_rescuer_location;
    var newLoc = req.body.location;
    if (
      curLoc === null ||
      distance(patLoc, curLoc) > distance(patLoc, newLoc)
    ) {
      var sql = "update sos set closest_rescuer_location=? where id=?";
      var datas = [newLoc, req.params.sos_id];
      db.query(sql, datas, function (err, result) {
        if (err) {
          res.status(400).json({
            message: "MySQL error: " + err.message,
          });
          return;
        }
        res.status(200).json({
          message: "Succeeded!",
        });
        return;
      });
    }
  });
});

router.post("/:sos_id/rescuer/accept", (req, res) => {
  var sql = "update sos set rescuers_num = rescuers_num + 1 where id=?";
  var datas = [req.params.sos_id];
  db.query(sql, datas, function (err, result) {
    if (err) {
      res.status(400).json({
        message: "MySQL error: " + err.message,
      });
      return;
    }
    res.status(200).json({
      message: "Succeeded!",
    });
  });
});

router.post("/:sos_id/rescuer/arrived", (req, res) => {
  var sql = "select arrived_rescuers_num from sos where id=?";
  var datas = [req.params.sos_id];
  db.query(sql, datas, function (err, result) {
    if (err) {
      res.status(400).json({
        message: "MySQL error: " + err.message,
      });
      return;
    }
    if (result[0].arrived_rescuers_num == 0) {
      var sql = "update sos set time_first_arrival = now() where id=?";
      var datas = [req.params.sos_id];
      db.query(sql, datas, function (err, result) {
        if (err) {
          res.status(400).json({
            message: "MySQL error: " + err.message,
          });
          return;
        }
      });
    }
    var sql =
      "update sos set arrived_rescuers_num = arrived_rescuers_num + 1 where id=?";
    var datas = [req.params.sos_id];
    db.query(sql, datas, function (err, result) {
      if (err) {
        res.status(400).json({
          message: "MySQL error: " + err.message,
        });
        return;
      }
      res.status(200).json({
        message: "Succeeded!",
      });
    });
  });
});

router.post("/:sos_id/done", (req, res) => {
  var sql = "update sos set done=1 where id=?";
  var datas = [req.params.sos_id];

  if (req.params.sos_id === 1) {
    res.status(200).json({
      message: "Succeeded!",
    });
    return;
  }

  db.query(sql, datas, function (err, result) {
    if (err) {
      res.status(400).json({
        message: "MySQL error: " + err.message,
      });
      return;
    }
    res.status(200).json({
      message: "Succeeded!",
    });
  });
});

router.get("/:sos_id/rescuers", (req, res) => {
  var sql =
    "select rescuers_num, patient_location, closest_rescuer_location, done from sos where id=?";
  var datas = [req.params.sos_id];
  db.query(sql, datas, function (err, result) {
    if (err) {
      res.status(400).json({
        message: "MySQL error: " + err.message,
      });
      return;
    }
    res.status(200).json({
      message: "Succeeded!",
      rescuerNum: result[0].rescuers_num,
      closestRescuerDistance:
        result[0].closest_rescuer_location === null
          ? -111111
          : distance(
              result[0].patient_location,
              result[0].closest_rescuer_location
            ),
      done: result[0].done === 0 ? false : true,
    });
  });
});

module.exports = router;

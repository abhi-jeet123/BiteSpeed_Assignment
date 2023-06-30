const express = require("express");
const contactController = require("../controllers/contactController");

const router = express.Router();

router
  .route("/")
  .get(contactController.GetAllContacts)
  .post(contactController.CreateContact);

module.exports = router;

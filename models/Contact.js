const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  phone: {
    type: String,
    //required: true,
  },
  email: {
    type: String,
    //required: true,
  },
  linkedId: {
    type: Number,
    default: null,
    //required: true,
  },
  linkPrecedence: {
    type: String,
    //required: true,
  },
});

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;

const Contact = require("../models/Contact");

exports.getContacts = () => {
  return Contact.find();
};

exports.createContact = (contact) => {
  return Contact.create(contact);
};

exports.updateContact = (contact) => {
  return contact.save();
};

exports.filterContactsByLinkPrecedence = (contacts, linkPrecedence) => {
  return contacts.filter(
    (contact) => contact.linkPrecedence === linkPrecedence
  );
};

exports.countContactsByProperty = (contacts, property, value) => {
  return contacts.filter((contact) => contact[property] === value).length;
};

exports.getSecondaryContacts = (id) => {
  return Contact.find({
    $or: [{ linkedId: id }, { id: id }],
  });
};

exports.getExistingContacts = (email, phone) => {
  return Contact.find({
    $or: [{ email: email }, { phone: phone }],
  });
};

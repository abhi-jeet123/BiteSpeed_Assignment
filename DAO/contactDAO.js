const Contact = require("../models/Contact");
const mongoose = require("mongoose");

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

exports.getParentPrimaryContacts = async (ids) => {
  try {
    const idsArray = Array.from(ids);
    const contacts = await Contact.find({ id: { $in: idsArray } }).sort('id').exec();

    console.log('Fetched Records:', contacts);
    return contacts;
  } catch (err) {
    console.error('Error fetching records:', err);
    return [];
  }
};

exports.updateAllLinkedIds = async (toUpdateId, UpdatedId) => {
  const contacts = await Contact.find({ linkedId: toUpdateId });
  contacts.forEach(async (cont) => {
    cont.linkedId = UpdatedId;
    await this.updateContact(cont);
  })
}


const { set } = require("../app");
const Contact = require("../models/Contact");
const DAO = require("../DAO/contactDAO");

exports.GetAllContacts = async (req, res) => {
  try {
    const contact = await DAO.getContacts();
    res.status(201).json({
      status: "success",
      data: {
        contact: contact,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

exports.CreateContact = async (req, res) => {
  try {
    const { phone, email } = req.body;
    const totalContact = await DAO.getContacts();
    const existingContacts = await DAO.getExistingContacts(email, phone);

    let primaryContacts = DAO.filterContactsByLinkPrecedence(
      existingContacts,
      "primary"
    );
    const secondaryContacts = DAO.filterContactsByLinkPrecedence(
      existingContacts,
      "secondary"
    );
    const phoneMatchedCount = DAO.countContactsByProperty(
      existingContacts,
      "phone",
      phone
    );
    const emailMatchedCount = DAO.countContactsByProperty(
      existingContacts,
      "email",
      email
    );

    let globalPrimaryId = null;
    if (
      phoneMatchedCount > 0 &&
      emailMatchedCount > 0

    ) {
      const parentPrimaryIds = new Set();

      existingContacts.map((contact) => {
        if (contact.linkedId != null) parentPrimaryIds.add(contact.linkedId)
        else parentPrimaryIds.add(contact.id);
      });
      const ParentPrimaryContacts = await DAO.getParentPrimaryContacts(parentPrimaryIds);

      const lastPrimaryContact = ParentPrimaryContacts[ParentPrimaryContacts.length - 1];
      lastPrimaryContact.linkPrecedence = "secondary";
      //for handling the case one primary one secondary or both primary
      lastPrimaryContact.linkedId = ParentPrimaryContacts[0].id
      globalPrimaryId = lastPrimaryContact.linkedId;
      //update the linked ids of the secondary contact
      await DAO.updateAllLinkedIds(lastPrimaryContact.id, lastPrimaryContact.linkedId);
      await DAO.updateContact(lastPrimaryContact);
    } else if (phoneMatchedCount === 0 && emailMatchedCount === 0) {
      const newContact = new Contact({
        id: totalContact.length + 1,
        phone: phone,
        email: email,
        linkPrecedence: "primary",
      });
      globalPrimaryId = newContact.id;
      await DAO.createContact(newContact);
      primaryContacts.push(newContact);
    } else if (
      (phoneMatchedCount > 0 && emailMatchedCount === 0) ||
      (phoneMatchedCount === 0 && emailMatchedCount > 0)
    ) {
      //need to create new record with linkedId as found primary id , and precedence as secondary
      const linkedId =
        primaryContacts.length > 0
          ? primaryContacts[0].id
          : secondaryContacts[0].linkedId;
      const newContact = new Contact({
        id: totalContact.length + 1,
        phone: phone,
        email: email,
        linkedId,
        linkPrecedence: "secondary",
      });
      globalPrimaryId = linkedId;
      await DAO.createContact(newContact);
    }

    const updatedSecondaryContacts = await DAO.getSecondaryContacts(
      globalPrimaryId
    );

    const [emails, phones, secondaryIds] = [[], [], []];
    updatedSecondaryContacts.map((contact) => {
      emails.push(contact.email);
      phones.push(contact.phone);
      if (contact.id != globalPrimaryId) secondaryIds.push(contact.id);
    });

    const response = {
      contacts: {
        primaryContatctId: globalPrimaryId,
        emails: [...new Set(emails)],
        phoneNumbers: [...new Set(phones)],
        secondaryContactIds: [...new Set(secondaryIds)],
      },
    };

    res.status(201).json({
      status: "success",
      data: response,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: err,
    });
  }
};

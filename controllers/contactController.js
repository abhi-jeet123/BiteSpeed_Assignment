const { set } = require("../app");
const Contact = require("../models/Contact");

exports.GetAllContacts = async (req, res) => {
  try {
    const contact = await Contact.find();
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
    const totalContact = await Contact.find();
    const existingContacts = await Contact.find({
      $or: [{ email: email }, { phone: phone }],
    });

    let primaryContacts = existingContacts.filter(
      (contact) => contact.linkPrecedence === "primary"
    );
    const secondaryContacts = existingContacts.filter(
      (contact) => contact.linkPrecedence === "secondary"
    );
    const phoneMatchedCount = existingContacts.filter(
      (contact) => contact.phone === phone
    ).length;
    const emailMatchedCount = existingContacts.filter(
      (contact) => contact.email === email
    ).length;

    if (
      phoneMatchedCount > 0 &&
      emailMatchedCount > 0 &&
      primaryContacts.length > 0
    ) {
      //logic
      //update contact function will be called to update the linked precdence and id
      const lastPrimaryContact = primaryContacts[primaryContacts.length - 1];
      lastPrimaryContact.linkPrecedence = "secondary";
      //for handling the case one primary one secondary or both primary
      lastPrimaryContact.linkedId =
        primaryContacts.length > 1
          ? primaryContacts[0].id
          : secondaryContacts[0].linkedId;
      await lastPrimaryContact.save();
    } else if (phoneMatchedCount === 0 && emailMatchedCount === 0) {
      const newContact = new Contact({
        id: totalContact.length + 1,
        phone: phone,
        email: email,
        linkPrecedence: "primary",
        // Set other properties as needed
      });

      await Contact.create(newContact);
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

      await Contact.create(newContact);
    }

    //const newContact = await Contact.create(req.body);

    const updatedSecondaryContacts = await Contact.find({
      linkedId: primaryContacts[0].id,
    });

    const [emails, phones, secondaryIds] = [[], [], []];
    updatedSecondaryContacts.map((contact) => {
      emails.push(contact.email);
      phones.push(contact.phone);
      secondaryIds.push(contact.id);
    });

    const response = {
      contacts: {
        primaryContatctId: primaryContacts[0].id,
        emails: [...new Set(emails)],
        phoneNumbers: [...new Set(phones)],
        secondaryContactIds: [...new Set(secondaryIds)],
      },
    };
    //JSON.stringify(response).replace("/", ""),
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

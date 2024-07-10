const { db } = require("../../config/admin");

// Get all contact controller
exports.listContacts = async (req, res) => {
  try {
    const contacts = [];

    const data = await db.collection("contact_details").get();
    data.forEach(async (doc) => {
      const contact = {
        id: doc.id,
        contactData: doc.data(),
      };
      contacts.push(contact);
    });
    return res.render("Contact/displayContacts", {
      contacts: contacts,
    });
  } catch (error) {
    const errors = [];
    errors.push(error.message);
    return res.render("Contact/displayContacts", {
      errors: errors,
    });
  }
};

// Get Details of Contact
exports.contactDetails = async (req, res) => {
  try {
    const errors = [];
    const id = req.params.contact_id;

    const data = await db.collection("contact_details").doc(id).get();
    if (data.data() === undefined) {
      errors.push({ msg: "Contact not found...!!" });
      return res.render("Errors/errors", { errors: errors });
    } else {
      const getUserById = await db
        .collection("users")
        .doc(data.data().contact_by);
      const getUser = await getUserById.get();
      let user = {
        id: getUser.id,
        userData: getUser.data(),
      };

      const contact = {
        id: data.id,
        contactData: data.data(),
        user: user,
      };

      return res.render("Contact/contactDetails", {
        contact: contact,
      });
    }
  } catch (error) {
    const errors = [];
    errors.push({ msg: error.message });
    return res.render("Errors/errors", { errors: errors });
  }
};

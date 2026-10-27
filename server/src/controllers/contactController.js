const Contact = require('../models/Contact');
const Location = require('../models/Location');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const listContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ contacts });
});

const createContact = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  if (!name || !phone) {
    throw new ApiError(400, 'Contact name and phone are required.');
  }

  const contact = await Contact.create({
    user: req.user._id,
    name,
    phone,
  });

  res.status(201).json({ contact });
});

const updateContact = async(req, res) => {
  try{
    const {name,phone} = req.body;
    if(!name || ! phone){
      return res.status(400).json({
        message:"Name and phone are required"
      });
    }
    const contact = await Contact.findOne({
     _id: req.params.contactId,
     user: req.user._id 
    });
    if(!contact){
      return res.json({
        message:"contact not found"
      });
    }
    contact.name = name;
    contact.phone = phone;
    await contact.save();
    res.status(200).json({contact});
  }catch(err){
    res.status(500).json({
      message:"Failed to update contact"
    });
  }
}


const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findOne({
    _id: req.params.contactId,
    user: req.user._id,
  });

  if (!contact) {
    throw new ApiError(404, 'Contact not found.');
  }

  const linkedLocation = await Location.findOne({
    user: req.user._id,
    contacts: contact._id,
  });

  if (linkedLocation) {
    throw new ApiError(400, 'Remove locations using this contact before deleting it.');
  }

  await contact.deleteOne();

  res.json({ message: 'Contact deleted.' });
});

module.exports = { listContacts, createContact,updateContact, deleteContact };

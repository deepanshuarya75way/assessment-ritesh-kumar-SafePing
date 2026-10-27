const express = require('express');
const { listContacts, createContact, deleteContact, updateContact } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listContacts);
router.post('/', createContact);
router.put('/:contactId', updateContact);
router.delete('/:contactId', deleteContact);

module.exports = router;

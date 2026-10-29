const express = require('express');
const { listContacts, createContact, deleteContact, updateContact } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listContacts);
router.post('/', createContact);
router.delete('/:contactId', deleteContact);
router.put('/:contactId', updateContact);

module.exports = router;

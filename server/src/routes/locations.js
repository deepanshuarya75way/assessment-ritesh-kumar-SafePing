const express = require('express');
const {
  listLocations,
  createLocation,
  deleteLocation,
  checkArrival,
  updateLocation,
} = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listLocations);
router.post('/', createLocation);
router.delete('/:locationId', deleteLocation);
router.post('/check', checkArrival);
router.put('/:locationId', updateLocation);

module.exports = router;

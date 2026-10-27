const express = require('express');
const {
  listLocations,
  createLocation,
  deleteLocation,
  checkArrival,
  updateLocation
} = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', listLocations);
router.post('/', createLocation);
router.delete('/:locationId', deleteLocation);
router.put('/:locationId',protect, updateLocation);
router.post('/check', checkArrival);

module.exports = router;

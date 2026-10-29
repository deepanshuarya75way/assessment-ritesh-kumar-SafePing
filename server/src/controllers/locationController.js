const Contact = require('../models/Contact');
const Location = require('../models/Location');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { detectArrival } = require('../services/locationService');

const listLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find({ user: req.user._id })
    .populate('contacts')
    .sort({ createdAt: -1 });

  res.json({ locations });
});

const createLocation = asyncHandler(async (req, res) => {
  const { name, latitude, longitude, radius, contactIds, message } = req.body;

  if (!name || latitude == null || longitude == null || !radius || !Array.isArray(contactIds) || !contactIds.length || !message) {
    throw new ApiError(400, 'All location fields are required.');
  }

  const contacts = await Contact.find({
    _id: { $in: contactIds },
    user: req.user._id,
  });

  if (contacts.length !== contactIds.length) {
    throw new ApiError(404, 'One or more selected contacts were not found.');
  }

  const location = await Location.create({
    user: req.user._id,
    name,
    coordinates: { latitude, longitude },
    radius,
    contacts: contacts.map((contact) => contact._id),
    message,
  });

  await location.populate('contacts');

  res.status(201).json({ location });
});





const deleteLocation = asyncHandler(async (req, res) => {
  const location = await Location.findOne({
    _id: req.params.locationId,
    user: req.user._id,
  });

  if (!location) {
    throw new ApiError(404, 'Location not found.');
  }

  await location.deleteOne();
  res.json({ message: 'Location deleted.' });
});

const checkArrival = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (latitude == null || longitude == null) {
    throw new ApiError(400, 'Current latitude and longitude are required.');
  }

  const result = await detectArrival({
    userId: req.user._id,
    point: { latitude, longitude },
  });

  if (!result) {
    return res.json({ message: 'No geofence matched.', log: null });
  }

  res.json({
    message: result.skipped ? 'Arrival already logged during cooldown.' : 'Arrival processed.',
    location: result.location,
    log: result.log,
    skipped: result.skipped,
  });
});

module.exports = { listLocations, createLocation, deleteLocation, checkArrival };

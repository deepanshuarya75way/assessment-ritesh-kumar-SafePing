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
  if(!(Number(radius) >= 50)) throw new ApiError(400,'Radius must be at least 50 meters');

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

const updateLocation = asyncHandler(async (req,res) => {
  const location = await Location.findOne({_id:req.params.locationId, user:req.user._id});
  if(!location) throw new ApiError(404,'Location not found');
  if(Object.keys(req.body).length === 1 && req.body.paused !== undefined){
    location.paused = Boolean(req.body.paused);
    await location.save();
    await location.populate('contacts');
    return res.json({location});
  }
  const {name, latitude, longitude, radius, contactIds, message} = req.body;
  if(name !== undefined){
    if(!String(name).trim()) throw new ApiError(400, 'Location name is Required');
  }
  if(message !== undefined){
    if(!String(message).trim()) throw new ApiError(400, 'message is Required');
  }
  if(latitude != null && longitude != null){
    location.coordinates = {latitude:Number(latitude), longitude:Number(longitude)};
  }
  if(radius !== undefined){
    if(!(Number(radius) >= 50)) throw new ApiError(400,'Radius must be at least 50 meters');
    location.radius = Number(radius);
  }
  if(contactIds !== undefined){
    if(!Array.isArray(contactIds) || !contactIds.length) throw new ApiError(400,'Select atleast one contactc');
    const contacts = await Contact.find({_id:{$in:contactIds}, user:req.user._id});
    if(contacts.length !== contactIds.length) throw new ApiError(404,'One or more selected contacts were not found');
    location.contacts = contacts.map((c) => c._id);
  }
  await location.save();
  await location.populate('contacts');
  res.json({location});
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
  if(result.skippedReason === 'paused'){
    return res.json({
      messagae:`No message sent : "${result.location.name}" is paused`,
      location:result.location,
      log:null,
      skipped:true,
      skippedReason:'paused',
    })
  }

  res.json({
    message: result.skipped ? 'Arrival already logged during cooldown.' : 'Arrival processed.',
    location: result.location,
    log: result.log,
    skipped: result.skipped,
  });
});

module.exports = { listLocations, createLocation, deleteLocation, checkArrival, updateLocation };

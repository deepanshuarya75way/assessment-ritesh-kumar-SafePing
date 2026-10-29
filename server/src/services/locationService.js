const ArrivalLog = require('../models/ArrivalLog');
const Location = require('../models/Location');
const calculateDistanceMeters = require('../utils/calculateDistance');
const { sendSms } = require('./smsService');

async function detectArrival({ userId, point }) {
  const locations = await Location.find({ user: userId }).populate('contacts');
  let blocked = null;

  for (const location of locations) {
    const distanceMeters = calculateDistanceMeters(point, location.coordinates);

    if (distanceMeters > location.radius) {
      continue;
    }
    if(location.paused){
      blocked = blocked || {location, log:null, skipped:true, skippedReason:'paused'};
      continue;
    }

    const cooldownBoundary = new Date(Date.now() - location.cooldownMinutes * 60 * 1000);
    const recentLog = await ArrivalLog.findOne({
      user: userId,
      location: location._id,
      sentAt: { $gte: cooldownBoundary },
    });

    if (recentLog) {
      await recentLog.populate('location');
      return { location, log: recentLog, skipped: true };
    }

    const deliveryResults = await Promise.all(
      location.contacts.map(async (contact) => {
        const smsResult = await sendSms({
          to: contact.phone,
          body: location.message,
        });

        return {
          contactName: contact.name,
          phone: contact.phone,
          deliveryStatus: smsResult.deliveryStatus,
          sid: smsResult.providerResponse?.sid,
          error: smsResult.providerResponse?.error,
        };
      }),
    );

    const statuses = deliveryResults.map((result) => result.deliveryStatus);
    let aggregateStatus = 'sent';

    if (statuses.every((status) => status === 'failed')) {
      aggregateStatus = 'failed';
    } else if (statuses.every((status) => status === 'simulated')) {
      aggregateStatus = 'simulated';
    } else if (statuses.some((status) => status === 'failed')) {
      aggregateStatus = 'partial';
    } else if (statuses.some((status) => status === 'simulated') && statuses.some((status) => status === 'sent')) {
      aggregateStatus = 'partial';
    }

    const log = await ArrivalLog.create({
      user: userId,
      location: location._id,
      contactSnapshots: location.contacts.map((contact) => ({
        name: contact.name,
        phone: contact.phone,
      })),
      message: location.message,
      distanceMeters,
      deliveryStatus: aggregateStatus,
      providerResponses: deliveryResults,
      sentAt: new Date(),
    });

    await log.populate('location');

    return { location, log, skipped: false };
  }

  return blocked;
}

module.exports = { detectArrival };

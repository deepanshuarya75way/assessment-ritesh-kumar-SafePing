const twilio = require('twilio');
const env = require('../config/env');

let client = null;
const isSimulatedMode = env.smsMode === 'simulated';

const hasValidTwilioConfig =
  typeof env.twilioSid === 'string' &&
  env.twilioSid.startsWith('AC') &&
  Boolean(env.twilioAuthToken) &&
  Boolean(env.twilioPhone);

if (!isSimulatedMode && hasValidTwilioConfig) {
  client = twilio(env.twilioSid, env.twilioAuthToken);
}

async function sendSms({ to, body }) {
  if (!client) {
    return {
      deliveryStatus: 'simulated',
      providerResponse: {
        sid: 'simulated-message',
        error: isSimulatedMode ? 'SMS simulation mode is enabled.' : 'Twilio credentials are missing or invalid.',
      },
    };
  }

  try {
    const response = await client.messages.create({
      to,
      from: env.twilioPhone,
      body,
    });

    return {
      deliveryStatus: 'sent',
      providerResponse: {
        sid: response.sid,
      },
    };
  } catch (error) {
    return {
      deliveryStatus: 'failed',
      providerResponse: {
        error: error.message,
      },
    };
  }
}

module.exports = { sendSms };

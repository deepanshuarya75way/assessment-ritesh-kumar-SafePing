const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const readEnv = (key, fallback = '') => (process.env[key] || fallback).trim();

module.exports = {
  nodeEnv: readEnv('NODE_ENV', 'development'),
  port: readEnv('PORT', '5000'),
  mongoUri: readEnv('MONGO_URI', 'mongodb://127.0.0.1:27017/safeping'),
  jwtSecret: readEnv('JWT_SECRET', 'change-me'),
  jwtExpiresIn: readEnv('JWT_EXPIRES_IN', '7d'),
  smsMode: readEnv('SMS_MODE', 'live').toLowerCase(),
  twilioSid: readEnv('TWILIO_SID'),
  twilioAuthToken: readEnv('TWILIO_AUTH_TOKEN'),
  twilioPhone: readEnv('TWILIO_PHONE'),
  clientUrl: readEnv('CLIENT_URL', 'http://localhost:5173'),
};

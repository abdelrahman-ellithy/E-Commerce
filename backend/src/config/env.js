import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const required = ['MONGO_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Copy backend/.env.example to backend/.env and fill in the values.'
  );
}

if (isProduction && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long in production.');
}

export const env = Object.freeze({
  nodeEnv,
  isProduction,
  isTest,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  seed: {
    adminName: process.env.SEED_ADMIN_NAME || 'Admin User',
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@luma.dev',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
    userName: process.env.SEED_USER_NAME || 'Demo Customer',
    userEmail: process.env.SEED_USER_EMAIL || 'demo@luma.dev',
    userPassword: process.env.SEED_USER_PASSWORD || 'Demo123!',
  },
});

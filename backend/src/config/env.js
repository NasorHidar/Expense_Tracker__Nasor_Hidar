require("dotenv").config();

const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
};

// Validate required environment variables
const requiredVariables = ["DATABASE_URL", "JWT_SECRET"];
for (const variable of requiredVariables) {
  if (!env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

module.exports = env;

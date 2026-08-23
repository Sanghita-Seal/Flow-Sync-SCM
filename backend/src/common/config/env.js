import "dotenv/config";

const env = {
  port: Number(process.env.PORT) || 5000,

  databaseUrl: process.env.DATABASE_URL,

  nodeEnv: process.env.NODE_ENV || "development",

  neonAuthUrl: process.env.NEON_AUTH_URL,
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is not defined in .env");
}

export default env;
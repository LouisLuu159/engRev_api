import { registerAs } from '@nestjs/config';

export default registerAs('base', () => ({
  node_env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT) || 3000,
  jwt: {
    at: {
      secrete: process.env.JWT_ACCESSTOKEN_SECRETE,
      expire: process.env.JWT_ACCESSTOKEN_EXPIRATION,
    },
    rt: {
      secrete: process.env.JWT_REFRESHTOKEN_SECRETE,
      expire: process.env.JWT_REFRESHTOKEN_EXPIRATION,
    },
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
}));

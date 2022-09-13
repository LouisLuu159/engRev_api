import { registerAs } from '@nestjs/config';

export const BaseConfigKey = {
  NODE_ENV: 'base.node_env',
  PORT: 'base.port',
  ACCESS_TOKEN_SECRET: 'base.at_secrete',
  ACCESS_TOKEN_EXPIRE: 'base.at_expire',
  REFRESH_TOKEN_SECRET: 'base.rt_secrete',
  REFRESH_TOKEN_EXPIRE: 'base.rt_expire',
  REDIS: 'base.redis',
  RATE_LIMIT: 'base.throttle',
  USER_WEB_URL: 'base.user_web_url',
};

export default registerAs('base', () => ({
  node_env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT) || 3000,

  at_secrete: process.env.JWT_ACCESSTOKEN_SECRETE,
  at_expire: process.env.JWT_ACCESSTOKEN_EXPIRATION,
  rt_secrete: process.env.JWT_REFRESHTOKEN_SECRETE,
  rt_expire: process.env.JWT_REFRESHTOKEN_EXPIRATION,

  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },

  throttle: {
    ttl: 60,
    limit: 20,
  },

  user_web_url: 'http://localhost:5001',
}));

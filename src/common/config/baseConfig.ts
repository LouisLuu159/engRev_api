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
  ADMIN_KEY: 'base.admin_key',
  ADMIN_SECRETE: 'base.admin_secrete',
  AWS_SECRETE_KEY: 'base.aws.secrete_key',
  AWS_ACCESS_KEY: 'base.aws.access_key',
  AWS_REGION: 'base.aws.region',
  AWS_BUCKET: 'base.aws.bucket',
};

export default registerAs('base', () => ({
  node_env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT) || 3000,

  at_secrete: process.env.JWT_ACCESSTOKEN_SECRETE,
  at_expire: process.env.JWT_ACCESSTOKEN_EXPIRATION,
  rt_secrete: process.env.JWT_REFRESHTOKEN_SECRETE,
  rt_expire: process.env.JWT_REFRESHTOKEN_EXPIRATION,

  redis: {
    host: 'localhost',
    port: Number(process.env.REDIS_PORT),
  },

  throttle: {
    ttl: 60,
    limit: 20,
  },

  user_web_url: process.env.USER_WEB_URL,

  admin_secrete: '$2a$10$o6NJz795S4tTR5TvYTxhS.pB/Vc5kXcY8eT1QIytNa9NowZ5A7HB6',
  admin_key: process.env.ADMIN_KEY,

  aws: {
    access_key: process.env.AWS_ACCESS_KEY,
    secrete_key: process.env.AWS_SECRETE_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET,
  },
}));

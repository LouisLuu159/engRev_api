import { registerAs } from '@nestjs/config';

export default registerAs('elasticSearch', () => ({
  NODE: process.env.ELASTIC_NODE,
  USERNAME: process.env.ELASTIC_USERNAME,
  PASSWORD: process.env.ELASTIC_PASSWORD,
}));

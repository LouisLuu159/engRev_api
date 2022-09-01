require('dotenv').config();

module.exports = [
  {
    type: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: ['dist/**/entities/*.entity.js'],
    migrations: ['dist/db/migrations/*.js'],

    cli: {
      migrationsDir: 'src/db/migrations',
    },
  },
  {
    name: 'seed',
    type: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
    entities: ['dist/**/entities/*.entity.js'],
    migrations: ['dist/db/seeds/*.js'],

    cli: {
      migrationsDir: 'src/db/seeds',
    },
  },
];

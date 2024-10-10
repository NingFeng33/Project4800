const { Sequelize } = require("sequelize");
process.env.TZ = 'America/Vancouver';
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  dialectOptions: {
    charset: "utf8mb4",
    timezone: '-07:00',
  },
  logging: false,
});

module.exports = { sequelize };
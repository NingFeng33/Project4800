process.env.TZ = 'America/Vancouver';
console.log("Current timezone set in Node.js:", process.env.TZ);
console.log("Current time according to Node.js:", new Date().toString());
console.log("UTC time according to Node.js:", new Date().toUTCString());
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  dialectOptions: {
    charset: "utf8mb4",
    timezone: 'local',
  },
  logging: false,
});

module.exports = { sequelize };
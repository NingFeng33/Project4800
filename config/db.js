const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("project4800", "root", "5333", {
  host: "localhost",
  dialect: "mysql",
  dialectOptions: {
    charset: "utf8mb4",
  },
  logging: false,
});

module.exports = { sequelize };

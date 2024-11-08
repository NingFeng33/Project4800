// models/program.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Program = sequelize.define(
    "Program",
    {
        program_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        program_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    },
    {
        tableName: "Program",
        timestamps: false
    }
);

module.exports = Program;

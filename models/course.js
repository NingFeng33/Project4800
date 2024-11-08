// models/course.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Course = sequelize.define("Course", {
    course_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_code: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    course_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    faculty_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Faculty",
            key: "faculty_id"
        }
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Class",
            key: "class_id"
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "User",
            key: "user_id"
        }
    },
    program_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "Program",
            key: "program_id"
        }
    },
    length_week: {
        type: DataTypes.INTEGER,
        allowNull: true  
    },
    size: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: "Courses",
    timestamps: false
});

module.exports = Course;

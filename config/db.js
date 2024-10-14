const { Sequelize } = require('sequelize');

// Create a Sequelize instance using environment variables
const sequelize = new Sequelize(
  process.env.DB_NAME,         // Database name
  process.env.DB_USER,         // MySQL username
  process.env.DB_PASSWORD,     // MySQL password
  {
    host: process.env.DB_HOST,   // MySQL host
    dialect: 'mysql',            // MySQL
    port: process.env.DB_PORT,   // MySQL port
  }
);

sequelize.sync({ alter: true })  
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });


// Function to initialize database connection
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = { sequelize, initializeDatabase };

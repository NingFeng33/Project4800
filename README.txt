npm install dotenv express express-session body-parser sequelize bcrypt connect-session-sequelize mysql2 ejs

Navigate to ./config/db.js
Change parameters to your mysql login credential 

Steps to test the code.

1. run node createTestUsers.js to populate test users.
2. run node app.js to start the server.
3. open web browser and navigate to your localhost:PORT
4. test login and registration with provided credentials in createTestUsers.js



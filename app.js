// app.js
require('dotenv').config();

const express = require('express');
const app = express();

app.use(express.static('pbulic'));

// Other imports and application setup code
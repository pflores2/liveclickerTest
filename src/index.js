// Liveclicker Development team interview process "take-home" test
// By Pablo Flores 

// This is the codebase to run:
// 1) User API in /users/api
// 2) UI for testing the API
// They could be in separate projects, but implemented in 1 project for simplicity purposes. 
// (although the UI access data only through the API)
// An API test suite is also provided in usersAPI.test.js

const express = require('express');
const engine = require('ejs-mate');
const morgan = require('morgan');
const path = require('path');
const passport = require('passport');
const session = require('express-session');

const app = express();

// Initializations
require ('./passport/local-auth');

// Settings
app.set('port', process.env.PORT || 3000);  // Run in port 3000 by default

// UI rendering engine settings
app.engine('ejs', engine);
app.set('view engine', 'ejs');              
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(morgan('dev'));         // Useful for debugging 

app.use(express.urlencoded({ extended: false }));   //to obtain data from POST and/or URL parameters
app.use(express.json());   

app.use(session({               // UI session parameters
    secret: 'liveclickersecretUIsession',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize()); // API authentication
app.use(passport.session());

// Routes
app.use(require('./routes/UI'));                        // UI routes
app.use('/api/users', require('./routes/usersAPI'));    // API routes
app.use('/api/usersImage', require('./routes/usersImageAPI'));    // API routes

// Starting the server
app.listen(app.get('port'), () => {
    console.log('Running on port', app.get('port'));
})
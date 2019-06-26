const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const usersModel = require('../models/users');


// Login local strategy
passport.use('local-signin', new LocalStrategy ( {
    usernameField: 'email_address',
    passwordField: 'password'
}, (email, password, done) => {

    // Check user exists
    const user = usersModel.read({ email_address: email});
    if (!user) return done(null, false, { message: 'User not found'});

    // Validate password
    if (!usersModel.validatePassword(email, password)) return done(null, false, { message: 'Incorrect password'});

    // Password was validated
    done (null, user);  
}))


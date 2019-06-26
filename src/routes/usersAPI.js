// Users API routes

const express = require('express');
const routerAPI = express.Router();
const usersModel = require('../models/users');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const _ = require('underscore');

const admin_user = "admin@foo.com";
usersModel.initialize();

// Logs the user into the system
routerAPI.post('/login', (req, res, next) => {
    const user = req.body;
    if(!user.email_address || !user.password) {
        return res.status(422).json({ error: 'No email or password provided' });
    }
  
    return passport.authenticate('local-signin', { session: false }, (err, passportUser, info) => {
        if(err) return next(err);
        if(!passportUser) return res.status(400).json({ error: 'Coulld not login properly'});  

        const user = passportUser;

        // Generate the token
        const today = new Date();
        const expirationDate = new Date(today);
        expirationDate.setDate(today.getDate() + 2);    // expire the token in 2 days
        user.token = jwt.sign({
            email_address: user.email_address,
            exp: parseInt(expirationDate.getTime() / 1000, 10),
        }, usersModel.secret);

        // Return the user with his token, for further authorizations
        return res.json({ user });
        
    }) (req, res, next);
});


// Middleware to make sure the user is authenticated -- further functions require authorization token
routerAPI.use ((req, res, next) => {
    // Get token from bearer header
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        return res.status(403).json({ error: 'No bearer header' });
    }
    const token = bearerHeader.split(' ')[1];

    if (!token) return res.status(403).json({ error: 'No token provided' });    

    // verify and decode the token
    jwt.verify(token, usersModel.secret, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Failed to verify token' });

        // User is properly authenticated. Save decoded token information for further access and allow access to next methods.
        req.decoded = decoded;
        req.isAdmin = (decoded.email_address == admin_user);
        next();
    });  
});

// List users (not a requirement, implemented for UI)
routerAPI.post('/list', (req, res) => { 
    if (!req.isAdmin) {
        return res.status(500).json({ error: 'Only admin can access this.'});
    }
    res.json(usersModel.list());
});

// Another middleware to confirm whether the user is admin or is acting on himself.
routerAPI.use ((req, res, next) => {
    if (!req.body.email_address) return res.status(403).json({ error: 'No email address provided' }); 
    if (!req.isAdmin && req.body.email_address != req.decoded.email_address) return res.status(403).json({ error: "Cannot access another user's information" });
    next();
});


// Returns information of a user
routerAPI.post('/read', (req, res) => {
    const usr = usersModel.read(req.body);
    if (!usr) return res.status(500).json({ error: 'No user with provided email'});

    res.json(usr);
});


// Creates a user
routerAPI.post('/create', (req, res) => { 
    if (!req.body.password) return res.status(400).json({ error: 'No password specified'});

    usersModel.create(req.body);
    res.json({});
});    


// Updates information of a user
routerAPI.post('/update', (req, res) => {
    const usr = usersModel.update(req.body);
    if (!usr) return res.status(400).json({ error: 'No user with provided email'});

    return res.json({});
});


// Deletes user
routerAPI.post('/delete', (req, res) => {
    const users = usersModel.delete(req.body);
    if (!users) return res.stetus(400).json({ error: 'No user with provided email'});

    return res.json({});
});



module.exports = routerAPI;
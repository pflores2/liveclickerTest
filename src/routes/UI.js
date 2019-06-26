// UI routes

const express = require('express');
const routerUI = express.Router();
const request = require('request');

// path and headers for API requests
const path = "http://localhost:3000/api/users/";    // Set this value according to API location
const headers = { "content-type": "application/json" } ;

const admin_user = "admin@foo.com";
var isAdmin = false;

// Homepage
routerUI.get('/', (req, res) => {
    // Render home with parameters
    res.render('home', {
        loggedIn: !(req.session.user == null),
        user: req.session.user,
        isAdmin: isAdmin
    });
});


// Login from UI
routerUI.post('/login', (req, res) => {
    request.post({ 
        "headers": headers,
        "url": path+"login",
        "body": JSON.stringify({
            email_address: req.body.email,
            password: req.body.password
        })
    }, (error, response, body) => {
        if (error) return res.redirect ('/');
        const bodyJSON = JSON.parse(body);
        if (bodyJSON.error) return res.redirect ('/');  

        // User logged in properly. Set parameters for further UI calls
        req.session.user = bodyJSON.user;
        isAdmin = (req.body.email == admin_user);
        headers['Authorization'] = ' Bearer ' + bodyJSON.user.token;

        // Send to admin or profile page
        if (isAdmin) res.redirect('admin');
        else res.redirect('profile');

    })
});


// Logout (just from UI, the API access continues to work until the token expires)
routerUI.get('/logout', (req, res) => {
    req.session.user=null;
    res.redirect('/');
});


// Profile page
routerUI.get('/profile', (req, res) => {
    if (!req.session.user) return res.render('adminError', { "error": 'Not logged in. Cannot access this page' } ); 

    request.post({ 
        "headers": headers,
        "url": path+"read",        
        "body": JSON.stringify({
            email_address: req.session.user.email_address,
            token: req.session.user.token
        })
    }, (error, response, body) => {
        if (error || JSON.parse(body).error ) res.render('userError', { "error": "Session error" }) ;

        res.render('profile', { "user": JSON.parse(body)});
    }); 
});

// Admin homepage
routerUI.get('/admin', (req, res) => {
    if (!req.session.user || !isAdmin) return res.render('adminError', { "error": 'Cannot access this page' } ); 

    request.post({ 
        "headers": headers,
        "url": path+"list",        
    }, (error, response, body) => {
        if(error) return res.render('adminError', { "error": "Unknown error" }) ;

        res.render('adminHome', { "users": JSON.parse(body)});        
    }); 
});

// Create user 
routerUI.post('/admin/create', (req, res) => {
    if (!req.session.user || !isAdmin) return res.render('adminError', { "error": 'Cannot access this page' } ); 

    request.post({ 
        "headers": headers,
        "url": path+"create",        
        "body": JSON.stringify(req.body)
        }, (error, response, body) => {
            if(error) return res.render('adminError', { "error": "Unknown error" }) ;
            const err = JSON.parse(body).error;
            if ( err ) return res.render('adminError', { "error": err }) ;

            res.redirect('/admin');
        }
    ); 
});  


// Read info from user
routerUI.post('/admin/read', (req, res) => {
    if (!req.session.user) return res.render('adminError', { "error": 'Not logged in. Cannot access this page' } ); 
    request.post({ 
        "headers": headers,
        "url": path+"read",        
        "body": JSON.stringify(req.body)
        }, (error, response, body) => {
            if(error) return res.render('adminError', { "error": "Unknown error" }) ;
            const err = JSON.parse(body).error;
            if (err) return res.render('adminError', { "error": err }) ;

            res.render('adminUserInfo', { "user": JSON.parse(body)});
        }
    ); 
});


// Update user info
routerUI.post('/admin/update', (req, res) => {
    if (!req.session.user) return res.render('adminError', { "error": 'Not logged in. Cannot access this page' } ); 
    request.post({ 
        "headers": headers,
        "url": path+"update",
        "body": JSON.stringify(req.body)
        }, (error, response, body) => {
            if(error) return res.render('adminError', { "error": "Unknown error" }) ;
            const err = JSON.parse(body).error;
            if (err) return res.render('adminError', { "error": err }) ;

            res.redirect(isAdmin? '/admin' : '/profile');
        }
    ); 
});

// Delete user
routerUI.post('/admin/delete', (req, res) => {
    if (!req.session.user) return res.render('adminError', { "error": 'Not logged in. Cannot access this page' } ); 
    request.post({ 
        "headers": headers,
        "url": path+"delete",        
        "body": JSON.stringify(req.body)
        }, (error, response, body) => {
            if(error) return res.render('adminError', { "error": "Unknown error" }) ;
            const err = JSON.parse(body).error;
            if (err) return res.render('adminError', { "error": err }) ;

            res.redirect(isAdmin ? '/admin' : '/logout');
        }
    ); 
});



module.exports = routerUI;
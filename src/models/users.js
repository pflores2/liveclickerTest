// Users data access
// The users data are stored in a json 

const model = {};
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const _ = require('underscore');

// secret for password encryption
model.secret = "my_secret";

// Load initial dataset
var users;
model.initialize = () => {
    users = require('./users_sample.json'); 
}

// Add user to users list
model.create = (data) => {
    const ins = { 
        email_address:  data.email_address.toLowerCase().trim(),
        password:       bcrypt.hashSync(data.password, bcrypt.genSaltSync(10)),
        first_name:     data.first_name,
        last_name:      data.last_name
    };
    users.push(ins);
    return true;
}

// Retrieve user's data, taking care of not returning the user's password
model.read = (data) => {
    const email = data.email_address.toLowerCase().trim();
    const usr = _.find(users, (user) => {
        return (user.email_address == email);
    }); 
    if (!usr) return false;
    return { 
        email_address: usr.email_address,
        first_name: usr.first_name,
        last_name: usr.last_name
    }
};

// Update user's data
model.update = (data) => {
    const email_address = data.email_address.toLowerCase().trim();
    const { password, first_name, last_name } = data;
    const usr = _.find(users, (user) => {
        return (user.email_address == email_address);
    }); 
    if (!usr) return false;       // Email not found
    if (password) usr.password=bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    if (first_name) usr.first_name=first_name;
    if (last_name) usr.last_name=last_name;
    
    return true;
};


// Remove user from uesr's list
model.delete = (data) => {
    const email = data.email_address.toLowerCase().trim();
    var found = false;
    const usr = _.find(users, (user, i) => {
        if (user.email_address == email) {
            users.splice(i, 1);
            found = true;
            return true;
        }
    });
    return found;
};

// Return list of users, taking care of not returning the passwords
model.list = () => {
    const users_return = [];
    _.each(users, (user) => {
        users_return.push({
            email_address: user.email_address,
            first_name: user.first_name,
            last_name: user.last_name    
        });
    });
    return users_return;
};

// Password validation
model.validatePassword = (email, password) => {
    email = email.toLowerCase().trim();
    const usr = _.find(users, (user) => {
        return (user.email_address == email);
    }); 
    if (usr) {
        return bcrypt.compareSync(password, usr.password);
    }
};

// Token generation
model.generateJWT = (email) => {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 2);    // expire the token in 2 days
  
    return jwt.sign({
        email_address: email,
        exp: parseInt(expirationDate.getTime() / 1000, 10),
    }, auth.secret);
}


module.exports = model;
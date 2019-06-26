const request = require('request');
const _ = require('underscore');
const headers = { "content-type": "application/json" } ;
const path = "http://localhost:3000/api/users/";    


// First cleanup the users list to remove data that could alter the tests
const usersModel = require('../models/users');
usersModel.initialize();

// Check secure APIs are only accessible being logged in
const restrictedAPIs = ["create", "delete", "list", "read", "update"];  
_.each(restrictedAPIs, (api) => {
    test(api + " API shouldn't be accessible without token", (done) => {

        request.post({ 
            "headers": headers,
            "url": path + api
        }, (error, response, body) => { 
            expect(error).toBeFalsy();
            expect(JSON.parse(body).error).toBe('No bearer header');
            done();
        });
    });
});

_.each(restrictedAPIs, (api) => {
    test(api + " API shouldn't be accessible with wrong token", (done) => {

        headers['Authorization'] = ' Bearer ' + 'made-up-token';
        request.post({ 
            "headers": headers,
            "url": path + api    
        }, (error, response, body) => { 
            expect(error).toBeFalsy();
            expect(JSON.parse(body).error).toBe('Failed to verify token');
            done();
        });
    });
});

test("Log in as admin", (done) => { 
    request.post({ 
        "headers": headers,
        "url": path + "login",
        "body": JSON.stringify({
                email_address: "admin@foo.com",
                password: "admin"
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).toBeFalsy();
        expect(bodyJSON.user.email_address).toBe("admin@foo.com");
        expect(bodyJSON.user.token).not.toBeFalsy();
        headers['Authorization'] = " Bearer " + bodyJSON.user.token ;    // From now on we'll use the authorization token
        done();
    });
})


test("Crete new user as admin + Read user", (done) => {
    request.post({ 
        "headers": headers,
        "url": path + "create",
        "body": JSON.stringify({
                email_address: "ed@sheeran.com",
                password: "edsheeran2",
                first_name: "Ed",
                last_name: "Sheeran"
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).toBeFalsy();

        request.post({ 
            "headers": headers,
            "url": path + "read",
            "body": JSON.stringify({
                    email_address: "ed@sheeran.com"
            })
        }, (error, response, body) => { 
            expect(error).toBeFalsy();
            const bodyJSON = JSON.parse(body);
            expect(bodyJSON.error).toBeFalsy();
            expect(bodyJSON.email_address).toBe('ed@sheeran.com');
            expect(bodyJSON.first_name).toBe('Ed');
            expect(bodyJSON.last_name).toBe('Sheeran');
            done();
        });
    });
})

test("Log in with newly created user", (done) => { 
    request.post({ 
        "headers": headers,
        "url": path + "login",
        "body": JSON.stringify({
                email_address: "ed@sheeran.com",
                password: "edsheeran2"
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).toBeFalsy();
        expect(bodyJSON.user.email_address).toBe("ed@sheeran.com");
        expect(bodyJSON.user.token).not.toBeFalsy();
        // Not updating the headers, so we'll continue as admin
        done();
    });
})


test("Crete new user without email_address should fail", (done) => {
    request.post({ 
        "headers": headers,
        "url": path + "create",
        "body": JSON.stringify({
                password: "brunomars3",
                first_name: "Bruno",
                last_name: "Mars"
        })
    }, (error, response, body) => { 
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).not.toBeFalsy();
        done();
    });
})

test("Crete new user without password should fail", (done) => {
    request.post({ 
        "headers": headers,
        "url": path + "create",
        "body": JSON.stringify({
                email_address: "bruno@mars.com",
                first_name: "Bruno",
                last_name: "Mars"
        })
    }, (error, response, body) => { 
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).not.toBeFalsy();
        done();
    });
})

test("Read inexistent user should fail", (done) => {
    request.post({ 
        "headers": headers,
        "url": path + "read",
        "body": JSON.stringify({
                email_address: "bruno@mars.com",
        })
    }, (error, response, body) => { 
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).not.toBeFalsy();
        done();
    });
})

test("Update inexistent user should fail", (done) => {
    request.post({ 
        "headers": headers,
        "url": path + "update",
        "body": JSON.stringify({
                email_address: "bruno@mars.com",
                password: "brunomars3",
                first_name: "Bruno",
                last_name: "Mars"
        })
    }, (error, response, body) => { 
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).not.toBeFalsy();
        done();
    });
})

test("Update user information as admin", (done) => {
    request.post({ 
        "headers": headers,
        "url": path + "update",
        "body": JSON.stringify({
                email_address: "ed@sheeran.com",
                password: "edsheeran3",
                first_name: "Edward Christopher",
                last_name: "Sheeran Angelo"
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).toBeFalsy();

        request.post({ 
            "headers": headers,
            "url": path + "read",
            "body": JSON.stringify({
                    email_address: "ed@sheeran.com"
            })
        }, (error, response, body) => { 
            expect(error).toBeFalsy();
            const bodyJSON = JSON.parse(body);
            expect(bodyJSON.error).toBeFalsy();
            expect(bodyJSON.email_address).toBe('ed@sheeran.com');
            expect(bodyJSON.first_name).toBe('Edward Christopher');
            expect(bodyJSON.last_name).toBe('Sheeran Angelo');
            done();
        });
    });
})

test("Log in with updated user", (done) => { 
    request.post({ 
        "headers": headers,
        "url": path + "login",
        "body": JSON.stringify({
                email_address: "ed@sheeran.com",
                password: "edsheeran3"
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).toBeFalsy();
        expect(bodyJSON.user.email_address).toBe("ed@sheeran.com");
        expect(bodyJSON.user.token).not.toBeFalsy();
        // Not updating the headers, so we'll continue as admin
        done();
    });
})

test("Create new user for further tests", (done) => { 
    request.post({ 
        "headers": headers,
        "url": path + "create",
        "body": JSON.stringify({
            email_address: "bruno@mars.com",
            password: "brunomars3",
            first_name: "Bruno",
            last_name: "Mars"
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).toBeFalsy();
        done();
    });
});


test("Delete user as admin", (done) => { 
    request.post({ 
        "headers": headers,
        "url": path + "delete",
        "body": JSON.stringify({
                email_address: "ed@sheeran.com"
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).toBeFalsy();

        request.post({ 
            "headers": headers,
            "url": path + "read",
            "body": JSON.stringify({
                    email_address: "ed@sheeran.com"
            })
        }, (error, response, body) => { 
            expect(error).toBeFalsy();
            const bodyJSON = JSON.parse(body);
            expect(bodyJSON.error).not.toBeFalsy();
            done();
        });
    });
})

test("Log in with deleted user should fail", (done) => { 
    request.post({ 
        "headers": headers,
        "url": path + "login",
        "body": JSON.stringify({
                email_address: "ed@sheeran.com",
                password: "edsheeran3"
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).not.toBeFalsy();
        done();
    });
})

test("Log in with deleted user should fail", (done) => { 
    request.post({ 
        "headers": headers,
        "url": path + "login",
        "body": JSON.stringify({
                email_address: "bruno@mars.com",
                password: "brunomars3"
        })
    }, (error, response, body) => { 
        headers['Authorization'] = " Bearer " + JSON.parse(body).user.token ;    // From now on we'll use the authorization token
        done();
    });
});

_.each(restrictedAPIs, (api) => {
    test(api + " API shouldn't be accessible for non-admins (not refering to himself)", (done) => {

        request.post({ 
            "headers": headers,
            "url": path + api,
            "url": path + "create",
            "body": JSON.stringify({
                    email_address: "admin@foo.com",
                    password: "admin",
                    first_name: "Change / New",
                    last_name: "Admin"
            })    
        }, (error, response, body) => { 
            expect(error).toBeFalsy();
            expect(JSON.parse(body).error).not.toBeFalsy();
            done();
        });
    });
});

test("Read own user", (done) => { 
    request.post({ 
        "headers": headers,
        "url": path + "read",
        "body": JSON.stringify({
                email_address: "bruno@mars.com"
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).toBeFalsy();
        expect(bodyJSON.email_address).toBe('bruno@mars.com');
        expect(bodyJSON.first_name).toBe('Bruno');
        expect(bodyJSON.last_name).toBe('Mars');
        done();
    });
});

test("Update own user", (done) => {
    request.post({ 
        "headers": headers,
        "url": path + "update",
        "body": JSON.stringify({
                email_address: "bruno@mars.com",
                password: "brunomars4",
                first_name: "Peter Gene",
                last_name: "Hernandez"
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).toBeFalsy();

        request.post({ 
            "headers": headers,
            "url": path + "read",
            "body": JSON.stringify({
                    email_address: "bruno@mars.com"
            })
        }, (error, response, body) => { 
            expect(error).toBeFalsy();
            const bodyJSON = JSON.parse(body);
            expect(bodyJSON.error).toBeFalsy();
            expect(bodyJSON.email_address).toBe('bruno@mars.com');
            expect(bodyJSON.first_name).toBe('Peter Gene');
            expect(bodyJSON.last_name).toBe('Hernandez');
            done();
        });
    });
})

test("Delete own user", (done) => {
    request.post({ 
        "headers": headers,
        "url": path + "delete",
        "body": JSON.stringify({
                email_address: "bruno@mars.com",
        })
    }, (error, response, body) => { 
        expect(error).toBeFalsy();
        const bodyJSON = JSON.parse(body);
        expect(bodyJSON.error).toBeFalsy();

        request.post({ 
            "headers": headers,
            "url": path + "read",
            "body": JSON.stringify({
                    email_address: "bruno@mars.com"
            })
        }, (error, response, body) => { 
            expect(error).toBeFalsy();
            const bodyJSON = JSON.parse(body);
            expect(bodyJSON.error).not.toBeFalsy();
            done();
        });
    });
})

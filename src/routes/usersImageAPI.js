// For file uploading
// Only implemented to upload image for admin

const express = require('express');
const routerImageAPI = express.Router();
const usersModel = require('../models/users');

const multer  = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');   // Save files in 'images' folder
    },
    filename: (req, file, cb) => {
      var filetype = '';
      if(file.mimetype === 'image/gif') {
        filetype = 'gif';
      }
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      cb(null, 'image-' + Date.now() + '.' + filetype); // filename
    }
});
const upload = multer({storage: storage});
const Jimp = require("jimp");
const fs = require('fs');

// Upload image -- Accessible through postman (access UI not implemented)
routerImageAPI.post('/', upload.single('image'), (req, res, next) => {
    if(!req.file) return res.status(400).json('No image provided');

    const fileName = "images/" + req.file.filename;
    const usr = usersModel.read({ email_address: 'admin@foo.com'});
   
    var loadedImage;

    // Annotate the image
    Jimp.read(fileName)
        .then(function (image) {
            loadedImage = image;
            return Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
        })
        .then(function (font) {
            loadedImage.print(font, 10, 100, usr.first_name).print(font, 10, 200, usr.last_name)
                    .write(fileName);
        })
        .catch(function (err) {
            console.error(err);
        });

    res.json({ fileUrl: 'http://localhost:3000/images/' + req.file.filename });
});

module.exports = routerImageAPI;
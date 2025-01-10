const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { HandleFileSaveController } = require('../../controllers');


const Router = express.Router();

Router.use(express.urlencoded({ extended: true }));
Router.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const agentId = req.params.id;

        if (!agentId) {
            return cb(new Error('Agent ID is required in the request body'), null);
        }

        const uploadPath = path.join('uploads', agentId);

        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) {
                return cb(err, null);
            }
            cb(null, uploadPath);
        });
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });


Router.post('/:id', upload.single('file'), HandleFileSaveController.SaveAudioFile);

module.exports = Router;

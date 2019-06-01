/*
     GET /app/adddoctor -> go to addDoctor page
     POST /app/adddoctor                -> add a doctor in the database
     GET  /app/getdoctors               -> get a JSON with all doctors
     GET  /app/doctor/:hospitalNumber   -> get one doctore data
     GET  /app/getdoctor/:hospitalNumber-> get JSON of a doctore data
     POST /app/updatedoctor/:hospitalNumber -> update disease & score for doctor
     POST /app/delete/:hospitalNumber -> detele a doctor from the system
*/

const express = require('express');
const _ = require('lodash');
const router = express.Router();

var {scoreOfDisease, Disease} = require('./../server/models/diseases.js');
var {Doctor} = require('./../server/models/doctors.js');
var {rooms, Room} = require('./../server/models/rooms.js');
var isValidDate = require('is-valid-date');
const {ObjectID} = require('mongodb');


/*
    GET /app/adddoctor -> go to addDoctor page
*/
router.get('/app/adddoctor', (req, res) => {
    res.render('adddoctor', {pageTitle: "Add Doctor"});
});

/*
    POST /adddoctor -> add new doctor
*/
router.post('/app/adddoctor', (req, res) => {
    // receive the diseases from the form in the array PD, each element being a String with the disease name
    var PD = req.body.PD;
    var dateOfBirth = req.body.dateOfBirth;

    // console.log(dateOfBirth);
    // console.log(isValidDate(dateOfBirth));

    if (_.isEmpty(PD)) {    // check if no disease is selected
        PD = [];
    }

    // Check for empty fields
    if (_.isEmpty(req.body.firstName) || _.isEmpty(req.body.lastName) || _.isEmpty(req.body.hospitalNumber) || !isValidDate(dateOfBirth)) {
        if (_.isEmpty(req.body.firstName)) req.flash('error_msg', 'Please enter the first name.');
        if (_.isEmpty(req.body.lastName)) req.flash('error_msg', 'Please enter the last name.');
        if (_.isEmpty(req.body.hospitalNumber)) req.flash('error_msg', 'Please enter the hospital number.');
        if (!isValidDate(dateOfBirth)) req.flash('error_msg', 'The date is not valid.');

        res.status(400).redirect('/app/adddoctor');
    } else {
        // set the sex of the new doctor
        var sex = req.body.sex;
        if (sex === "male") {
            sex = true;
        } else {
            sex = false;
        }

        // make a new doctor and add it in the database
        var doctor = Doctor({
            firstName: _.capitalize(req.body.firstName),
            lastName: _.capitalize(req.body.lastName),
            sex: sex,
            dateOfBirth: dateOfBirth,
            hospitalNumber: _.toUpper(req.body.hospitalNumber),
            diseases: PD,
            lastUpdate: (new Date().getTime())
        });

        doctor.save().then((doctor) => {
            doctor.updateScore();
            res.status(200).redirect('/app/searchdoctor');
        }).catch((err) => {
            console.log(err);
            res.status(400).redirect('/app');
        });
   }
});

/*
    GET /app/getdoctors  -> get a JSON with all doctors
*/
router.get('/app/getdoctors', (req, res) => {
    Doctor.find({}).then((doctors) => {
        res.status(200).send(doctors);
    }).catch((err) => {
        console.log(err);
        res.status(400).send();
    });
});

/*
    GET one doctor data -> for his personal page
*/
router.get('/app/doctor/:hospitalNumber', (req, res) => {
    hospitalNumber = req.params.hospitalNumber;
    Doctor.findOne({
        hospitalNumber
    }).then((doctor) => {
        if (_.isEmpty(doctor)) {
            throw Error('Doctor does not exist');
        }
        res.status(200).render('doctorPage');
    }).catch((err) => {
        console.log(err);
        res.status(404).redirect('/app');
    });
});

/*
    GET one doctor data and return it as JSON
*/
router.get('/app/getdoctor/:hospitalNumber', (req, res) => {
    hospitalNumber = req.params.hospitalNumber;
    Doctor.findOne({
        hospitalNumber
    }).then((doctor) => {
        res.status(200).send(doctor);
    }).catch((err) => {
        req.flash('error_msg', 'Please enter the first name.');
        res.status(404).redirect('/app');
    });
});

/*
    POST /app/updatedoctor/:hospitalNumber -> update disease & score for doctor
                                            -> request made from the doctorPage
*/
router.post('/app/updatedoctor/:hospitalNumber', (req, res) => {
    hospitalNumber = req.params.hospitalNumber;

    // GET form attributes
    var PD = req.body.PD;
    if (_.isEmpty(PD)) {
        PD = [];
    }

    Doctor.findOneAndUpdate({
        hospitalNumber
    }, {
        "$set": {
            "diseases": PD,
            "lastUpdate": (new Date().getTime())
         }
    },{
        new: true
    }).then((doctor) => {
        doctor.updateScore();
        res.redirect('/app/doctor/' + hospitalNumber);
    }).catch((err) => {
        console.log(err);
        res.redirect('/app/doctor/' + hospitalNumber);
    });
});

/*
    POST /app/delete/:hospitalNumber -> detele a doctor from the system
*/
router.get('/app/deletedoctor/:hospitalNumber', (req, res) => {
    var hospitalNumber = req.params.hospitalNumber;

    Promise.all([Room.find({}), Doctor.findOne({hospitalNumber: hospitalNumber})])
        .then((data) => {
            var rooms = data[0];
            var doctor = data[1];

            // if the doctor is in a room, make the room empty
            if (doctor.room !== 'noroom') {
                 for (var i = 0; i < rooms.length; ++i) {
                    if (rooms[i].name === doctor.room) {
                         rooms[i].availability = false;
                         rooms[i].save();
                         break;
                    }
                 }
            }

            doctor.remove().then((doctors) => {
               res.status(200).redirect('/app');
            });
         }).catch((err) => {
            res.status(400).redirect('/app');
         });
});

module.exports = router;

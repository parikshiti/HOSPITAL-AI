const mongoose = require('mongoose');
const _ = require('lodash');
var {scoreOfDisease, Disease} = require('./diseases.js');
var rooms = require('./rooms.js');

// Doctor Schema
var DoctorSchema = mongoose.Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	dateOfBirth: {
		type: String,
		required: true,
	},
	sex: {
		// true = male
		// false = female
		type: Boolean,
		required: true,
		default: true
	},
	hospitalNumber: {
		type: String,
		required: true,
		unique: true
	},
	diseases: {
        type: Array,
        default: []
     },
     score: {
        type: Number,
	   required: true,
	   default: 0
	 },
	 room: {
		type: String,
		required: true,
		default: 'noroom'
	},
	lastUpdate: {
		type: Number,
		required: true
	}
});

/*
	function to update the diseases and the score of a doctor
	*Requires the doctor to have the diseases already saved in the databases
*/
DoctorSchema.methods.updateScore = function () {
	var doctor = this;

	// promise to get the doctor object inside the diseases callback
	var promise = new Promise(function(resolve, reject) {
		resolve(doctor);
		reject(doctor);
	})

	Promise.all([promise.then(function (doctor) { return doctor; }), Disease.find({})])
         .then((data) => {
             var doctor = data[0];
             var diseases = data[1];

             var scoreOfDisease = {};
             var score = 0;

		   if (! _.isEmpty(diseases) && _.isArray(diseases)) {
                 // create a hashmap with the diseases and their scores
                 for (var i = 0; i < diseases.length; ++i) {
                     scoreOfDisease[diseases[i].name] = diseases[i].score;
                 }

            	  for (var i = 0; i < doctor.diseases.length; ++i) {
	                if (scoreOfDisease[doctor.diseases[i]] > score) {
	        			score = scoreOfDisease[doctor.diseases[i]];
	        	 	 }
             	 }
             }

             doctor.score = score;
             doctor.save().catch((err) => {
			   console.log(err);
		   });
         }).catch((err) => {
             console.log(err);
	 });
}

var Doctor = mongoose.model('Doctor', DoctorSchema);
module.exports = {Doctor};

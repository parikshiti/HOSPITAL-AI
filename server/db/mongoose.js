var mongoose = require ('mongoose');


mongoose.Promise = global.Promise;

//change the database with yours
mongoose.connect("mongodb://admin:admin123@ds263816.mlab.com:63816/be-hospital");

module.exports = {mongoose};

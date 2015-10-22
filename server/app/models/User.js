var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	email: {type: String, required: true},
	password: {type: String, required: true},
	events: {type: Array},
	settings: {
		circleColor: {type: String},
		strokeColor: {type: String}
	}
});

module.exports = mongoose.model('User', UserSchema);
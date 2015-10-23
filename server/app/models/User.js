var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	email: {type: String, required: true},
	password: {type: String, required: true},
	events: {type: Array},
	settings: {
		circleColor: {type: String},
		strokeColor: {type: String}
	},
	followers: {type: [Schema.Types.ObjectId]}
});

module.exports = mongoose.model('User', UserSchema);
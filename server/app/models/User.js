var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
		title: String,
		description: String,
		startDate: Date,
		endDate: Date,
		latitude: Number,
		longitude: Number
});

var UserSchema = new Schema({
	email: {type: String, required: true},
	password: {type: String, required: true},
	events: [EventSchema],
	settings: {
		circleColor: {type: String},
		strokeColor: {type: String}
	},
	followers: {type: [Schema.Types.ObjectId]}
});

//-- CurrentEvents method

module.exports = mongoose.model('User', UserSchema);
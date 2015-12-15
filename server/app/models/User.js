var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;

//-- TODO: Move to separate file
var EventSchema = new Schema({
		title: String,
		description: String,
		startDate: Date,
		endDate: Date,
		latitude: Number,
		longitude: Number
});

var UserSchema = new Schema({
	fname: {type: String, required: true},
	lname: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true},
	events: [EventSchema],
	settings: {
		circleColor: {type: String},
		strokeColor: {type: String}
	},
	followers: [{
		user: {type: Schema.Types.ObjectId, ref: 'User'},
		accepted: {type: Boolean, default: false},
		date: {type: Date, required: false}
	}],
	following: [{
		user: {type: Schema.Types.ObjectId, ref: 'User'},
		date: {type: Date, required: false}
	}],
	notifications: [{
		title: {type: String, required: true},
		date: { type: Date, required: true},
		read: { type: Boolean, default: false }
	}]
});

UserSchema.methods.isFollowing = function(userId) {
	console.log('UserSchema.methods.isFollowing');
	console.log(userId);
};

module.exports = mongoose.model('User', UserSchema);
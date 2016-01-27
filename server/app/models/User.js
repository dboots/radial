/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;
var EventSchema = require('./Event').schema;

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
		read: { type: Boolean, default: false },
		link: { type: String }
	}]
}, {
	toObject: {
		virtuals: true,
		getters: true
	},
	toJSON: {
		virtuals: true,
		getters: true
	}
});

UserSchema.methods.isFollowing = function(userId) {
	console.log('UserSchema.methods.isFollowing');
	console.log(userId);
};

UserSchema.methods.archiveEvents = function() {
	console.log('[/app/models/User.js] archiveEvents', this);
	return this;
};

module.exports = mongoose.model('User', UserSchema);
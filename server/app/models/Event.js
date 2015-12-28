/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var _ = require('underscore');
var Schema = mongoose.Schema;

var EventSchema = new Schema({
		title: {type: String},
		description: {type: String},
		startDate: {type: Date},
		endDate: {type: Date},
		latitude: {type: Number},
		longitude: {type: Number}
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

EventSchema.virtual('age').get(function() {
	var age = (new Date() - this.endDate) / (60 * 60 * 1000);
	console.log('[/Models/Event.js] Age calculated as ' + age + ' with end date of ' + this.endDate);
	return age;
});

module.exports = mongoose.model('Event', EventSchema);
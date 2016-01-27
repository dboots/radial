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

//-- Calcuate how many hours old an event is
//-- TODO: Convert to object containing {minutes,hours,days}
EventSchema.virtual('age').get(function() {
	return (new Date() - this.endDate) / (60 * 60 * 1000);
});

module.exports = mongoose.model('Event', EventSchema);
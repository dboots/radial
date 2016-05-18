/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventCategorySchema = new Schema({
	id: {type: String},
	category: {type: String},
	service: [{
		id: {type: String},
		map: {type: String}
	}]
}, {
	collection: 'eventCategory',
	toObject: {
		virtuals: true,
		getters: true
	},
	toJSON: {
		virtuals: true,
		getters: true
	}
});

module.exports = mongoose.model('EventCategory', EventCategorySchema);
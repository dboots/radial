/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EventProviderSchema = new Schema({
	id: {type: String},
	key: {type: String},
	url: {type: String}
}, {
	collection: 'eventProvider',
	toObject: {
		virtuals: true,
		getters: true
	},
	toJSON: {
		virtuals: true,
		getters: true
	}
});

module.exports = mongoose.model('EventProvider', EventProviderSchema);
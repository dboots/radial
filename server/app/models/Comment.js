/*jslint node: true */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	body: { type: String, required: true },
	date: { type: Date, required: true, default: Date.now },
	event: { type: Schema.Types.ObjectId, ref: 'Event' },
	user: { type: Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Comment', CommentSchema);
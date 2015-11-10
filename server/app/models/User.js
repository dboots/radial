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
	fname: {type: String, required: true},
	lname: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true},
	events: [EventSchema],
	settings: {
		circleColor: {type: String},
		strokeColor: {type: String}
	},
	followers: {type: [Schema.Types.ObjectId], ref: 'User'},
	following: {
		userId: {type: Schema.Types.ObjectId, ref: 'User'},
		accepted: {type: Boolean},
		events: [EventSchema]
	}
});

UserSchema.methods.addFollowing = function(my_userId) {
	console.log('checking ', my_userId);
}

UserSchema.methods.getFollowingEvents = function() {
	return {
		title: 'Foo',
		description: 'Foo Description',
		latitude: 0,
		longitude: 0
	};
};

//-- CurrentEvents method

module.exports = mongoose.model('User', UserSchema);
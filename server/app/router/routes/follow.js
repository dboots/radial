var User = require('../../models/User');
var _ = require('underscore');


module.exports = function(router, io) {	
	router.route('/users/follow/:user_id')
		/*
		* Step 1 in Follower/Following process:
		* UserA (user_id) requests to follow UserB (followUserId) i.e. UserB.followers[] = { _id: UserA._id, accepted: false }.
		* Step 2 of process (via PUT), UserB approves follow request, therefore inserting UserB into UserA's following collection.
		* POST: /users/follow/userId
		* Params: [followUserId, accepted, token]
		*/
		.post(function(req, res) {
			//-- User requesting to follow
			var userId = req.params.user_id;
			
			//-- User being followed
			var followUserId = req.body.followUserId;

			//-- Index to determine if user has already requested to follow
			var isFollower = false;

			//-- Notification to be inserted into followUser's queue
			var objNotification = {
				title: 'New follower request!',
				date: new Date()
			};

			User.findById(userId, function(err, user) {
				if (err)
					console.log(err);

				//-- TOO: Convert to schema method
				//-- Add follower and notification to User requesting to be followed
				User.findById(followUserId, function(err, followUser) {
					_.each(followUser.followers, function(i) {
						if (i.user.equals(user._id)) {
							isFollower = true;
						}
					});

					console.log(isFollower);

					if (!isFollower) {
						followUser.followers.push({
							user: user._id,
							accepted: false
						});

						followUser.notifications.push(objNotification);

						followUser.save(function(err, doc) {
							if (err) console.log(err);

							var obj = {
								follower: {
									user: {
										_id: user._id,
										fname: user.fname,
										lname: user.lname
									},
									accepted: false
								},
								notification: objNotification
							};

							io.dispatch('follow_request', obj, followUserId);

							res.status(200).json({
								success: true,
								message: 'Follow request sent! You will be notified when it is accepted'
							});
						}); //-- end followUser.save();
					} else {
						res.status(200).json({
							success: false,
							message: 'Follow request already sent! You will be notified when it is accepted'
						});
					} //-- end isFollower check
				}); //-- end User.findById(followUserId);
			}); //-- end User.findById(userId)
		}) //-- end POST

	/*
	* UserB approved UserA's request     | UserA.following[] = { _id: UserB._id, accepted: [accepted] }
	* PUT: /users/follow/userId          | UserB.followers[{_id: UserA._id, accepted: true}]
	* Params: [followUserId, accepted, token]
	*/
		.put(function(req, res) {
			//-- User responding to follow request
			var userId = req.params.user_id;

			//-- Subject of follow request
			var followUserId = req.body.followUserId;

			console.log(followUserId);

			//-- User's request response (true/false)
			var accepted = req.body.accepted;

			//-- Index to determine if user has already been approved
			var isFollower = false;

			//-- Notification to be inserted into followUser's queue
			var objNotification = {
				title: 'Follow request approved!',
				date: new Date()
			};

			//-- Follower object to send back to user's client
			var objFollower = {};

			//-- Lookup user that requested follow
			User.findById(userId, function(err, user) {
				if (err) console.log(err);

				//-- Update user's follower collection with decision and date
				_.each(user.followers, function(i) {
					if (i.user.equals(followUserId)) {
						i.accepted = accepted;
						i.date = new Date();
					}
				});

				//-- Save user document and dispatch approval
				user.save(function(err) {
					if (err) console.log(err);

					if (accepted) {
						console.log(followUserId);
						//-- Lookup user that requested to follow
						User.findById(followUserId, function(err, follower) {
							//-- Make sure follower isn't added more than once.
							console.log(follower);
							_.each(follower.following, function(i) {
								if (i.user.equals(userId))
									isFollower = true;
							});

							if (!isFollower) {
								follower.following.push({
									user: userId,
									date: new Date()
								});

								//-- Add notification to follower's queue
								follower.notifications.push(objNotification);

								follower.save(function(err) {
									var obj = {
										following: {
											user: {
												fname: user.fname,
												lname: user.lname
											},
											date: new Date()
										},
										notification: objNotification
									};

									//-- Emit approved notification event
									io.dispatch('follow_approval', obj, followUserId);
								});
							} //-- end isFollower check

							//-- Create objFollower to send back to client to update user's follower collection
							objFollower = {
								user: follower._id,
								accepted: accepted,
								date: new Date()
							};

							res.status(200).json({
								success: true,
								message: 'Follow request updated',
								follower: objFollower
							});
						});
					}
				});
			}); //-- end PUT
	}); //-- end /users/follow/:user_id route
}
var User = require('../../models/User');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

module.exports = function(router) {
	router.get('/register', function(req, res, next) {
		res.json({
			success: true
		});
	})

	.post('/register', function(req, res, next) {
		//-- TODO: Add User model validations

		var user = new User();
		var data = req.body;

		user.email = data.email;
		user.fname = data.fname;
		user.lname = data.lname;

		bcrypt.hash(data.password, 10, function(err, hash) {
			user.password = hash;
		
			user.save(function(err, user) {
				if (err) return(next(err));

				io.socketChannel = 'user-' + user._id;

				//-- TODO: Move to module method
				var token = jwt.sign(user, app.get('secret'), {
					expiresInMinutes: 1440 //-- 24 hours
				});

				res.json({
					success: true,
					message: 'Registration success',
					token: token,
					user: user
				});
			});
		});
	});
}
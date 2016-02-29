/*jslint node: true */
'use strict';

var jwt = require('jsonwebtoken');
var config = require('../../../config');

module.exports = function(router) {
	router.use('/', function(req, res, next) {
		var token = req.body.token || req.param('token') || req.headers['x-access-token'];

		console.log('[app/router/middleware/auth.js] begin');

		if (token) {
			jwt.verify(token, config.secret, function(err, decoded) {
				if (err) {
					console.log('[app/router/middleware/auth.js] token error', err);
					return res.json({success: false, message: 'Failed to authenticate token.'});
				} else {
					console.log('[app/router/middleware/auth.js] token good', decoded);
					req.decoded = decoded;
					next();
				}
			});
		} else {
			console.log('[app/router/middleware/auth.js] token no good');
			return res.status(403).send({
				success: false,
				message: 'No token provded'
			});
		}
	});
};
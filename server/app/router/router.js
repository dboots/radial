/*jslint node: true */
'use strict';

var express = require('express');

module.exports = function(app, io, config) {
	var api = express.Router();
	
	require('./routes/register')(api, io);
	require('./routes/authenticate')(api, io, config);

	require('./middleware/auth')(api);

	require('./routes/users')(api);
	require('./routes/follow')(api, io);
	require('./routes/event')(api, io);

	app.use('/v1/api', api);
};
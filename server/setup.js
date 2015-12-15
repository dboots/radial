var morgan = require('morgan');
var bodyParser = require('body-parser');
var config = require('./config');

module.exports = function(app) {
	//-- Configure CORS related settings to make app work properly via localhost
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
		res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
		return next();
	});

	app.use(function(req, res, next) {
		if (req.method.toLowerCase() !== "options") {
			return next();
		}

		return res.send(204);
	});

	app.use(morgan('dev'));

	//-- Configure body parser
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	app.set('secret', config.secret);
}
// routes/index.js
const noteRoutes = require('./note_routes');
const googleRoute = require('./google_routes');
const informationRoute = require('./information_route');

module.exports = function(app, mysqlConn) {

	//noteRoutes(app);
	googleRoute(app, mysqlConn);
	informationRoute(app, mysqlConn);
};
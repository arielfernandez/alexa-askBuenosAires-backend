module.exports = function(app, mysqlConn) {

	app.get('/getMode', (req, res) => {
		var mode, startLat, startLng, endLat, endLng, datetime;

		mysqlConn.query('SELECT MODE, DATETIME,START_LAT, START_LNG, END_LAT, END_LNG FROM google_api_info', function (err, result, fields) {
		    if (err) 
		    	throw err;
		    if(result){
				mode = result[0].MODE;
				datetime = result[0].DATETIME;
				startLat = result[0].START_LAT;
		    	startLng = result[0].START_LNG;
		    	endLat = result[0].END_LAT;
		    	endLng = result[0].END_LNG;
		    }

	    	res.send(JSON.stringify({ mode: mode, datetime: datetime, startLat: startLat, startLng: startLng,  endLat: endLat, endLng: endLng }));
		});
 	});

 	app.get('/getPlaces', (req, res) => {
 		var address, lat, lng, name, rating;

		mysqlConn.query('SELECT ADDRESS, LAT, LNG, NAME, RATING, WEBSITE, PHONE_NUMBER, OPEN_HS_LU, OPEN_HS_MA, OPEN_HS_MI, \
						OPEN_HS_JU, OPEN_HS_VI, OPEN_HS_SA, OPEN_HS_DO FROM places', function (err, result, fields) {
		    if (err) 
		    	throw err;
		    if(result){
			    var places = [];
			    for (var i = 0; i < result.length; i++) {
			    	places.push({
			    		'address': result[i].ADDRESS,
						'lat': result[i].LAT,
				    	'lng': result[i].LNG,
				    	'name': result[i].NAME,
				    	'rating': result[i].RATING,
				    	'website': result[i].WEBSITE,
				    	'phoneNumber': result[i].PHONE_NUMBER,
				    	'openHSLu': result[i].OPEN_HS_LU,
				    	'openHSMa': result[i].OPEN_HS_MA,
				    	'openHSMi': result[i].OPEN_HS_MI,
				    	'openHSJu': result[i].OPEN_HS_JU,
				    	'openHSVi': result[i].OPEN_HS_VI,
				    	'openHSSa': result[i].OPEN_HS_SA,
				    	'openHSDo': result[i].OPEN_HS_DO
			    	});
			    }
		    	res.json(places);
		    }
		});
 	});
}	
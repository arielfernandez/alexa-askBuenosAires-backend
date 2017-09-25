module.exports = function(app, mysqlConn) {

	app.get('/getMode', (req, res) => {
		var mode, startLat, startLng, endLat, endLng, datetime, respuesta, name_start, name_end, address_start, address_end;

		mysqlConn.query('SELECT MODE, NAME_START, ADDRESS_START, DESCRIPCION, DATETIME,START_LAT, START_LNG, NAME_END, ADDRESS_END, END_LAT, END_LNG \
			FROM google_api_info', function (err, result, fields) {
		    if (err) 
		    	throw err;
		    if(result){
				mode = result[0].MODE;
				respuesta = result[0].DESCRIPCION;
				datetime = result[0].DATETIME;
				name_start = result[0].NAME_START;
				address_start = result[0].ADDRESS_START; 
				startLat = result[0].START_LAT;
		    	startLng = result[0].START_LNG;
		    	name_end = result[0].NAME_END;
				address_end = result[0].ADDRESS_END;
		    	endLat = result[0].END_LAT;
		    	endLng = result[0].END_LNG;
		    }

	    	res.send(JSON.stringify({ mode: mode, respuesta: respuesta, datetime: datetime, name_start: name_start, address_start: address_start,
	    			startLat: startLat, startLng: startLng, name_end: name_end, address_end: address_end, endLat: endLat, endLng: endLng }));
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
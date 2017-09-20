// google-service-route
//const opn = require('opn');
const googleMapsClient = require('@google/maps').createClient({
	key: 'AIzaSyAuxVsKYV7lgV6PnJiyLEdDpOy2kSjYM4c',
	Promise: Promise
});
const alexaLocation = {
	'address': 'Avenida Caseros 3563, C1437 CABA, Argentina',
	'lat': -34.638380,
	'lng': -58.415515
};

//const url = 'http://localhost:404/#!/home';

module.exports = function(app, mysqlConn) {

	app.get('/myLocation', (req, res) => {
		var serviceResponse;

		googleMapsClient.geocode({
		  address: alexaLocation.address
		}, function(err, response) {
		  if (!err) {
		    serviceResponse = response.json.results;
		    var direction  = JSON.stringify(serviceResponse[0].formatted_address);
		    var lat = JSON.stringify(serviceResponse[0].geometry.location.lat);
		    var lng = JSON.stringify(serviceResponse[0].geometry.location.lng);

		    //var urlParam = '?mode=myLocation&lat=' + lat + '&lng=' + lng;
		    //opn(url + urlParam, {app: 'chrome'});
		    mysqlConn.query('DELETE FROM google_api_info'); //delete row
			mysqlConn.query('INSERT INTO google_api_info (MODE, START_LAT, START_LNG) VALUES (\'myLocation\','+ lat +','+ lng +')', function (err, result) {
			    if (err) throw err;
			    console.log("1 registro insertado por servicio myLocation");
			});
		    //res.send('Mi direccion actual es: ' + direction);
		    res.send("mee dee-rehk-seeon ahk-too-ahl ehs- ah-beh-nee-dah cah-seh-ros trehs-meel-kee-nee-ehntos-seh-sentah-e-trehs, Boo-ehmohs-ah-ee-rehs, Ahr-hehn-teen-ah");
		  }
		});
	});

	app.get('/geocode', (req, res) => {
		var city = req.query.city;
		var serviceResponse;

		googleMapsClient.geocode({
		  address: city
		}, function(err, response) {
		  if (!err) {
		    serviceResponse = response.json.results;
		    var direction  = JSON.stringify(serviceResponse[0].formatted_address);
		    var lat = JSON.stringify(serviceResponse[0].geometry.location.lat);
		    var lng = JSON.stringify(serviceResponse[0].geometry.location.lng);

		    //var urlParam = '?mode=myLocation&lat=' + lat + '&lng=' + lng;
		    //opn(url + urlParam, {app: 'chrome'});
		    mysqlConn.query('DELETE FROM google_api_info'); //delete row
			mysqlConn.query('INSERT INTO google_api_info (MODE, START_LAT, START_LNG) VALUES (\'geocode\','+ lat +','+ lng +')', function (err, result) {
			    if (err) throw err;
			    console.log("1 registro insertado por servicio geocode");
			});
		    res.send('La dirección ' + direction + ' se encuentra indicada en el mapa');
		  }
		});
	});


	app.get('/directions', (req, res) => {
		var serviceResponse;
		var reqEndCity = req.query.endCity;
		
		googleMapsClient.directions({
			origin: alexaLocation.address,
		    destination: reqEndCity,
		    mode: 'walking',
		    optimize: true,
		    language: 'es',
      		units: 'metric',
		}, function(err, response){
			if(!err){
				serviceResponse =  response.json.routes[0];
				var startAdress = JSON.stringify(serviceResponse.legs[0].start_address);
				var endAdress = JSON.stringify(serviceResponse.legs[0].end_address);
				var startLat = JSON.stringify(serviceResponse.legs[0].start_location.lat);
				var startLng = JSON.stringify(serviceResponse.legs[0].start_location.lng);
				var endLat = JSON.stringify(serviceResponse.legs[0].end_location.lat);
				var endLng = JSON.stringify(serviceResponse.legs[0].end_location.lng);

				//var urlParam = '?mode=directiosn&startLat=' + startLat +'&startLng=' + startLng + '&endLat=' + endLat + '&endLng=' + endLng;
				//opn(url + urlParam, {app: 'chrome'});
				mysqlConn.query('DELETE FROM google_api_info'); //delete row
				mysqlConn.query('INSERT INTO google_api_info (MODE, START_LAT, START_LNG, END_LAT, END_LNG) \
								 VALUES (\'directions\','+ startLat +','+ startLng +','+ endLat +','+ endLng +')', function (err, result) {
				    
				    if (err) throw err;
				    console.log("1 registro insertado por servicio directions");
				});
				res.send('El direccionamiento entre ' + startAdress + ' y ' + endAdress + ' se puede visualizar en el mapa');
			}
		});
	});

	app.get('/places', (req, res) => {
		var searchText = req.query.search;
		var searchType = req.query.type;
		console.log(searchText);
		var serviceResponse, places = [];

		googleMapsClient.places({
	    	query: searchText,
	    	language: 'es',
	    	location: {lat: alexaLocation.lat, lng: alexaLocation.lng},
	      	radius: 2000,
	      	minprice: 1,
	      	maxprice: 4,
	      	type: searchType
	    }, function(err, response){
	    	if(!err){
	    		serviceResponse = response.json.results;
	    		places.push([alexaLocation.address, alexaLocation.lat.toString(), alexaLocation.lng.toString(), "Alexa", "0"]);
	    		
	    		for (var i = 0; i < serviceResponse.length; i++) {
	    			places.push(
	    				[serviceResponse[i].formatted_address, (serviceResponse[i].geometry.location.lat).toString(),
	    				(serviceResponse[i].geometry.location.lng).toString(), serviceResponse[i].name, (serviceResponse[i].rating).toString()]
	    			);
	    		}

	    		mysqlConn.query('DELETE FROM google_api_info'); //delete row
	    		mysqlConn.query('DELETE FROM places'); //delete row
				mysqlConn.query('INSERT INTO google_api_info (MODE) VALUES (\'places\')', function (err, result) {
				    if (err) throw err;
				    console.log("1 registro insertado por servicio places");
				});

				mysqlConn.query('INSERT INTO places (ADDRESS, LAT, LNG, NAME, RATING) VALUES ?', [places], function (err, result) {
				    if (err) throw err;
				    console.log(result.affectedRows.toString() + " registro(s) insertado(s) por servicio places");
				});

	    		//res.send(places);
	    		res.send('Los lugares mas cercanos de acuerdo a la busqueda se encuentran ubicados en el mapa');
	    	}
	    });
	});

	app.get('/placesAutocomplete', (req, res) => {

		var searchText = req.query.search;
		var searchType = req.query.type;
		console.log(searchText);
		var places = [], serviceResponse, placesDetails = [], placeDetailsResponse;;

		googleMapsClient.placesAutoComplete({
	      input: searchText,
	      language: 'es',
	      location: {lat: alexaLocation.lat, lng: alexaLocation.lng},
	      radius: 2000,
	      components: {country: 'ar'}
	    })
	    .asPromise()
	    .then(function(response) {

	     	serviceResponse = response.json.predictions;
			//get places ids
			for (var i = 0; i < serviceResponse.length; i++) {
				places.push({'placeId': serviceResponse[i].place_id, 'description': serviceResponse[i].description});
			}
	    })
	    .then(function(){
	    	//get places details
	    	mysqlConn.query('DELETE FROM google_api_info'); //delete row
	    	mysqlConn.query('DELETE FROM places'); //delete row
	    	mysqlConn.query('INSERT INTO google_api_info (MODE) \ VALUES (\'placesAutocomplete\')', function (err, result) {
	    		if (err) throw err;
			    console.log("1 registro insertado por servicio placesAutocomplete");
			});
	    	mysqlConn.query('INSERT INTO places (ADDRESS, LAT, LNG, NAME, RATING) VALUES ("' + alexaLocation.address + '","' + alexaLocation.lat.toString() + '","' + alexaLocation.lng.toString() + '","Alexa","0")', 
	    		function (err, result) {
	    		if (err) throw err;
				console.log("1 registro insertado por servicio placesAutocomplete");
			});

			for (var i = 0; i < places.length; i++) {
				googleMapsClient.place({
					placeid: places[i].placeId,
					language: 'es'
				})
				.asPromise()
				.then(function(response){
					placeDetailsResponse = response.json.result;
					placesDetails = [[
							placeDetailsResponse.formatted_address, placeDetailsResponse.geometry.location.lat, placeDetailsResponse.geometry.location.lng,
							placeDetailsResponse.name, placeDetailsResponse.rating,
							placeDetailsResponse.website != undefined ? placeDetailsResponse.website : 'Información no disponible',
							placeDetailsResponse.formatted_phone_number != undefined ? placeDetailsResponse.formatted_phone_number : 'Información no disponible',
							placeDetailsResponse.opening_hours != undefined ? placeDetailsResponse.opening_hours.weekday_text[0] : 'Información no disponible', 
							placeDetailsResponse.opening_hours != undefined ? placeDetailsResponse.opening_hours.weekday_text[1] : 'Información no disponible',
							placeDetailsResponse.opening_hours != undefined ? placeDetailsResponse.opening_hours.weekday_text[2] : 'Información no disponible',
							placeDetailsResponse.opening_hours != undefined ? placeDetailsResponse.opening_hours.weekday_text[3] : 'Información no disponible',
							placeDetailsResponse.opening_hours != undefined ? placeDetailsResponse.opening_hours.weekday_text[4] : 'Información no disponible',
							placeDetailsResponse.opening_hours != undefined ? placeDetailsResponse.opening_hours.weekday_text[5] : 'Información no disponible',
							placeDetailsResponse.opening_hours != undefined ? placeDetailsResponse.opening_hours.weekday_text[6] : 'Información no disponible'
						]];
					mysqlConn.query('INSERT INTO places (ADDRESS, LAT, LNG, NAME, RATING, WEBSITE, PHONE_NUMBER, OPEN_HS_LU, OPEN_HS_MA, OPEN_HS_MI, \
						OPEN_HS_JU, OPEN_HS_VI, OPEN_HS_SA, OPEN_HS_DO) VALUES ?', [placesDetails], function (err, result) {
					    	if (err) throw err;
					    	console.log(result.affectedRows.toString() + " registro(s) insertado(s) por servicio placesAutocomplete");
					});
				});
			}
			res.send('Los lugares mas cercanos de acuerdo a la busqueda se encuentran ubicados en el mapa');
	    });
	});
};
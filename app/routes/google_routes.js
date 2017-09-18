// google-service-route
const opn = require('opn');
const googleMapsClient = require('@google/maps').createClient({
	key: 'AIzaSyAuxVsKYV7lgV6PnJiyLEdDpOy2kSjYM4c'
});
var PLACE_DETAILS = []; 

//const url = 'http://localhost:404/#!/home';

module.exports = function(app, mysqlConn) {

	app.get('/myLocation', (req, res) => {
		var serviceResponse;

		googleMapsClient.geocode({
		  address: "Avenida Caseros 3563, C1437 CABA, Argentina"
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

		    res.send('Mi direccion actual es: ' + direction);
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
			origin: 'Avenida Caseros 3563, Buenos Aires, Argentina',
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
	    	location: {lat: -34.638380, lng: -58.415515},
	      	radius: 2000,
	      	minprice: 1,
	      	maxprice: 4,
	      	type: searchType
	    }, function(err, response){
	    	if(!err){
	    		serviceResponse = response.json.results;
	    		
	    		places.push(["Avenida Caseros 3563, C1437 CABA, Argentina", "-34.638380", "-58.415515", "Alexa", "0"]);
	    		
	    		for (var i = 0; i < serviceResponse.length; i++) {
	    			places.push(
	    				[serviceResponse[i].formatted_address, (serviceResponse[i].geometry.location.lat).toString(),
	    				(serviceResponse[i].geometry.location.lng).toString(), serviceResponse[i].name, (serviceResponse[i].rating).toString()]
	    			);
	    		}

	    		mysqlConn.query('DELETE FROM google_api_info'); //delete row
	    		mysqlConn.query('DELETE FROM places'); //delete row
				mysqlConn.query('INSERT INTO google_api_info (MODE) \ VALUES (\'places\')', function (err, result) {
				    if (err) throw err;
				    console.log("1 registro insertado por servicio places");
				});

				mysqlConn.query('INSERT INTO places (ADDRESS, LAT, LNG, NAME, RATING) \ VALUES ?', [places], function (err, result) {
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
		var serviceResponse, placeDetailsResponse,  places = [], placesDetails = [];

		googleMapsClient.placesAutoComplete({
	      input: searchText,
	      language: 'es',
	      location: {lat: -34.638380, lng: -58.415515},
	      radius: 5000,
	      components: {country: 'ar'}
	    }, function(err, response){
	    	if(!err){
	    		serviceResponse = response.json.predictions;

	    		//get places ids
	    		for (var i = 0; i < serviceResponse.length; i++) {
	    			places.push({'placeId': serviceResponse[i].place_id, 'description': serviceResponse[i].description});
	    		}

	    		//get details
	    		for (var i = 0; i < places.length; i++) {
	    			 googleMapsClient.place({
				     	placeid: places[i].placeId,
				     	language: 'es'
				    }, function(err, response){
				    	if(!err){
				    		placeDetailsResponse = response.json.result;

				    		PLACE_DETAILS.push({
				    			'address': placeDetailsResponse.formatted_address,
				    			'lat': placeDetailsResponse.geometry.location.lat,
				    			'lng': placeDetailsResponse.geometry.location.lng,
				    			'name': placeDetailsResponse.name,
				    			'website': placeDetailsResponse.website
				    		});
				    		res.send(PLACE_DETAILS);
				    		//res.send(placesDetails);
				    		//PLACE_DETAILS = placesDetails;
				    	}	
				    });
	    		}
				//res.send(PLACE_DETAILS);
	    		//res.send(places);
	    	}
	    });

	});
};
// google-service-route
//const opn = require('opn');
const googleMapsClient = require('@google/maps').createClient({
	key: '*',
	Promise: Promise
});
const alexaLocation = {
	'name': 'Alexa',
	'address': 'Avenida Caseros 3563, C1437 CABA, Argentina',
	'lat': -34.638380,
	'lng': -58.415515
};

//const url = 'http://localhost:404/#!/home';

module.exports = function(app, mysqlConn) {

	//SERVICIO DE UBICACION ACTUAL
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
			mysqlConn.query('INSERT INTO google_api_info (MODE, DESCRIPCION, NAME_START, ADDRESS_START, START_LAT, START_LNG) \
				VALUES (\'myLocation\', \'Mi direccion actual es: '+ direction +'\',\''+ alexaLocation.name +'\','+ direction +','+ lat +','+ lng +')', function (err, result) {
			    if (err) throw err;
			    console.log("1 registro insertado por servicio myLocation");
			});
		    res.send('Mi dirección actual es: ' + direction);
		    //res.send("mee dee-rehk-seeon ahk-too-ahl ehs- ah-beh-nee-dah cah-seh-ros trehs-meel-kee-nee-ehntos-seh-sentah-e-trehs, Boo-ehmohs-ah-ee-rehs, Ahr-hehn-teen-ah");
		  }
		});
	});

	//SERVICIO PARA UBICAR DIRECCION EN EL MAPA
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
			mysqlConn.query('INSERT INTO google_api_info (MODE, DESCRIPCION, START_LAT, START_LNG) \
				VALUES (\'geocode\', \'La dirección ' + direction + ' se encuentra indicada en el mapa\','+ lat +','+ lng +')', function (err, result) {
			    if (err) throw err;
			    console.log("1 registro insertado por servicio geocode");
			});
		    res.send('La dirección ' + direction + ' se encuentra indicada en el mapa');
		  }
		});
	});

	//SERVICIO PARA UBICAR LUGARES CERCANOS EN EL MAPA
	app.get('/placesAutocomplete', (req, res) => {

		var searchText = req.query.search;
		var reqType = req.query.type;
		console.log(searchText);
		console.log(reqType);
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
			if(reqType == 'goto'){
				places.push({'placeId': serviceResponse[0].place_id, 'description': serviceResponse[0].description});
				return onePlace(places, res);
			} else if(reqType == 'whereis'){
				for (var i = 0; i < serviceResponse.length; i++) {
					places.push({'placeId': serviceResponse[i].place_id, 'description': serviceResponse[i].description});
				}
				return allPlaces(places, res);
			}
	    });
	});

	function allPlaces(places, res){
		//get places details
    	mysqlConn.query('DELETE FROM google_api_info'); //delete row
    	mysqlConn.query('DELETE FROM places'); //delete row
    	mysqlConn.query('INSERT INTO google_api_info (MODE, DESCRIPCION) \ VALUES (\'placesAutocomplete\', \'Los lugares mas cercanos de acuerdo a la busqueda se encuentran ubicados en el mapa\')', 
    		function (err, result) {
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
						placeDetailsResponse.name, 
						placeDetailsResponse.rating != undefined ? placeDetailsResponse.rating : 'Información no disponible',
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
		res.send('Los lugares mas cercanos de acuerdo a la búsqueda se encuentran ubicados en el mapa');
	}

	function onePlace(place, res){
		//get place details
		mysqlConn.query('DELETE FROM google_api_info'); //delete row
    	mysqlConn.query('DELETE FROM places'); //delete row

    	googleMapsClient.place({
				placeid: place[0].placeId,
				language: 'es'
			})
			.asPromise()
			.then(function(response){
				placeDetailsResponse = response.json.result;
				
				var placesDetails = [[ 'directions', 'El direccionamiento se puede visualizar en el mapa', alexaLocation.name, alexaLocation.address, 
						alexaLocation.lat, alexaLocation.lng, placeDetailsResponse.name, placeDetailsResponse.formatted_address, 
						placeDetailsResponse.geometry.location.lat, placeDetailsResponse.geometry.location.lng 
					]];
				
				mysqlConn.query('INSERT INTO google_api_info (MODE, DESCRIPCION, NAME_START, ADDRESS_START, START_LAT, START_LNG, NAME_END, ADDRESS_END, \
					END_LAT, END_LNG) VALUES ?', [placesDetails], function (err, result) {
				    	if (err) throw err;
				    	console.log(result.affectedRows.toString() + " registro(s) insertado(s) por servicio directions");
				});
			});
		res.send('El direccionamiento se puede visualizar en el mapa');
	}
};
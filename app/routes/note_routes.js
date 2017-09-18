// routes/note_routes.js
module.exports = function(app) {
	app.post('/notes', (req, res) =>{
		console.log(req.body);
		res.send('HELLO');
	});
};
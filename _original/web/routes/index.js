var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;


var TOTAL_ITENS = 40;

var banco;

var getVines = function() {
	return [];
};

MongoClient.connect('mongodb://127.0.0.1:27017/vinedatorcida', function(err, db) {
	if(err) throw err;

	banco = db;
	var collection = db.collection('vines');
	getVines = function(sort, callback) {


		var c = collection.find({}).limit(TOTAL_ITENS);


		switch(sort) {
			case "random":
				c = collection.find({}).sort({'rand': parseInt(Math.random() * 2) -1, 'created': parseInt(Math.random() * 2) -1});
				break;

			case "top_tacas":
				c = collection.find({ 'votes.taca': { $gt: 0 } }).sort({'votes.taca': -1});
				break;

			case "top_caneladas":
				console.log("foi?");
				c = collection.find({ 'votes.canelada': { $gt: 0 } }).sort({'votes.canelada': -1});
				break;

			case "top_likes":
				c = collection.find({ 'likesCount': { $gt: 0 } }).sort({'likesCount': -1});
				break;

			case "top_comments":
				c = collection.find({ 'commentsCount': { $gt: 0 } }).sort({'commentsCount': -1});
				break;

			default:
				console.log("sorting created");
				c = collection.find({}).sort({'created': -1});

		}

		c.limit(TOTAL_ITENS).toArray(function(err, docs) {
			console.log(sort);
			console.dir(docs);
			if (callback) callback(docs);

		});


	};

})




/* VOTES */

router.get('/:id/:tipo(taca|canelada)', function(req, res) {

	//TODO: verificar ID e consultar vine
	//TODO: registrar voto
	//TODO: retornar totais



	var collection = banco.collection('vines');
	console.log(req.params.id);

	collection.findOne({'_id': req.params.id}, function(err, vine) {

		console.log(err, vine);
		if (!err) {
			if (!vine.votes) {
				vine.votes = {
					"taca": 0,
					"canelada": 0
				}
			}

			switch(req.params.tipo) {
				case "taca": vine.votes.taca += req.query.minus ? -1 : 1; break;
				case "canelada": vine.votes.canelada += req.query.minus ? -1 : 1; break;
			}
			if (vine.votes.taca < 0) vine.votes.taca = 0;
			if (vine.votes.canelada < 0) vine.votes.canelada = 0;

			res.send(vine);

			collection.save(vine, function(err, dados){
				//console.log("salvei");
				//res.send(dados);
			});	
		} else {
			res.send({"error": {}});
		}

	});

});



/* GET home page. */
router.get('/:tipo(new|random)?', function(req, res) {
	getVines(req.params.tipo, function(dados){
		res.render('index', { title: 'Taça ou Canelada?', dados: dados, current: req.params.tipo });
	})
});


router.get('/top/:tipo', function(req, res) {
	getVines("top_" + req.params.tipo, function(dados){
		res.render('index', { title: 'Taça ou Canelada?', dados: dados, current: "top_" + req.params.tipo });
	})
});


/*
router.get('/top/caneladas', function(req, res) {
	getVines("top_caneladas", function(dados){
		res.render('index', { title: 'Taça ou Canelada?', dados: dados, current: "top_caneladas" });
	})
});

router.get('/top/likes', function(req, res) {
	getVines("top_likes", function(dados){
		res.render('index', { title: 'Taça ou Canelada?', dados: dados, current: "top_likes" });
	})
});

router.get('/top/comments', function(req, res) {
	getVines("top_comments", function(dados){
		res.render('index', { title: 'Taça ou Canelada?', dados: dados, current: "top_comments" });
	})
});
*/


module.exports = router;

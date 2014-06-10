/*
 * VineDaTorcida \o/
 * > 
 * 
 * 
 * 
 */

var config = require('./config.json');




var twitter = require('ntwitter');
var twit = new twitter(config.twitter);

var http = require('http');
var util = require("util");

var fs = require('fs');
var sys = require('sys')

var add_vine;



var MongoClient = require('mongodb').MongoClient;


console.log("starting...");


MongoClient.connect('mongodb://127.0.0.1:27017/vinedatorcida', function(err, db) {
	if(err) throw err;

	var collection = db.collection('vines');
	add_vine = function(vine, callback) {
		collection.insert(vine, function(err, docs){
			if (callback) callback(err, docs);
		})
	};

})




function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

var download_video = function(vine, callback) {
	var request = require('request');
	request(vine.videoUrl).pipe(fs.createWriteStream('temp/' + vine.id + ".mp4"));
	if (callback) callback();
}


var download_vine_metadata = function(vine_url) {

	var request = require('request');
	request(vine_url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var regex = /window.POST_DATA = (.*)/;
			if (regex.test(body)) {
				//console.log(body) // Print the google web page.
				var result = regex.exec(body);
				var raw_txt = result[1];

				var json_txt = raw_txt.substring(raw_txt.indexOf(":")+1, raw_txt.length-2);
				var json = JSON.parse(json_txt);


				var vine = {
					"_id": json.shortId,
					"username": json.username,
					"created": json.created,
					"likesCount": json.likes.count,
					"commentsCount": json.comments.count,
					"avatarUrl": json.avatarUrl,
					"videoUrl": json.videoUrl,
					"permalinkUrl": json.permalinkUrl,
					"votes": {
						"taca": 0,
						"canelada": 0
					} ,
					"rand": Math.random()//,
					//"raw": json
				}

				console.log(); console.log();
				console.log(vine);
				console.log(); console.log();

				vine.raw = json;

				// inserir no banco de dados
				if (add_vine) add_vine(vine, function(err, docs){
					if (err) {
						//TODO: atualizar numeros do atual
						

						//download_video(docs, "temp/" + docs._id + ".mp4");
					}
				})
			}

		}
	})


};




var get_stream = function() {

	console.log("enabling streaming api...");
	console.log(config.filter);

	twit.stream("statuses/filter", { "track": config.filter.join(", ") },

		function(stream) {

			console.log("OK.");

			stream.on('data', function(tweet) {

				//console.log(tweet);
				for (var idx in tweet.entities.urls) {
					var url = tweet.entities.urls[idx];
					if (url.display_url.indexOf("vine.co") == 0) {
						//console.log(url.expanded_url);
						download_vine_metadata(url.expanded_url);
						return;
					}
				}

				console.log("new tweet");
				console.log(tweet.user.screen_name + ": " + tweet.text);
				console.log(tweet.text);
				console.log(tweet.entities.urls);
				console.log("********************************");
				console.log();

			});


			stream.on('end', function (response) {
				// Handle a disconnection
				console.log("END");
				get_stream();
			});

			stream.on('destroy', function (response) {
				// Handle a 'silent' disconnection from Twitter, no end/error event fired
				console.log("DESTROY");
			});

		});

}

get_stream();








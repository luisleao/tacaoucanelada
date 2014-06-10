var x;

jQuery(document).ready(function($) {

	$("ul.lista li").hover(function() {
		/* Stuff to do when the mouse enters the element */
		var video = $(this).children("video")[0];
		x = video;
		if (video.paused) {
			video.volume = .1;
			video.play();
		}

	}, function() {

		if ($("body").hasClass("playing"))
			return;

		/* Stuff to do when the mouse leaves the element */
		var video = $(this).children("video")[0];
		if (!video.paused) {
			video.pause();
			video.volume = 0;

		}
	});



	if ($("body").hasClass("playing")) {
		$("ul.lista li").first().addClass("current");
	}


	$("video").click(function(event) {
		/* Act on the event */
		$("ul.lista li.current").removeClass().next().addClass("current");
		if ($("ul.lista li.current").length == 0)
			$("ul.lista li").first().addClass("current");

		checkVideo();
	});

	$("div.footer div.modo a").click(function(event) {
		event.preventDefault();
		if ($(this).attr("href").replace("#", "") === "playing" && $("ul.lista li.current").length == 0)
			$("ul.lista li").first().addClass("current");

		$("body").removeClass("playing").addClass($(this).attr("href").replace("#", ""));

		checkVideo();

	});

	$(".lista li a.btn_voto").click(function(e){
		e.preventDefault();
		console.log($(this).attr("href"));
		$.getJSON($(this).attr("href"), function(json, textStatus) {
				/*optional stuff to do after success */
				console.log("result", json.votes, json._id);

				var total = json.votes.taca + json.votes.canelada;
				var perc_canelada = json.votes.canelada / total * 100;
				console.log(perc_canelada);

				$("li#"+json._id+" .vote_result .taca").css("width", "0%");

				if ($("body").hasClass("playing")) {
					setTimeout(function(){
						$("ul.lista li.current").removeClass().next().addClass("current");
						checkVideo();

						if ($("ul.lista li.current").length == 0) {
							$("body").removeClass("playing");
						}
					}, 3000);
				}


				$("li#"+json._id+" .votes .btn_voto").fadeOut("slow", function(){
					$(this).remove();

					$("li#"+json._id+" .vote_result").fadeIn();
					$("li#"+json._id+" .vote_result .taca").css("width", perc_canelada + "%");
				});

		});
	});

	var audio = new Audio('/audio/tetra.mp3');

	var easter_egg = new Konami();
	easter_egg.code = function() { 
		;
		audio.play();
	}
	easter_egg.load();



});



function checkVideo() {
	$("video").each(function(index, el) {
		if (!$("body").hasClass("playing") || !$(el).parent().hasClass("current"))
			el.pause();
	});

}

var play_all_videos = function() {



};

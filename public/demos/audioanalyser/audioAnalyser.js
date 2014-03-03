$(function () {
	var context;
	if (typeof AudioContext !== 'undefined') {
		context = new AudioContext();
	} else if (typeof webkitAudioContext !== 'undefined') {
		context = new webkitAudioContext();
	} else {
		alert('Audio context unavailable');
		return;
	}

	// Create the analyser
	var analyser = context.createAnalyser();
	analyser.smoothingTimeConstant = 0.2;
	analyser.fftSize = 1024;

	// Set up the visualisation elements
	var visualisation = $('.vis-box');
	for (var i = 0; i*100 < analyser.frequencyBinCount; i++) {
		$('<div/>')
			.addClass('vis-row')
			.attr('id', 'row' + i)
			.appendTo(visualisation);
	}
	for (var i = 0; i < analyser.frequencyBinCount; i++) {
		var bar = $('<div/>').css('left', (i % 100) + '%');
		$('#row' + Math.floor(i / 100)).append(bar);
	}
	var bars = $('.vis-row > div');

	// Get the frequency data and update the visualisation
	var frequencyData = new Uint8Array(analyser.frequencyBinCount);
	function update() {
		requestAnimationFrame(update);

		analyser.getByteFrequencyData(frequencyData);

		bars.each(function (index, bar) {
			bar.style.height = (100 * frequencyData[index] / 255) + '%';
		});
	};

	navigator.getMedia = 
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia;
	navigator.getMedia(
		{
			audio: true
		},
		function(stream) {
			// Mic input -> analyser -> final destination
			var input = context.createMediaStreamSource(stream);
			input.connect(analyser);

			// Detaching from final destination for now to avoid feedback
			//analyser.connect(context.destination);

			/* Use this for additional processing if desired
			var node = context.createJavaScriptNode(2048, 1, 1);
			node.onaudioprocess = function () {
			};
			analyser.connect(node);
			node.connect(context.destination);
			*/
		},
		function() {
			console.log(arguments);
		}
	);

	update();
});

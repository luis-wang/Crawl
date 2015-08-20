// chrome.tts.speak("hah gay!!!!!");

document.addEventListener('DOMContentLoaded', function() {
    
	// $('body').css('width', '350px');

    var createDatabaseBtn = $('#createDatabaseBtn');

	createDatabaseBtn.on('click', function() {

		$('#container').addClass('fadeOut');

		setTimeout(addResizeBodyClass, 300)

		function addResizeBodyClass() {
			$('body').addClass('largeBody');
		}

	});

});
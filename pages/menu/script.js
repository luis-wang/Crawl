document.addEventListener('DOMContentLoaded', function() {

	$('#createDatabaseBtn').on('click', function() {

		//Fade main menu out in .3 seconds
		$('#container').css({'opacity' : '0.0',
							 'pointer-events' : 'none'});

		//Increase body size (animated with CSS3) after #container faided out.
		// setTimeout(function() {
			// $('body').addClass('largeBody');
		// }, 300)

		setTimeout(function() {

			//chrome.browserAction.setPopup({popup: "pages/createdb/index.html"});
			window.location = '../createdb/index.html';
		}, 300);

	});

});
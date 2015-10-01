document.addEventListener('DOMContentLoaded', function() {

	$('#createDatabaseBtn').on('click', function() {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	        	chrome.tabs.sendMessage(tabs[0].id, {message: "toggleSelectorMode"}, function(response) {
	        		console.log(response.message);
	        		window.close();
	        	});
	   		});
	});

});

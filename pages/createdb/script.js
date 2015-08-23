document.addEventListener('DOMContentLoaded', function() {

	//Look up / store database name
	$('#databaseName').val(localStorage.getItem('databaseName'));
	$('#databaseName').on('keyup', function() {
		var dbname = $('#databaseName').val();
		localStorage.setItem('databaseName', dbname);
	});

	//css3 animated fade-in only works if we call it after a 0ms timeout for some reason.
	//directly calling it will set the opacity to 1.0 directly, without animation.
	setTimeout(function() {
		$('#container').css({'opacity' : '1.0'});
	}, 0);

	$('#addFieldBtn').on('click', function() {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	chrome.tabs.sendMessage(tabs[0].id, {message: "addColumnToNewDatabase"}, function(response) {
        		if (response.message == "readyToAddColumn") {
        			alert('bye');
        		}
        	});
   		});
	});

});
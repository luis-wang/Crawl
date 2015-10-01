document.addEventListener('DOMContentLoaded', function() {

	var db;
	// var subcontainerTop = $('#subcontainer').position().top;

	init();

	/**
	 * Fades view in and loads indexedDB.
	 */
	function init() {
		//css3 animated fade-in only works if we call it after a 0ms timeout for some reason.
		//directly calling it will set the opacity to 1.0 directly, without animation. (on Mac OS X Yosemite with Chrome 45.0.2454.85 at least
		setTimeout(function() {
			$('#container').css({'opacity' : '1.0'});
		}, 0);

		//Load database
		var request = indexedDB.open('CrawlDatabase');
		request.onsuccess = function(event) {
			db = event.target.result;
		}
	}

	$('#nextBtn').on('click', function() {

		//Database with entered name doesn't exist yet
		if ($('#databaseName').val().isAvailableObjectStoreName()) {
			$('#subcontainer').css({'background-color' : 'green'});
		}
		//Database with entered name already exists.
		else {
			$('#subcontainer').css({'background-color' : 'red'});
		}


		// $('#nextBtn').addClass('animated shake');
		// var newTop = 200;
		$('#container').css({'top' : '200px'});

	});

	/**
	 * Checks if the CrawlDatabase already contains an ObjectStore with the entered name
	 * @return {Boolean}
	 */
	String.prototype.isAvailableObjectStoreName = function() {
		for (var i = 0; i < db.objectStoreNames.length; i++)
			if (db.objectStoreNames[i] == this)
				return false;
			
		return true;	
	};

	setTimeout(function() {
		// var objectStoreName = 'GoogleDatabase1';
		// console.log(objectStoreName.isAvailableObjectStoreName());
	}, 1000);

});







// console.log(event.result.objectStore("kids").openCursor());

//CODE TO REMOVE DATABASE

// var req = indexedDB.deleteDatabase(DatabaseName);
// req.onsuccess = function () {
//     console.log("Deleted database successfully");
// };
// req.onerror = function () {
//     console.log("Couldn't delete database");
// };
// req.onblocked = function () {
//     console.log("Couldn't delete database due to the operation being blocked");
// };


//CODE TO GET ALL DATABASES

// indexedDB.webkitGetDatabaseNames().onsuccess = function(sender, args) {
// 	console.log(sender.target.result);
// };
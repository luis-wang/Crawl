chrome.tabs.onUpdated.addListener(function(tabId, info) {
    if (info.status == 'complete') {
    	console.log('page load complete');
    	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    		//tabs is null if the user is somewhere in the chrome settings pages. (we added this code to prevent annoying errors in the background.js console)
    		if (tabs.length > 0 &&
    			tabs[0].url.indexOf('chrome-extension') == -1 &&
    			tabs[0].url.indexOf('chrome://') == -1) {
				chrome.tabs.executeScript(tabId, {code: "crawlPageIfNeeded();"});
			}
		});
    }
});
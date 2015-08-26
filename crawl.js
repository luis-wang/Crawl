//Variables

//Maximum number of pages the crawler will load
var kMaxRows = 100000;
//Delay time between two requests in milliseconds
var kDelayTimeBetweenRequest = 1000;
//Maximum crawl time in milliseconds
var kMaxCrawlTime = 3000;

//Functions

//add event listener for element selection click
document.addEventListener('click', printMousePos);

var firstClick;
var secondClick;

//get target element and print xpath of the element
function printMousePos(e) {
    if(toggleClick == true) {
        if (firstClick == null) {
            firstClick = getXPath(e.target);
        }
        else if (secondClick == null) {
            secondClick = getXPath(e.target);
        }
        else {
            var finalXPath = matchShortestCommonXPath(firstClick, secondClick);

            var columnNames = ['swagcolumn'];
            var XPaths = [finalXPath];
            Crawl(null, document.URL, columnNames, XPaths, e, null, 0);
        }
    }
}

function Crawl(crawlStartTime, URL, columnNames, XPaths, e, alreadyCrawledData, requestNumber) {

    if (crawlStartTime == null) {
        crawlStartTime = new Date().getTime();
    }

    $.get(URL, function(HTMLString) {

        var dataProcessingStartTime = new Date().getTime();

        requestNumber++;
        console.log(requestNumber);

        var HTMLDocument = new DOMParser().parseFromString(HTMLString, "text/html");

        alreadyCrawledData = appendDataToArray(alreadyCrawledData, columnNames, XPaths, HTMLDocument);

        var paginationXPath = getUniqueXPath(e.target, HTMLDocument);
        var nextPageHyperlink = document.evaluate(paginationXPath, HTMLDocument, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext();

        if (new Date().getTime() - crawlStartTime >= kMaxCrawlTime || alreadyCrawledData.length >= kMaxRows || nextPageHyperlink == null || nextPageHyperlink.textContent == null || nextPageHyperlink.textContent == '#') {
            console.log(JSON.stringify(alreadyCrawledData));
            console.log('count: ' + alreadyCrawledData.length);
            return;
        }
        else {
            //subtract processing time from delay time between requests, since processing time is basically part of the delay time.
            var delayTime = kDelayTimeBetweenRequest - new Date().getTime() + dataProcessingStartTime;
            setTimeout(function() {
                Crawl(crawlStartTime, nextPageHyperlink.getAttribute('href'), columnNames, XPaths, e, alreadyCrawledData, requestNumber);
            }, delayTime);
        }

    }, 'html');

}

function appendDataToArray(alreadyCrawledData, columnNames, XPaths, HTMLDocument) {

    if (alreadyCrawledData == null)
        alreadyCrawledData = [];

    var startCount = alreadyCrawledData.length;
    for (var i = 0; i < XPaths.length; i++) {

        var result = document.evaluate(XPaths[i], HTMLDocument, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

        var arrayCount = startCount;
        for (var node = result.iterateNext(); node != null && arrayCount < kMaxRows; node = result.iterateNext()) {

            //Fill array
            if (i == 0) {
                var object = {};
                object[columnNames[0]] = node.textContent;
                alreadyCrawledData.push(object);
            }
            //Update array
            else {
                var object = alreadyCrawledData[arrayCount];
                object[columnNames[i]] = node.textContent;
                alreadyCrawledData[arrayCount] = object;
            }

            arrayCount++;
        }

    }

    return alreadyCrawledData;

}
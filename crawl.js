//Constanst

//Maximum number of pages the crawler will load
var kMaxRows = 10000;
//Delay time between two requests in milliseconds
var kDelayTimeBetweenRequests = 1000;
//Maximum crawl time in milliseconds
var kMaxCrawlTime = 3000000;

var isCrawling = false;
var crawlStartTime;
var columnNames;
var XPaths;
var nextPageBtn;
var lastNextPageBtnXPath;
var alreadyCrawledData;
var pageNumber;
var timeSinceLastPageLoad;

var firstClick;
var secondClick;

//get target element and print xpath of the element
document.addEventListener('click', function(clickedElement) {
    if (toggleClick == true) {
        if (firstClick == null) {
            firstClick = getXPath(clickedElement.target);
        }
        else if (secondClick == null) {
            secondClick = getXPath(clickedElement.target);
        }
        else {
            var finalXPath = matchShortestCommonXPath(firstClick, secondClick);

            setVariables(finalXPath, clickedElement);
            Crawl();
        }
    }
});

function setVariables(finalXPath, clickedElement) {
    isCrawling = true;
    crawlStartTime = new Date();
    columnNames = ['swagcolumn'];
    XPaths = [finalXPath];
    nextPageBtn = clickedElement;
    alreadyCrawledData = [];
    pageNumber = 0;
    timeSinceLastPageLoad;
}

function crawlPageIfNeeded() {
    if (isCrawling) {
        //subtract processing time from delay time between requests, since processing time is basically part of the delay time.
        var currentTime = new Date().getTime();
        if (currentTime - timeSinceLastPageLoad < kDelayTimeBetweenRequests) {
            setTimeout(function() {
                Crawl();
            }, kDelayTimeBetweenRequests - currentTime + timeSinceLastPageLoad);
        }
        //Crawl right away
        else {
            Crawl();
        }

function Crawl() {
    pageNumber++;
    timeSinceLastPageLoad = new Date().getTime();

    alreadyCrawledData = appendDataToArray(alreadyCrawledData, columnNames, XPaths);

    var nextPageBtnXPath = getUniqueXPath(nextPageBtn.target);
    var foundNextPageBtn = document.evaluate(nextPageBtnXPath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext();
    var isValidXPath = false;

    //nextPageBtn.target changed. (it could have been placed in a different div, for example).
    //We have to TRY and fix it, but we can't always do that.
    if (foundNextPageBtn == null) {
        if (document.evaluate('count(' + lastNextPageBtnXPath + ')', document, null, XPathResult.TYPE_ANY, null).numberValue == 1) {
            foundNextPageBtn = document.evaluate(lastNextPageBtnXPath, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext();
        }
    }
    else {
        isValidXPath = true;
    }
    
    if (new Date().getTime() - crawlStartTime >= kMaxCrawlTime || alreadyCrawledData.length >= kMaxRows || foundNextPageBtn == null || foundNextPageBtn.textContent == null) {
        console.log(JSON.stringify(alreadyCrawledData));
        console.log('count: ' + alreadyCrawledData.length);
        isCrawling = false;
        return;
    }
    else {
        if (isValidXPath) {
            lastNextPageBtnXPath = nextPageBtnXPath;
        }

        toggleClick = false;
        foundNextPageBtn.click();
        toggleClick = true;
    }
}

function appendDataToArray() {

    return returnArray;

}
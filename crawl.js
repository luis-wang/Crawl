//Constanst

//Maximum number of pages the crawler will load
var kMaxPages = 10;
//Delay time between two requests in milliseconds
var kDelayTimeBetweenRequest = 1000;

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
            Crawl(document.URL, columnNames, XPaths, e, null, 0);
        }
    }
}

function getInnerHTMLFromXPath(columnNames, XPaths, HTMLDocument) {

    var returnArray = [];
    for (var i = 0; i < XPaths.length; i++) {

        var result = document.evaluate(XPaths[i], HTMLDocument, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

        var elementCount = 0;
        for (var node = result.iterateNext(); node != null; node = result.iterateNext()) {

            //Fill array
            if (i == 0) {
                var object = {};
                object[columnNames[0]] = node.textContent;
                returnArray.push(object);
            }
            //Update array
            else {
                var object = returnArray[elementCount];
                object[columnNames[i]] = node.textContent;
                returnArray[elementCount] = object;
            }

            elementCount++;
        }

    }

    return returnArray;

}

function Crawl(URL, columnNames, XPaths, e, alreadyCrawledData, requestNumber) {

    // $('body').append('<div id="CrawlScrapeContentDiv" style="width:100%; height: 100%; background-color: red"></div>');

    // $('#CrawlScrapeContentDiv').load('https://nrc.nl', function(response, status, xhr) {
    //     if (status != "error") {

    //         var HTMLString = $('#CrawlScrapeContentDiv').html();
        
    //         var parser = new DOMParser();
    //         var HTMLDocument = parser.parseFromString(HTMLString, "text/html");

    //         var title = getInnerHTMLFromXPath(columnNames, XPaths, HTMLDocument);
    //         console.log(title);

    //     }
    // });

    $.get(URL, function(HTMLString) {

        var d = new Date();
        var time = d.getTime();

        requestNumber++;
        console.log(requestNumber);

        var parser = new DOMParser();
        var HTMLDocument = parser.parseFromString(HTMLString, "text/html");

        var pageData = getInnerHTMLFromXPath(columnNames, XPaths, HTMLDocument);

        if (alreadyCrawledData == null)
            alreadyCrawledData = pageData;
        else
            alreadyCrawledData = alreadyCrawledData.concat(pageData);

        var paginationXPath = getUniqueXPath(e.target, HTMLDocument);
        
        var nextPageHyperlink = document.evaluate(paginationXPath, HTMLDocument, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext();

        if (requestNumber >= kMaxPages || nextPageHyperlink == null || nextPageHyperlink.textContent == null || nextPageHyperlink.textContent == '#') {
            for (var i = 0; i < alreadyCrawledData.length; i++) {
                console.log('data: ' + alreadyCrawledData[i]['swagcolumn'] + '\n');
            }
            // console.log(JSON.stringify(alreadyCrawledData));
        }
        else {
            d = new Date();
            var delayTime = kDelayTimeBetweenRequest - d.getTime() + time;

            setTimeout(function() {
                Crawl(nextPageHyperlink.getAttribute('href'), columnNames, XPaths, e, alreadyCrawledData, requestNumber);
            }, delayTime);
        }

    }, 'html');

}
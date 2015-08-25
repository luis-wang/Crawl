//Constanst

//Maximum number of pages the crawler will load
var kMaxPages = 10;
//Delay time between two requests in milliseconds
var kDelayTimeBetweenRequest = 1000;

//Functions

function getInnerHTMLFromXPath(columnNames, XPaths, HTMLDocument) {

    var returnArray = [];

    for (var i = 0; i < XPaths.length; i++) {

        var result = document.evaluate(XPaths[i], HTMLDocument, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

        var elementCount = 0;
        for (var node = result.iterateNext(); node != null; node = result.iterateNext()) {

            if (i == 0) {
                var object = {};
                object[columnNames[0]] = node.textContent;
                returnArray.push(object);
            }
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

function Crawl(URL, columnNames, XPaths, paginationXPath, alreadyCrawledData, requestNumber) {

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

        var result = document.evaluate(paginationXPath, HTMLDocument, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
        var nextPageNode = result.iterateNext();
        if (requestNumber >= kMaxPages || nextPageNode == null || nextPageNode.textContent == null || nextPageNode.textContent == '#') {
            console.log(JSON.stringify(alreadyCrawledData));
        }
        else {

            d = new Date();
            var delayTime = 1000 - d.getTime() + time;

            setTimeout(function() {
                Crawl(nextPageNode.textContent, columnNames, XPaths, paginationXPath, alreadyCrawledData, requestNumber);
            }, delayTime);
        }

    }, 'html');

}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message == "addColumnToNewDatabase") {
            toggleClick = true;
            sendResponse({message: "readyToAddColumn"});
        }
    }
);

var toggleClick = false;
//Cancel all mouseover and click events; when a user clicks (for example) a hyperlink,
//we want the link to be selected, but we don't want the hyperlink reference to be opened.
$('body').on('click', function(e) {
   if(toggleClick==true)
        e.preventDefault();
});

document.addEventListener("mouseover", function( event ) {   
    if(toggleClick==true) {
        // highlight the mouseover target
        if(!$(event.target).data('originalborder')) {
            $(event.target).data('originalborder', event.target.style.border);
        }
        event.target.style.border = "2px solid #0dcaff";
    }
}, false);


document.addEventListener("mouseout", function(e) { 
    if(toggleClick==true) {
        e.target.style.border = $(e.target).data('originalborder');
    }
}, false);

//add event listener for element selection click
document.addEventListener('click', printMousePos);

var firstClick;
var secondClick;

//get target element and print xpath of the element
function printMousePos(e) {

    if (firstClick == null) {
        firstClick = getXPath(e.target);
    }
    else if (secondClick == null) {
        secondClick = getXPath(e.target);
    }
    else {
        var paginationClick = getXPath(e.target);
        var paginationXPath = matchShortestCommonXPath(paginationClick, paginationClick) + '/@href';

        var firstFinalXPath = matchShortestCommonXPath(firstClick, secondClick);
        var columnNames = ['swagcolumn'];
        var XPaths = [firstFinalXPath];
        Crawl(document.URL, columnNames, XPaths, paginationXPath, null, 0);
    }

}

//xpath segment lookup
function getXPath(targetNode) {
    for(var xpathSegments = []; targetNode != null && targetNode.localName != 'body' && targetNode.nodeType == 1; targetNode = targetNode.parentNode) {
        //if it has an id make the xpath specified to the id else class else clean tagname

        var segment =   {'type' : targetNode.localName,
                        'id' : null,
                        'class' : null,
                        'number' : null,
                        'rel' : null};

        if (segment.type != 'td' && segment.type != 'table') {
            if (targetNode.hasAttribute('id')) {
                segment.id = targetNode.getAttribute('id');
            }
            else if (targetNode.hasAttribute('class')) {
                segment.class = targetNode.getAttribute('class');
            }
            else if (targetNode.hasAttribute('rel')) {
                segment.rel = targetNode.getAttribute('rel');
            }
        }
        else {
            for (i = 1, sib = targetNode.previousSibling; sib; sib = sib.previousSibling) { 
                if (sib.localName == targetNode.localName)
                    i++;
            }
            segment.number = i;
        }

        xpathSegments.push(segment);

    }
    //join the segments to get xpath text
    //return segmentsToXPathText(xpathSegments);

    //dont join and give segment array
    return xpathSegments;
}

//make normal text out of segment array
function segmentsToXPathText(XPathSegments) {

    XPathSegments.reverse();

    if (XPathSegments.length > 0) {

        var textToReturn = '/';

        for (var i = 0; i < XPathSegments.length; i++) {

            var segment = XPathSegments[i];
            textToReturn += '/' + segment.type;

            if (segment.number != null) {
                textToReturn += '[' + segment.number + ']';
            }
            else if (segment.id != null) {
                textToReturn += '[@id="' + segment.id + '"]';
            }
            else if (segment.class != null) {
                textToReturn += '[@class="' + segment.class + '"]';
            }
            else if (segment.rel != null) {
                textToReturn += '[@rel="' + segment.rel + '"]';
            }

        }

        return textToReturn;
    }
    else {
        return null;
    }
}

//give xpath text that describes 2 target nodes
function matchShortestCommonXPath(XPathSegments1, XPathSegments2) {

    var result = [];
    for (var i = 0; i < XPathSegments1.length && i < XPathSegments2.length; i++) {

        var segment1 = XPathSegments1[i];
        var segment2 = XPathSegments2[i];

        if (segment1 == segment2) {
            result.push(segment1)
        }
        else {
            //We assume that the type of the segment in both arrays is the same. (this is almost always the case)
            var finalSegment = {'type' : XPathSegments1[i].type,
                                'id' : null,
                                'class' : null,
                                'number' : null,
                                'rel' : null};


            //Add class if classes match
            if (segment1.class == segment2.class) {
                finalSegment.class = segment1.class;
            }

            //Add id if id's match
            if (segment1.id == segment2.id) {
                finalSegment.id = segment1.id;
            }

            //Add number if numbers match
            if (segment1.number == segment2.number) {
                finalSegment.number = segment1.number;
            }

            //Add rel if rels match
            if (segment1.rel == segment2.rel) {
                finalSegment.rel = segment1.rel;
            }

            result.push(finalSegment);
        }

    }

    var resulttext = segmentsToXPathText(result);

    return resulttext;
}
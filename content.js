//Constanst

//Maximum number of pages the crawler will load
var kMaxPages = 10;
//Delay time between two requests in milliseconds
var kDelayTimeBetweenRequest = 1000;

//make message box for page
$("body").append("<div id='messageBoxForScraper' style='background-color:#0dcaff;color:white;position:fixed;z-index:9001;top:100px;left:0px;width:400px;height:400px;padding:20px;border-radius: 0px 15px 15px 0px; display:none;font-family: 'Lato', sans-serif;font-weight: 400;font-size: 18px;text-align: center;'>Heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeey</div>");

//Functions

// var toType = function(obj) {
//   return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
// }

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
var toggleClick = false;


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message == "addColumnToNewDatabase") {
            sendResponse({message: "readyToAddColumn"});
        }
        if(request.message == "toggleSelectorMode") {
            sendResponse({message: "readyToAddXPath"});
            $("#messageBoxForScraper").toggle();
            if(toggleClick == false) {
                toggleClick = true;
            }
            else {
                toggleClick = false;
            }
        }
    }
);

//Cancel all click events; when a user clicks (for example) a hyperlink,
//we want the link to be selected, but we don't want the hyperlink reference to be opened.
$('body').on('click', function(e) {
   if(toggleClick==true)
        e.preventDefault();
});

document.addEventListener("mouseover", function( event ) {   
    if(toggleClick==true) {
        // highlight the mouseover target
        if(!$(event.target).data('originalborder')) {
            $(event.target).data('originalborder', event.target.style.boxShadow);
        }
        event.target.style.boxShadow = "0px 0px 0px 2px #0082AA";
    }
}, false);

document.addEventListener("mouseout", function(e) {
        e.target.style.boxShadow = $(e.target).data('originalborder');
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
        var finalXPath = matchShortestCommonXPath(firstClick, secondClick);

        var columnNames = ['swagcolumn'];
        var XPaths = [finalXPath];
        Crawl(document.URL, columnNames, XPaths, e, null, 0);
    }

}

//unique xpath lookup, used to find the unique xpath for the next button in the pagination box
function getUniqueXPath(targetNode, HTMLDocument) {

    var XPathElements = getXPath(targetNode);

    var hyperlinkIndex = -1;
    for (var i = 0; i < XPathElements.length && hyperlinkIndex == -1; i++) {
        if (XPathElements[i].type == 'a') {
            hyperlinkIndex = i;
        }
        else {
            targetNode = targetNode.parentNode;
        }
    }

    //remove elements inside hyperlink, if there are any.
    XPathElements.splice(0, hyperlinkIndex);

    var XPath = segmentsToXPathText(XPathElements);

    var nrOfElementsWithXPath = document.evaluate('count(' + XPath + ')', HTMLDocument, null, XPathResult.TYPE_ANY, null).numberValue;
    
    if (nrOfElementsWithXPath == 1) {
        return XPath;
    }
    else {
        var att = [];
        for (var i = 0; i < targetNode.attributes.length; i++) {
            if (['href', 'id', 'class'].indexOf(targetNode.attributes[i].nodeName) == -1) {
                att.push(targetNode.attributes[i]);
            }
        }
        
        for (var i = 0; i < att.length; i++) {

            var newXPath = XPath + '[@' + att[i].nodeName + '="' + att[i].nodeValue + '"]';
            nrOfElementsWithXPath = document.evaluate('count(' + newXPath + ')', HTMLDocument, null, XPathResult.TYPE_ANY, null).numberValue;

            if (nrOfElementsWithXPath == 1) {
                return newXPath;
            }
        }

        return null;

    }

}

//xpath segment lookup
function getXPath(targetNode) {
    for(var xpathSegments = []; targetNode != null && targetNode.localName != 'body' && targetNode.nodeType == 1; targetNode = targetNode.parentNode) {
        //if it has an id make the xpath specified to the id else class else clean tagname

        var segment =   {'type' : targetNode.localName}

        if (segment.type != 'td' && segment.type != 'table') {
            if (targetNode.hasAttribute('id') && targetNode.getAttribute('id') != '') {
                segment['id'] = targetNode.getAttribute('id');
            }
            else if (targetNode.hasAttribute('class') && targetNode.getAttribute('class') != '') {
                segment['class'] = targetNode.getAttribute('class');
            }
        }
        else {
            for (i = 1, sib = targetNode.previousSibling; sib; sib = sib.previousSibling) { 
                if (sib.localName == targetNode.localName) {
                    i++;
                }
            }
            segment['number'] = i;
        }

        xpathSegments.push(segment);

    }

    return xpathSegments;
}

//make normal text out of segment array
function segmentsToXPathText(XPathSegments) {

    if (XPathSegments.length > 0) {

        XPathSegments = XPathSegments.slice(0, XPathSegments.length < 5 ? XPathSegments : 5);
        XPathSegments.reverse();

        var textToReturn = '/';
        for (var i = 0; i < XPathSegments.length; i++) {

            var segment = XPathSegments[i];
            textToReturn += '/' + segment.type;

            for (var property in segment) {
                if (property == 'number') {
                    textToReturn += '[' + segment[property] + ']';
                }
                else if (property != 'type') {
                    textToReturn += '[@' + property + '="' + segment[property] + '"]';
                }
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
            var finalSegment = {'type' : XPathSegments1[i].type};

            if (segment1['number'] != null && segment1['number'] == segment2['number']) {
                finalSegment['number'] = segment1.number;
            }
            else if (segment1['id'] != null && segment1['id'] == segment2['id']) {
                finalSegment['id'] = segment1['id'];
            }
            else if (segment1['class'] != null && segment1['class'] == segment2['class']) {
                finalSegment['class'] = segment1['class'];
            }

            result.push(finalSegment);
        }

    }

    var resulttext = segmentsToXPathText(result);

    return resulttext;
}
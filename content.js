var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

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

    return JSON.stringify(returnArray);

}

function Crawl(columnNames, XPaths) {

    // $('body').append('<div id="CrawlScrapeContentDiv" style="width:100%; height: 100%; background-color: red"></div>');

    // $('#CrawlScrapeContentDiv').load(document.URL, function(response, status, xhr) {
    //     if (status != "error") {
    //         var HTMLString = $('#CrawlScrapeContentDiv').html();
            
    //         var parser = new DOMParser();
    //         var HTMLDocument = parser.parseFromString(HTMLString, "text/html");

    //         console.log('type: ' + toType(HTMLDocument));

    //         console.log(HTMLDocument.documentElement.innerHTML);
    //     }
    // });

    $.get(document.URL, function(HTMLString) {

        var parser = new DOMParser();
        var HTMLDocument = parser.parseFromString(HTMLString, "text/html");

        var title = getInnerHTMLFromXPath(columnNames, XPaths, HTMLDocument);
        console.log(title);

    }, 'html');

}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message == "addColumnToNewDatabase") {
            sendResponse({message: "readyToAddColumn"});
        }
    }
);

//Cancel all mouseover and click events; when a user clicks (for example) a hyperlink,
//we want the link to be selected, but we don't want the hyperlink reference to be opened.
$('body').on('click', function(e) {
   e.preventDefault();
});

document.addEventListener("mouseover", function( event ) {   
    // highlight the mouseover target
    if(!$(event.target).data('originalborder')) {
        $(event.target).data('originalborder', event.target.style.border);
    }
    event.target.style.border = "2px solid #0dcaff";

}, false);


document.addEventListener("mouseout", function(e) { 
    e.target.style.border = $(e.target).data('originalborder');
}, false);

//add event listener for element selection click
document.addEventListener('click', printMousePos);

var firstClick;
var secondClick;
var thirdClick;

//get target element and print xpath of the element
function printMousePos(e) {

    if (firstClick == null) {
        firstClick = getXPath(e.target);
    }
    else if (secondClick == null) {
        secondClick = getXPath(e.target);
        alert(matchShortestCommonXPath(firstClick, secondClick));
    }
    else if (thirdClick == null) {
        thirdClick = getXPath(e.target);
    }
    else {
        var fourthClick = getXPath(e.target);

        var firstFinalXPath = matchShortestCommonXPath(firstClick, secondClick);
        var secondFinalXPath = matchShortestCommonXPath(thirdClick, fourthClick);

        var columnNames = ['phone_name', 'storage_capacity'];
        var XPaths = [firstFinalXPath, secondFinalXPath];

        Crawl(columnNames, XPaths);
    }

    // $(elementMouseIsOver).css('box-shadow', '0 0 5px #0dcaff');
}

/*
//standard element object to xpath string function
function getXPath(targetNode) { 
    var allNodes = document.getElementsByTagName('*'); 
    for (var segs = []; targetNode && targetNode.nodeType == 1; targetNode = targetNode.parentNode) 
    { 
        if (targetNode.hasAttribute('id')) { 
                var uniqueIdCount = 0; 
                for (var n=0;n < allNodes.length;n++) { 
                    if (allNodes[n].hasAttribute('id') && allNodes[n].id == targetNode.id) uniqueIdCount++; 
                    if (uniqueIdCount > 1) break; 
                }; 
                if ( uniqueIdCount == 1) { 
                    segs.unshift('id("' + targetNode.getAttribute('id') + '")'); 
                    return segs.join('/'); 
                } else { 
                    segs.unshift(targetNode.localName.toLowerCase() + '[@id="' + targetNode.getAttribute('id') + '"]'); 
                } 
        } else if (targetNode.hasAttribute('class')) { 
            segs.unshift(targetNode.localName.toLowerCase() + '[@class="' + targetNode.getAttribute('class') + '"]'); 
        } else { 
            for (i = 1, sib = targetNode.previousSibling; sib; sib = sib.previousSibling) { 
                if (sib.localName == targetNode.localName)  i++; }; 
                segs.unshift(targetNode.localName.toLowerCase() + '[' + i + ']'); 
        }; 
    }; 
    return segs.length ? '/' + segs.join('/') : null; 
}; */

//xpath segment lookup
function getXPath(targetNode) {
    for(var xpathSegments = []; targetNode != null && targetNode.localName != 'body' && targetNode.nodeType == 1; targetNode = targetNode.parentNode) {
        //if it has an id make the xpath specified to the id else class else clean tagname

        var segment =   {'type' : targetNode.localName,
                        'id' : null,
                        'class' : null,
                        'number' : null};

        if (segment.type != 'td') {
            if (targetNode.hasAttribute('id')) {
                segment.id = targetNode.getAttribute('id');
            }
            if (targetNode.hasAttribute('class')) {
                segment.class = targetNode.getAttribute('class');
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
                                'class' : null};

            //Add class if classes match
            if (segment1.class == segment2.class) {
                finalSegment.class = segment1.class;
            }

            //Add id if id's match
            if (segment1.id == segment2.id) {
                finalSegment.id = segment1.id;
            }
            result.push(finalSegment);
        }

    }

    var resulttext = segmentsToXPathText(result);

    return resulttext;
}

//xpath text of target node
function nodeToXPathText(targetNode) {
    var xpathSegments = getXPath(targetNode);
    return segmentsToXPathText(xpathSegments);
}

//standard xpath element parsing function
function lookupElementByXPath(path) { 
    var evaluator = new XPathEvaluator(); 
    var result = evaluator.evaluate(path, document.documentElement, null,XPathResult.FIRST_ORDERED_NODE_TYPE, null); 
    return  result.singleNodeValue; 
}
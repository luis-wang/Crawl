function getInnerHTMLFromXPath(PassedXPath, HTMLDocument) {
    
    var result = document.evaluate(PassedXPath, HTMLDocument, null, XPathResult.ANY_TYPE, null);

    var nodes = [];
    for (var node = result.iterateNext(); node != null; node = result.iterateNext()) {
        nodes.push(node.textContent);
    }

    return nodes;

}

function Crawl(XPath) {

    $.get(document.URL, function(HTMLString) {

        var parser = new DOMParser();
        var HTMLDocument = parser.parseFromString(HTMLString, "text/html");

        var title = getInnerHTMLFromXPath(XPath, HTMLDocument);
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
$('body').on('mouseover', false);

//add event listener for element selection click
document.addEventListener('click', printMousePos);

//get target element and print xpath of the element
function printMousePos(e) {

    var secondClick = getXPath(e.target);
    var finalxpath = matchShortestCommonXPath(secondClick);
    alert(finalxpath);
    Crawl(finalxpath);

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
        if (targetNode.hasAttribute('id')) {
                xpathSegments.push(targetNode.localName + '[@id="' + targetNode.getAttribute('id') + '"]');
        }
        else if (targetNode.hasAttribute('class')) {
                xpathSegments.push(targetNode.localName + '[@class="' + targetNode.getAttribute('class') + '"]');
        }
        else {
            xpathSegments.push(targetNode.localName);
        }
    }
    //join the segments to get xpath text
    //return segmentsToXPathText(xpathSegments);
    
    //dont join and give segment array
    return xpathSegments;
}

//make normal text out of segment array
function segmentsToXPathText(xpathSegments) {
    xpathSegments.reverse();
    if (xpathSegments.length > 0)
        return '//' + xpathSegments.join('/');
    else
        return null;
}

//give xpath text that describes 2 target nodes
function matchShortestCommonXPath(xpathSegments) {
    var result = [];
    for(var i = 0; i < xpathSegments.length; i++) {
        result.push(xpathSegments[i]);
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
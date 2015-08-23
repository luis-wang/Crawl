function getTitle(PassedXPath, HTMLDocument) {
    return document.evaluate(PassedXPath, HTMLDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;
}

function getInnerHTMLFromXPath(part1) {

    var pageHTML;
    $.get('https://tweakers.net/categorie/215/smartphones/producten/#filter:q1YqSExPVbIy1AEzgjOrQBwDg1oA', function(pageHTML) {

        var parser = new DOMParser();
        var HTMLDocument = parser.parseFromString(pageHTML, "text/html");

        var title = getTitle(part1, HTMLDocument);
        console.log(title);

    }, 'html');

}

getInnerHTMLFromXPath('/html/body[@class="fixedHeader hasTracker smallTracker"]/div[@id="layout"]/div[@id="contentArea"]/div[@class="contentArea"]/div[@id="tab:producten"]/div[@class="productFilter productCompare responsiveFilter"]/div[@id="listingContainer"]/div[@id="listing"]/form[@id="compareProductListing"]/table[@class="listing useVisitedState"]/tbody/tr/td[@class="itemname"]/p[@class="ellipsis"]/a');
getInnerHTMLFromXPath('/html/body/div[2]/div/div[2]/div/div/div[2]/div/form/table/tbody/tr/td[3]/p/a');

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

var firstClick;

//add event listener for element selection click
document.addEventListener('click', printMousePos);

//get target element and print xpath of the element
function printMousePos(e) {

    if (firstClick == null) {
        firstClick = getXPath(e.target);
        alert(firstClick);
    }
    else {
        var secondClick = firstClick = getXPath(e.target);
        alert(secondClick);
        alert(matchShortestCommonXPath(firstClick, secondClick));
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
    for(var xpathSegments = []; targetNode != null && targetNode.nodeType == 1; targetNode = targetNode.parentNode) {
        //if it has an id make the xpath specified to the id else class else clean tagname
        if(targetNode.hasAttribute('id')) {
            xpathSegments.push(targetNode.localName.toLowerCase() + '[@id="' + targetNode.getAttribute('id') + '"]');
        }
        else if(targetNode.hasAttribute('class')) {
            xpathSegments.push(targetNode.localName.toLowerCase() + '[@class="' + targetNode.getAttribute('class') + '"]');
        }
        else {
            xpathSegments.push(targetNode.localName.toLowerCase());
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
    if(xpathSegments.length > 0)
        return '/' + xpathSegments.join('/');
    else
        return null;
}

//give xpath text that describes 2 target nodes
function matchShortestCommonXPath(firstTarget, secondTarget) {
    var xpathSegmentsFirst = firstTarget;
    var xpathSegmentsSecond = secondTarget;
    var result = [];
    for(var i = 0; i < xpathSegmentsFirst.length && i < xpathSegmentsSecond.length; i++) {
        if(xpathSegmentsFirst[i] == xpathSegmentsSecond[i])
            result.push(xpathSegmentsFirst[i]);
        else
            break;
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
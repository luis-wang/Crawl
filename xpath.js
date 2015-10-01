var kMaxXPathLength = 5;

//unique xpath lookup, used to find the unique xpath for the next button in the pagination box
function getUniqueXPath(targetNode) {

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

    //Remove everyting more specific than the hyperlink itself
    XPathElements.splice(0, hyperlinkIndex);

    var XPath = segmentsToXPathText(XPathElements);
    var nrOfElementsWithXPath = document.evaluate('count(' + XPath + ')', document, null, XPathResult.TYPE_ANY, null).numberValue;
    
    if (nrOfElementsWithXPath == 1) {

        var i;
        for (i = Math.min(XPathElements.length - 1, kMaxXPathLength); i > 1 && nrOfElementsWithXPath == 1; i--) {
            var newXPath = segmentsToXPathText(XPathElements.slice(0, i));
            nrOfElementsWithXPath = document.evaluate('count(' + newXPath + ')', document, null, XPathResult.TYPE_ANY, null).numberValue;
        }

        return segmentsToXPathText(XPathElements.slice(0, i));

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
            nrOfElementsWithXPath = document.evaluate('count(' + newXPath + ')', document, null, XPathResult.TYPE_ANY, null).numberValue;

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

        XPathSegments = XPathSegments.slice(0, XPathSegments.length < kMaxXPathLength ? XPathSegments.length : kMaxXPathLength);
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
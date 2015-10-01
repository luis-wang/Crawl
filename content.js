//make message box for page
$("body").append("<div id='messageBoxForScraper' style=\"background-color:#0dcaff;color:white;position:fixed;z-index:9001;top:100px;left:0px;width:200px;height:250px;padding:20px;border-radius: 0px 15px 15px 0px; display:none;font-family: 'Lato', sans-serif;font-weight: 400;font-size: 18px;text-align: center;\"></div>");

//toggle selection mode variable
var toggleClick = false;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message == "addColumnToNewDatabase") {
            sendResponse({message: "readyToAddColumn"});
        }
        if (request.message == "toggleSelectorMode") {
            sendResponse({message: "readyToAddXPath"});
            $("#messageBoxForScraper").toggle();
            $("#messageBoxForScraper").html("Klik 2 elementen om het pad te matchen. Klik hierna op 'Klaar' om dit proces te voltooien.");
            if (toggleClick == false) {
                toggleClick = true;
            }
            else {
                toggleClick = false;
            }
        }
    }
);

//Set cursor of all hyperlinks to pointer
$('a').css('cursor', 'pointer');

$("*").on('mouseenter', function() {
    if (toggleClick == true) {
        removeAttributeFromNode(this, 'onclick');
        removeAttributeFromNode(this, 'href');
    }
});
$("*").on('mouseleave', function() {
    if (toggleClick == true) {
        addAttributeToNode(this, 'storedonclick');
        addAttributeToNode(this, 'storedhref');
    }
});
function removeAttributeFromNode(element, attributeName) {
    if (element.getAttribute(attributeName) != null) {
        var att = element.getAttribute(attributeName);
        element.setAttribute('stored' + attributeName, att);
        element.removeAttribute(attributeName);
    }
}
function addAttributeToNode(element, attributeName) {
    if (element.getAttribute(attributeName) != null) {
        var att = element.getAttribute(attributeName);
        element.removeAttribute(attributeName);
        var newAttributeName = attributeName.substring('stored'.length, attributeName.length);
        element.setAttribute(newAttributeName, att);
    }
}

document.addEventListener("mouseover", function( event ) {   
    if (toggleClick == true) {
        // highlight the mouseover target
        if (!$(event.target).data('originalborder')) {
            $(event.target).data('originalborder', event.target.style.boxShadow);
        }
        event.target.style.boxShadow = "0px 0px 0px 2px #0082AA";
    }
}, false);

document.addEventListener("mouseout", function(e) {
    e.target.style.boxShadow = $(e.target).data('originalborder');
}, false);
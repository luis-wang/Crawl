//make message box for page
$("body").append("<div id='messageBoxForScraper'></div>");

//Functions

// var toType = function(obj) {
//   return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
// }

//toggle selection mode variable
var toggleClick = false;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
<<<<<<< HEAD
        if (request.message == "addColumnToNewDatabase") {
            sendResponse({message: "readyToAddColumn"});
        }
        if (request.message == "toggleSelectorMode") {
            sendResponse({message: "readyToAddXPath"});
            $("#messageBoxForScraper").toggle();
            $("#messageBoxForScraper").html("Klik 2 elementen om het pad te matchen. Klik hierna op 'Klaar' om dit proces te voltooien.");
            if (toggleClick == false) {
=======
        if(request.message == "toggleSelectorMode") {
            sendResponse({message: "readyToAddXPath"});
            $("#messageBoxForScraper").toggle();
                //Look up / store database name
                $('#databaseName').val(localStorage.getItem('databaseName'));
                $('#databaseName').on('keyup', function() {
                    var dbname = $('#databaseName').val();
                    localStorage.setItem('databaseName', dbname);
                });
            $("#messageBoxForScraper").append("<h1 id=\"pageTitle\">Create database</h1>");
            $("#messageBoxForScraper").append("<div id=\"gradientLine\"></div>");
            $("#messageBoxForScraper").append("<input spellcheck=\"false\" type=\"text\" name=\"databaseName\" id=\"databaseName\" placeholder=\"Database name\" class=\"inputInBox\" style=\"margin:auto;\">");
            $("#messageBoxForScraper").append("<div id=\"addButtonDiv\"></div>");
            $("#messageBoxForScraper").append("<a id=\"addFieldBtn\" class=\"btn\">+ Add field to database</a>");
            $("#messageBoxForScraper").append("<a id=\"doneBtn\" class=\"btn\">Klaar</a>");
            if(toggleClick == false) {
>>>>>>> origin/master
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
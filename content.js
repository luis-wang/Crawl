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
    var isContentBox = false;
    var obj = event.target;
    for(var i = 0; i <3 /*crawl*/; i++) {
        if(obj.getAttribute('id') == "messageBoxForScraper") {
            isContentBox = true;
            break;
        }
        if(obj.parentNode != null)
            obj = obj.parentNode;
    }
    if(toggleClick == true && isContentBox == false) {
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
//make message box for page
$("body").append("<div id='messageBoxForScraper' style=\"background-color:#0dcaff;color:white;position:fixed;z-index:9001;top:100px;left:0px;width:200px;height:250px;padding:20px;border-radius: 0px 15px 15px 0px; display:none;font-family: 'Lato', sans-serif;font-weight: 400;font-size: 18px;text-align: center;\"></div>");

//Functions

// var toType = function(obj) {
//   return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
// }

//toggle selection mode variable
var toggleClick = false;


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.message == "addColumnToNewDatabase") {
            sendResponse({message: "readyToAddColumn"});
        }
        if(request.message == "toggleSelectorMode") {
            sendResponse({message: "readyToAddXPath"});
            $("#messageBoxForScraper").toggle();
            $("#messageBoxForScraper").html("Klik 2 elementen om het pad te matchen. Klik hierna op 'Klaar' om dit proces te voltooien.");
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
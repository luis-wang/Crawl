//Cancel all mouseover and click events; when a user clicks (for example) a hyperlink,
//we wan't the link to be selected, but we don't want the href to be opened.
$('body').on('click', function(e) {
    e.preventDefault();
});
$('body').on('mouseover', false);

//add event listener for element selection click
document.addEventListener("click", printMousePos);

function printMousePos(e) {
    
    //get target element and print xpath of the element
    var elementMouseIsOver = e.target;
    var x = getXPath(elementMouseIsOver);
    $(elementMouseIsOver).css("text-shadow","0 0 3px #0dcaff");

}

//standard element object to xpath string function
function getXPath(element) {

	var val=element.value;
    var xpath = '';
    for (; element && element.nodeType == 1; element = element.parentNode) {
        var id = $(element.parentNode).children(element.tagName).index(element) + 1;
        id > 1 ? (id = '[' + id + ']') : (id = '');
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
    }
    return xpath;

}
//add event listener for element selection click
document.addEventListener("click", printMousePos);

function printMousePos(e) {
    //get target element and print xpath of the element
    var elementMouseIsOver = e.target;
    var x = getXPath(elementMouseIsOver);
    $(elementMouseIsOver).css("text-shadow","0 0 3px #0dcaff");
}

//standard element object to xpath string function
function getXPath(element)
{
	var val=element.value;
    var xpath = '';
    for (; element && element.nodeType == 1; element = element.parentNode) {
        var id = $(element.parentNode).children(element.tagName).index(element) + 1;
        id > 1 ? (id = '[' + id + ']') : (id = '');
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
    }
    return xpath;
}
if($.views != undefined){
	$.views.helpers({
		nl2br: nl2br
	});
}

function nl2br(str){
	return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');
}
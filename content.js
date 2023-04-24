chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action == "copyIframeContent") {
		var iframeContent = "";
		var divContent = "";
		try {
			var iframe = document.getElementById("iframe");
			//obtengo codigo del del body del iframe
			iframeContent = iframe.contentWindow.document.body.innerHTML;
		} catch (e) {
		
		}
		try {
			var divs = document.querySelectorAll(".color3");
			for (let i = 0; i < divs.length; i++) {
				divContent += divs[i].innerHTML;
			}

		}catch (e) {
		
		}
		sendResponse({ content: iframeContent, divContent: divContent });
	}
});

function clasificador(href){
	let extension = false;
	//analizamos si el link es un zip, pdf, doc o un excel o si no es ninguno type default
	if (href.includes(".zip")) {
		return {"url":href,"type": "Archivo ZIP","icon":"./images/zip.png"};
		extension = true;
	}
	if (href.includes(".pdf")) {
		return {"url":href,"type": "Documento PDF", "icon":"./images/pdf.png"};
		extension = true;
	}
	//doc or docx
	if (href.includes(".doc") || href.includes(".docx")) {
		return {"url":href,"type": "Documento de Word", "icon":"./images/doc.png"};
		extension = true;
	}
	//xls o xlsx
	if (href.includes(".xls") || href.includes(".xlsx")) {
		return {"url":href,"type": "Dcoumento de Excel", "icon":"./images/xls.png"};
		extension = true;
	}
	
	//analizamos si no termina en dominio
	if (href.includes(".html") || href.includes(".html") || href.includes(".co") || href.includ(".net") || href.includes(".es") || href.includes(".org")   ) {
		return {"url":href,"type": "Página Web","icon":"./images/html.png"};
		extension = true;
	}
	if (!extension){
		return {"url":href,"type": "Archivo", "icon":"./images/default.png"};
	}

} 
function extraerURLs(html) {
	const links = [];
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, "text/html");

	// Extraer URLs de las funciones
	const elementosConWindowOpen = doc.querySelectorAll('[onclick*=\'window.open(\']');
	elementosConWindowOpen.forEach(elemento => {
		// Obtener la cadena del atributo onclick
		const onclick = elemento.getAttribute('onclick');
		
		// Extraer la URL utilizando expresiones regulares
		const regex = /window\.open\('([^']*)', '_blank'\)/;
		const resultado = regex.exec(onclick);
		
		if (resultado) {
		  // Obtener la URL extraída
		  let url = validadorURL(resultado[1]);
		  if (url){
			links.push(clasificador(url));
		  }
		}
	});

	// Extraer URLs de links
	const aTags = doc.getElementsByTagName("a");
	for (const aTag of aTags) {
		const href = validadorURL(aTag.getAttribute("href"));
		if (href && href !== "#" && !links.includes(href)) {
			links.push(clasificador(href));
		}
	}
	// Extraer URLs de imágenes
	const imgTags = doc.getElementsByTagName("img");
	for (const imgTag of imgTags) {
		const src = validadorURL(imgTag.getAttribute("src"));
		if (src && !links.includes(src)) {
			links.push({"url":src,"type": "Imagen","icon":"./images/image.png"});
		}
	}
	// Extraer URLs de backgrounds
	const elementosConBackground = doc.querySelectorAll("[style*='background-image']");
	for (const elemento of elementosConBackground) {
		const style = elemento.getAttribute("style");
		const urlMatch = style.match(/background-image\s*:\s*url\(['"]?([^'")]+)['"]?\)/i);
		if (urlMatch && urlMatch[1] && !links.includes(urlMatch[1])) {
			var url = validadorURL(urlMatch[1]);
			if (url){
				links.push({"url":url,"type": "Imagen","icon":"./images/image.png"});
			}
		}
	}
	
	return links;
}
function validadorURL(url) {
	//retornamos false si la url es null o undefined o si comienza por ../ https://territorium_lithium.s3.amazonaws.com/
	if (!url || url=='undefined' || url.startsWith("../") || url.startsWith("https://territorium_lithium.s3.amazonaws.com/")) {
		return false;
	}
	//analizamos si los primero caracteres son /content o /sites le devemos agregar el dominio https://sena.territorio.la/
	const dominio = "https://sena.territorio.la";
	if (url && (url.startsWith("/content") || url.startsWith("/content"))) {
		return dominio + url;
	}
	return url;
}


document.addEventListener("DOMContentLoaded", function () {
	var copyButton = document.getElementById("extrac");
	copyButton.addEventListener("click", function () {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: "copyIframeContent" }, function (response) {
				var content="";
				if (response.content!=""){
					content =content+response.content;
				}
				if (response.divContent!=""){
					content =content+response.divContent;
				}
				//convertimos a string el objeto de la función extraerURLs
				let links = extraerURLs(content);
				let extraerURLstext = JSON.stringify(extraerURLs(content));
				let html ="<ul>";
				for (let i = 0; i < links.length; i++) {
					html += `<li>
					<img src='${links[i].icon}' width='20px' height='20px'>&nbsp;&nbsp;
					<a class="abrirviculos" href="#" data-link='${links[i].url}' >${links[i].type}</a> 
					<button class="vinculos" data-url="${links[i].url}">
						<img src='./images/copy.png' width='20px' height='20px'>
					</button>
					</li>`;
				}
				html += "</ul>";
				const copyPortapales= function(url){
					//creamos un elemento input
					var aux = document.createElement("input");
					//asignamos el valor del elemento
					aux.setAttribute("value", url);
					//añadimos el elemento al body
					document.body.appendChild(aux);
					//seleccionamos el contenido del elemento
					aux.select();
					//copiamos el contenido
					document.execCommand("copy");
					//eliminamos el elemento
					document.body.removeChild(aux);
				}
				//abrimos una ventana nueva con el contenido de la variable html
				document.getElementById("links").innerHTML = html;
				//asignamos el evento a los elementos de .vinculos
				document.querySelectorAll(".vinculos").forEach(item => {
					item.addEventListener("click", event => {
						if (event.target.dataset.url == undefined){
							copyPortapales(event.target.parentNode.dataset.url);
						}else{
							copyPortapales(event.target.dataset.url);
						}
						//ponemos en opacity 1 el elemento alert
						document.getElementById("alert").style.display = "block";
						document.getElementById("alert").style.opacity = 1;
						setTimeout(function () {
							//ponemos en opacity 0 el elemento alert
							document.getElementById("alert").style.opacity = 0;
							setTimeout(function () {
								//ocultamos el elemento alert
								document.getElementById("alert").style.display = "none";
							}, 500);
						}, 2000);
					});
				});

				document.querySelectorAll(".abrirviculos").forEach(item => {
					item.addEventListener("click", event => {
						window.open(event.target.dataset.link,"popupWindow", "width=600,height=400");
					});
				});
				
			});
		});
	});
});

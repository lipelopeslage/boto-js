;(function(root, undefined){
	"use strict";

	var loaders, routes, self;

	function initRoutes(data) {
		routes = Boto.routes;
		routes.init(data);
	} 

	root.Boto = {
		initWithSitemap : function(sitemapPath, callback){
			self = this;
			Boto.loaders.loadDoc(sitemapPath, function(data){
				initRoutes(data);
				if(callback && typeof(callback) == "function") callback(data);
			}); 
		}
		, navigateTo: function(path){ 
			routes.manage(path || "/"+self.defaultPage);
		}
		,setPage : function(pageScope){
			var newPage = new pageScope();
			Boto.page = newPage.page;
		}
		, setCurrentPage : function(page){this.currentPage = page;}
		, getBreadCrumb : function(){ return routes.getBreadCrumb(); }
		, getHash : function(){ return routes.getHash(); }
		, resize : function () {
			var breadCrumb = (routes) ? Boto.getBreadCrumb() : [];
			for(var i in breadCrumb){
				if(breadCrumb[i].page && breadCrumb[i].page.resize) breadCrumb[i].page.resize();
			}
		}
	}	

})(window)
/*****************************
/*****************************
******** TRANSITIONS *********
******************************
/*****************************/
;(function(root, undefined) {
	var transitionsQueue = [];

	function transitionComplete() {
		transitionsQueue.shift();
		if(transitionsQueue.length) runTransition();
	}

	function runTransition() {
	  	var transition = transitionsQueue[0], state = transition.state, data = transition.data, params = transition.params || null;
		switch(state){
			case "load":
				root.loaders.loadPage(data, transitionComplete);
			break;
			case "init":
				data.page.initiated = transitionComplete;
				data.page.init(params);				
			break;
			case "show":
				data.page.showed = transitionComplete;
				data.page.show(params);
			break;
			case "update":
				data.page.updated = transitionComplete;
				data.page.update(params);
			break;
			case "hide":
				data.page.hidden = transitionComplete;
				data.page.hide();
			break;
		}
	}

	root.transitions = {
		addTransition : function(state, data, params){
			/*
				state: transition type
				data: pageNode type, created on JSON parsing
				params: URL params
			*/
			var autoexec = Boolean(transitionsQueue.length) ? false : true;
			transitionsQueue.push({state: state, data: data, params: params});
			if(autoexec) runTransition();
		}
	}

})(window.Boto)
/*****************************
/*****************************
*********** LOADERS **********
******************************
/*****************************/
;(function(root, undefined) {
	var routes;

	function loadScript(jsFileString, callback){
		var head = document.getElementsByTagName('head')[0],
			script = document.createElement('script'),
			date = new Date();

		script.type = 'text/javascript';
		script.onreadystatechange = function (res) {
			if(!String(window.navigator.userAgent).match(/MSIE 9.0/)){
				script.onreadystatechange = function(){
					if (this.readyState == 'complete' || this.readyState == 'loaded') callback(res);
				}
			}
		}
		script.onload = callback;	
		script.src = jsFileString+"?nocache="+date.getTime();
		head.appendChild(script);
	}

	function parseXML(xmlDoc, callback){
		function parseNode(node, parentRoute){
			var hasAttr = Boolean(node.attributes)
				,id = (hasAttr && node.attributes[0]) ? node.attributes[0].value || "" : "" 
				,route = (hasAttr && node.attributes[1]) ? node.attributes[1].value || "" : ""
				,klass = (hasAttr && node.attributes[2]) ? node.attributes[2].value || "" : ""
				,parentRoute = parentRoute || "", tagName = node.tagName, sub = []
				,subNodes = (node.hasChildNodes()) ? node.childNodes : [];
			
			for(var i = 0, total = subNodes.length; i < total; i++){
				if(subNodes[i].attributes) sub.push(parseNode(subNodes[i], route));  //sub.push(parseNode(subNodes.item(i), route));
			}

			return {tagName: tagName, id: id, klass: klass, route: route, fullRoute: parentRoute+route, sub: sub};
		}	
		routes = parseNode(xmlDoc.getElementsByTagName("sitemap").item(0)).sub[0];
		callback(routes);
	}

	function parseJSON(jsonDoc, callback){
		var json = JSON.parse(jsonDoc);
		function parseObject(object, parentRoute){
			var id = object.id || "" 
				,route = object.route || ""
				,klass = object.klass || ""
				,parentRoute = parentRoute || "", tagName = object.id, sub = []
				,subNodes = object.sub || [];

			for(var i = 0, total = subNodes.length; i < total; i++){
				sub.push(parseObject(subNodes[i], route));  //sub.push(parseNode(subNodes.item(i), route));
			}

			return {tagName: tagName, id: id, klass: klass, route: route, fullRoute: parentRoute+route, sub: sub};
		}
		routes = parseObject(json);
		callback(routes);
	}

	root.loaders = {
		loadPage : function(data, callback) { 
			// forked from function loadXMLDoc(dname) from: http://www.w3schools.com/dom/dom_loadxmldoc.asp
			var pageInfo = data;
			loadScript(data.klass, function(e){
				// pegar o valor da página recém carregada de Boto.page foi o jeito mais seguro
				// de pegar o conteúdo de um arquivo e inserí-lo em outro (através do escopo global)
				data.page = Boto.page || Boto.createBlankPage(); 
				data.page.pageInfo = pageInfo; // o atributo pageInfo dentro de cada página contém as informações vindas do jsonDoc
				Boto.setCurrentPage(data.page);
				Boto.page = null; // elimina o valor para poder ser referenciado num próximo load
				callback();
			})
		}
		,loadDoc : function(dname, callback) {
			if (window.XMLHttpRequest) {
			  xhttp = new XMLHttpRequest();
			} else {
			  xhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}

			xhttp.onreadystatechange = function() {
				if(xhttp.readyState == 4){
					if(String(dname).match(/.xml/)){
						parseXML(xhttp.responseXML, callback);
					} else {
						parseJSON(xhttp.responseText, callback);
					}
				}				
			}
			xhttp.open("GET", dname, false);
			xhttp.send();
		}
		,loadAssets : null
	}

	root.createBlankPage = function(){
		return {
			init : function(){
				console.log(this.pageInfo.id+" [ABSCTRACT] init()");
				this.initiated();
			},
			show : function(){
				console.log(this.pageInfo.id+" [ABSTRACT] show()");
				this.showed();
			},
			update : function(){
				console.log(this.pageInfo.id+" [ABSTRACT] update()");
				this.updated();
			},
			hide : function(){
				console.log(this.pageInfo.id+" [ABSTRACT] hide()");
				this.initiated();
			},
			resize : function(){
				console.log(this.pageInfo.id+" [ABSTRACT] resize()");
				this.initiated();
			}
		}
	}

	
})(window.Boto)
/*****************************
/*****************************
******* ROUTE MANAGER ********
******************************
/*****************************/
;(function(root, undefined) {
	var transitions, routes, hash, breadCrumb;

	function manageRoutes(path){
		var array = [], count = 0, total, newBreadCrumb = [], newHash = "", regexp, isMatch, parameters;
		
		array = path.split("/");
		array.shift();
		total = array.length;

		function getByRoute(json, path){
			for(var i in json.sub){
				var module = json.sub[i], route = module.route, sub = module.sub;

				if(route == path) {
					newHash += route;
					newBreadCrumb.push(module);
					if(count < total){
						search(module)
					}
				}else{
					getByRoute(module, path)
				}
			}	
		}

		function search(module){
			var route = "/"+array[count];
			count++;
			getByRoute(module, route);
		}
		
		if(!hash){ // se for a primeira vez
			search(routes);
			hash = newHash;
		}else{
			search(routes);
			//regexp = new RegExp(newHash);
			//if(!regexp.test(hash))
				hash = newHash;
		}
		
		parameters = array.slice(newBreadCrumb.length, array.length);
		
		if(!parameters.length) parameters = null;
		if(routes.klass) {
			//se root for um módulo, na primeira vez ele concatena sua rota apenas para criar o breadcrumb
			//daí em diante, ele aproveita que root já possui atributo 'page' e utiliza seu breadCrumb 
			//para concatenar com a próxima url que vier
			if(!breadCrumb)
				newBreadCrumb = [{id:"root", klass:routes.klass, route:routes.route}].concat(newBreadCrumb); 
			else
				newBreadCrumb = [breadCrumb[0]].concat(newBreadCrumb);
		}
		createBreadCrumb(newBreadCrumb, parameters);
	}

	
	function createBreadCrumb(bCrumb, params){ // verifica os breadcrumbs e quais as transições necessárias
		var newBreadCrumb, remainBCrumb, count = 0, doUpdate = true, bCrumbLength;
		function hideItems(arr){
			var i = arr.length;
			while(i--){
				if(arr[i].id != "root") transitions.addTransition("hide", arr[i]);
			}
		}

		function initItems(arr, firstTime){
			var i = 0, total = arr.length;
			while(i < total){
				transitions.addTransition("load", arr[i]);
				transitions.addTransition("init", arr[i], params);
				transitions.addTransition("show", arr[i], params);
				i++;
			}
		}

		if(breadCrumb){
			for(var i in bCrumb){
				if(!breadCrumb[i] || breadCrumb[i].route != bCrumb[i].route){ // verifica não só se os breadcrumbs são diferentes, mas o tamanho de um pro outro através de uma posição inexistente no novo array
					doUpdate = false; //se o breadcrumb anterior for diferente do atual, nao atualiza modulo atual
					hideItems(breadCrumb.slice(count, breadCrumb.length), false);
					initItems(bCrumb.slice(count, bCrumb.length))
					newBreadCrumb = breadCrumb.slice(0, count).concat(bCrumb.slice(count, bCrumb.length));
					break;
				}
				count++;	
			}
			if(bCrumb.length < breadCrumb.length){
				hideItems(breadCrumb.slice(bCrumb.length, breadCrumb.length), false);
			}
			if(doUpdate){
				transitions.addTransition("update", bCrumb[bCrumb.length -1], params); // atualiza o último módulo, antes do parâmetro
			}
			newBreadCrumb = bCrumb.slice();
		}else{			
			initItems(bCrumb, true);
			newBreadCrumb = bCrumb.slice();			
		}	

		breadCrumb = newBreadCrumb;
	}

	root.routes = {
		init : function(data){
			routes = data;
			transitions = Boto.transitions;
		}
		, manage : manageRoutes
		, getBreadCrumb : function() {
			/*
				Breadcrumb é a espinha dorsal, contém a hierarquia de todas as 
				páginas carregadas até o momento, onde cada página é representada
				por um objeto, contendo informações do objeto da página e informações
				que vieram do json e atribuídas no código posteriormente

			*/
			return breadCrumb;
		}
		, getHash : function() {
			return hash;
		}
	}
})(window.Boto)
/*****************************
/*****************************
***** ADDRESS BAR MANAGER ****
******************************
/*****************************/
;(function(root, undefined) {
	window.onhashchange = function(e){
		var h = e.newURL;
		h = h.substr(h.indexOf("#")+1, h.length);
		Boto.navigateTo(h);
	}
	window.onpopstate = function(event) {
		console.log("push: ",history.state)
	}
})(window.Boto)
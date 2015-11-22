;(function(root, undefined){
	"use strict";

	var loaders, routes, self;

	root.Boto = {
		init : function(obj){
			loaders = Boto.loaders;
			routes = Boto.routes;
			self = this;
			self.config = obj;
			self.useLog = obj.useLog || self.useLog
			this.setHashChange(obj.onHashChange);
			if(self.useLog == false && console) console.log = function(){}
			loaders.loadSitemap(obj.siteMap, function(data){
				routes.init(data);
				self.startNavigation();
				if(obj.callback && typeof(obj.callback) == "function") obj.callback(data);
			});
			self.polyfills();
		}
		, getDefaultPath : function(){
			return this.config.defaultPath;
		}
		, useLog : false
		, startNavigation : function(){
			if(this.config.autoStart != undefined && !this.config.autoStart) return;
			if(location.hash)
				self.navigateTo(location.hash.replace("#",""));
			else
				self.navigateTo();
		}
		, navigateTo: function(path){ 
			routes.manage(path || this.config.defaultPath);
		}
		, setPage : function(pageScope){
			var newPage = new pageScope();
			Boto.page = newPage.page;
		}
		, setHashChange : function(fn){
			window.onhashchange = fn || function(e){
				var h = e.newURL;
				h = h.substr(h.indexOf("#")+1, h.length);
				Boto.navigateTo(h);
			}
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
		, polyfills : function(){
			//forked from: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/map#Specifications
			if (!Array.prototype.map) {
			  Array.prototype.map = function(callback, thisArg) {
			    var T, A, k;
			    if (this == null) {
			      throw new TypeError(' this is null or not defined');
			    }
			    var O = Object(this);
			    var len = O.length >>> 0;
			    if (typeof callback !== 'function') {
			      throw new TypeError(callback + ' is not a function');
			    }
			    if (arguments.length > 1) {
			      T = thisArg;
			    }
				A = new Array(len);
			    k = 0;
			    while (k < len) {
			      var kValue, mappedValue;
			      if (k in O) {
			        kValue = O[k];
			        mappedValue = callback.call(T, kValue, k, O);
			        A[k] = mappedValue;
			      }
			      k++;
			    }
			    return A;
			  };
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
	  	var transition = transitionsQueue[0], state = transition.state, 
	  				 data = transition.data, params = transition.params || null;
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
				data.page.hidden = function(){
					data.page = null;
					transitionComplete();
				}
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

	function parseJSONSitmap(jsonDoc, callback){
		function parseObject(object, parentRoute){
			var id = object.id, route = object.route,
				klass = object.klass, parentRoute = parentRoute || "",
				sub = [], subNodes = object.sub || [],
				pageAssets = object.assets || [];

			subNodes.map(function(node){
				sub.push(parseObject(node, route));
			});

			return {
				id: id, 
				klass: klass, 
				route: route, 
				fullRoute: parentRoute+route, 
				sub: sub, 
				assets: pageAssets
			};
		}
		callback(parseObject(JSON.parse(jsonDoc)));
	}

	root.loaders = {
		loadPage : function(data, callback) { 
			// forked from function loadXMLDoc(dname) from: http://www.w3schools.com/dom/dom_loadxmldoc.asp
			loadScript(data.klass, function(e){
				// pegar o valor da página recém carregada de Boto.page foi o jeito mais seguro
				// de pegar o conteúdo de um arquivo e inserí-lo em outro (através do escopo global)
				data.page = (Boto.page) ? comparePage(Boto.page) : Boto.createBlankPage(); 
				data.page.pageInfo = data; // o atributo pageInfo dentro de cada página contém as informações vindas do jsonDoc
				Boto.setCurrentPage(data.page);
				Boto.page = null; // elimina o valor para poder ser referenciado num próximo load
				Boto.loaders.loadAssets(data, callback);
			});

			function comparePage(page){
				var blank = Boto.createBlankPage();
				for(i in blank){
					if(page[i] == undefined) page[i] = blank[i];
				}
				return page;
			}
		}
		,loadImage : function(iname, callback){
			var img = new Image();
			img.src = iname;
			img.onload = callback;
		}
		,loadSitemap : function(dname, callback) {
			Boto.loaders.loadDoc(dname, function(res){
				parseJSONSitmap(res, callback);
			});
		}
		,loadDoc : function(dname, callback) {
			if (window.XMLHttpRequest) {
			  xhttp = new XMLHttpRequest();
			} else {
			  xhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}

			xhttp.onreadystatechange = function() {
				if(xhttp.readyState == 4){
					callback(xhttp.responseText);
				}				
			}
			xhttp.open("GET", dname, true);
			xhttp.send();
		}
		,loadAssets : function(data, callback){
			var assets = data.assets || [], count = 0, total = assets.length;
			if(total == 0) {
				callback();
				return;
			}else{
				function lComplete(){
					if(count == total - 1){
						callback();
					}else{
						load(count++);
					}
				}	
				function load(idx){
					var fileName = assets[idx].src, image = fileName.match(/.jpg|.jpeg|.png|.gif/),
						doc = fileName.match(/.json/);
					if(image){
						Boto.loaders.loadImage(fileName, function(e){
							assets[idx].val = this;
							lComplete();
						});
					}else if(doc){
						Boto.loaders.loadDoc(fileName, function(json){
							assets[idx].val = json;
							lComplete();
						});
					}
				}
				load(0);
			}
		}
	}

	root.createBlankPage = function(){
		var useLog = Boto.useLog;
		return {
			init : function(){
				useLog && console.log(this.pageInfo.id+" [ABSCTRACT] init()");
				this.initiated();
			},
			show : function(){
				useLog && console.log(this.pageInfo.id+" [ABSTRACT] show()");
				this.showed();
			},
			update : function(){
				useLog && console.log(this.pageInfo.id+" [ABSTRACT] update()");
				this.updated();
			},
			hide : function(){
				useLog && console.log(this.pageInfo.id+" [ABSTRACT] hide()");
				this.initiated();
			},
			resize : function(){
				useLog && console.log(this.pageInfo.id+" [ABSTRACT] resize()");
				this.initiated();
			},
			getAsset : function(id){
				return this.pageInfo.assets.filter(function(elem){
					return elem.id == id;
				})[0].val;
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

		function initItems(breadCrumbArray, params){
			breadCrumbArray.map(function(item){
				transitions.addTransition("load", item);
				transitions.addTransition("init", item, params);
				transitions.addTransition("show", item, params);
			});
		}

		if(breadCrumb){
			for(var i in bCrumb){
				if(!breadCrumb[i] || breadCrumb[i].route != bCrumb[i].route){ // verifica não só se os breadcrumbs são diferentes, mas o tamanho de um pro outro através de uma posição inexistente no novo array
					doUpdate = false; //se o breadcrumb anterior for diferente do atual, nao atualiza modulo atual
					hideItems(breadCrumb.slice(count, breadCrumb.length), false);
					initItems(bCrumb.slice(count, bCrumb.length), params);
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
			initItems(bCrumb, params);
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
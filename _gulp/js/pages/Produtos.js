Boto.setPage(function(){
	/*
		Dentro desta função, fica o escopo, com variáveis 
		privadas a serem usadas a gosto.
		Para o framework funcionar, é necessário definir uma variável
		page dentro deste escopo, que será utilizado assim que o arquivo for 
		carregado. Esse escopo será resgatado pela framework e todas as ações
		desta página estarão armazenadas neste objeto
	*/
	this.page = {
		/*init : function() {	
			console.log(this.pageInfo.id,"init");			
			this.initiated();
		}
		,*/show : function(params) {
			console.log(this.pageInfo.id,"show", params);		
			this.showed();
		}
		,update : function(params) {
			console.log(this.pageInfo.id,"update", params);			
			this.updated();
		}
		,hide : function() {
			console.log(this.pageInfo.id,"hide");	
			this.hidden();
		}
		,resize : function() {
			console.log(this.pageInfo.id,"resize");	
		}
	}
});
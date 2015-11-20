Bem vindo ao Boto.js
===================


Framework para aplicações Single-Page.

----------


Incorporando o código
-------------------

Para utilizá-lo basta incorporá-lo no seu arquivo **HTML**, e iniciar o framework passando o caminho do arquivo **JSON** que contenha as rotas desejadas. Veja um exemplo do código **Javascript** abaixo:

#### Javascript
```javascript
Boto.init({
	siteMap : "/caminho-json/sitemap.json",
    callback : function(){
    	// iniciou-se o framework
    },
});
```

#### 
----------

Definindo rotas
-------------------

Rotas precisam ser definidas em um arquivo **JSON**, seguindo a notação de exemplo abaixo:
#### JSON
```json
{"id":"root", "klass":"caminho-js/root.js", "route":"/root", 
	"sub": [ 
	 	{"id":"home", "route":"/home", "klass":"caminho-js/home.js"}
	 	,{"id":"info", "route":"/info", "klass":"caminho-js/info.js"}
		,{"id":"about", "route":"/about", "klass":"caminho-js/about.js"}
	]
}
```
> Observe o aninhamento das seções **home**, **info** e **about**, localizadas dentro da seção **root**. Também é possível configurar as seções diretamente, sem a utilização do módulo pai (**root**)
#### 


#### 
----------

Inicializando
-------------------

Rotas precisam ser definidas em um arquivo **JSON**, seguindo a notação de exemplo abaixo:
#### Inicialização simples
Dessa maneira, a primeira rota a ser carregada é a primeira definida em um arquivo JSON, ex: home.
```javascript
Boto.init({
	siteMap : "/caminho-json/sitemap.json"
});
```

#### Rota customizada
É possível carregar uma rota de sua escolha inicialmente. Basta definir o atributo **defaultPath** com o nome da rota:
```javascript
Boto.init({
	siteMap : "/caminho-json/sitemap.json",
	defaultPath : "about"
});
```

### Boto.navigateTo("rota")
Este é um método utilizado para forçar o carregamento e acesso à uma determinada seção, sem esperar a modificação da URL. Segue um exemplo abaixo:
```javascript
Boto.init({
	siteMap : "/caminho-json/sitemap.json",
	autoStart : false,
	callback : function(){
		alert("framework carregado!");
		Boto.navigateTo("info");
	} 
});
```
#### Inicialização automática
Você também pode impedir o carregamento automático de um módulo ao iniciar o framework. O padrão deste atributo é **true**.
```javascript
Boto.init({
	siteMap : "/caminho-json/sitemap.json",
	autoStart : false,
	callback : function(){
		alert("framework carregado!");
		Boto.navigateTo("home");
	} 
});
```

#### 
----------

Seções
-------------

As rotas são separadas por arquivos **.js** existentes no seu arquivo JSON (veja acima).
Cada arquivo corresponde a uma rota, para atribuir o comportamento de seção dentro deste arquivo é preciso seguir algumas pequenas padronizações:
```javascript
Boto.setPage(
	this.page = {
		init : function(){
			//iniciar
			this.initiated();
		},
		show : function(params){
			//mostrar
			this.showed();
		},
		update : function(params){
			//atualizar
			this.updated();
		},
		hide : function(){
			//sair
			this.hidden();
		},
		resize : function(){
			//redimensionar
		}		
	}
);
```

#### init(), initiated()

Boto.js entrega a possibilidade de iniciar uma seção antes de esta ser exibida. Em outras palavras, você tem uma área apenas para configuração de uma seção (caso seja necessário). 
O método **this.initiated()** garante a continuidade do ciclo de vida do framework, exibindo o evento **show()**.

#### show(params), showed()

Se não é rota, é parâmetro!! Quando uma informação adicional não é identificada como rota, ela entra como parâmetro (params) no método de exibição de um módulo. Esse parâmetro tem o formato de um Array simples, pronto para ser utilizado. O método showed() garante a continuidade do ciclo de vida do framework, permitindo sair do módulo ou atualizá-lo.

#### update(params), updated()

Mudou a URL, mas ainda está na mesma rota? Sem problemas! Essa mudança não irá passar desapercebida, pelo contrário, será enviada para o método de atualização de uma seção. Ideal para guiar o comportamento de uma seção sem sair dela, e ainda manter uma URL amigável e representativa. O método updated() garante a continuidade do ciclo de vida do framework, permitindo sair do módulo ou atualizá-lo mais uma vez.

#### hide(params), hidden()

Quer fazer um efeito de transição na saída de uma seção? Sem problemas! O método **hide()** permite a execução de um código no momento de saída de uma seção. O método hidden() possui o importante papel de dizer ao framework que esta seção não está mais ativa, dando continuidade ao ciclo de vida do framework e sua aplicação.

#### resize() [opcional]

**Responsividade! Yeaahhh!!** Sua aplicação detecta mudanças de resolução automaticamente, avisando a seção atual, para que esta tome as devidas providências. A utilização deste método é opcional.


### Métodos adicionais

Alguns métodos adicionais permitem funcionalidades extras para sua aplicação.

#### getPageInfo()

Recupera as informações da seção atual, como breadcrumb, id entre outros que estão definidos no arquivo JSON de rotas. Este método pode ser invocado durante execução da aplicação.

#### getAsset(id)
Carrega e retorna uma imagem ou documento que fazem parte de uma seção. Passe o id deste arquivo como string para acessá-lo.
```javascript
Boto.setPage(
	...
		show : function(params){
			//mostrar
			this.getAsset("foto-home");
			this.showed();
		},
	...
	}
);
```



> **Obs:** O arquivo precisa estar definido dentro do vetor **assets** de uma seção, no arquivo JSON de rotas. Veja abaixo:
```
{"id":"home", "route":"/home", "klass":"caminho-js/home.js",
	"assets" : [
		{"id" : "foto-home", "src" : "caminho-foto/foto-home.jpg"}
	]
}
	 	
```


#### 
----------


Sites que utilizam este framework
--------------------
http://groba.tv
http://preto.com.br
http://asomasede.com




1- Download content
2- run 'npm install --save-dev gulp' to install gulp locally
3- run 'npm install' to install dependencies
4- run 'gulp' to watch/compile any change from the source code (_gulp/*.*)

Boto.setPage(function(){this.page={show:function(o){var e=document.createElement("p");e.innerHTML="Você clicou em produtos",document.body.appendChild(e),document.body.appendChild(this.getAsset("boto-img")),this.showed(),console.log(this.pageInfo.id,"show",o)},update:function(o){console.log(this.pageInfo.id,"update",o),this.updated()},hide:function(){console.log(this.pageInfo.id,"hide"),this.hidden()},resize:function(){console.log(this.pageInfo.id,"resize")}}});
Boto.setPage(function(){this.page={init:function(){console.log(this.pageInfo.id,"init"),this.initiated()},show:function(i){console.log(this.pageInfo.id,"show()"),this.showed()},update:function(i){console.log(this.pageInfo.id,"update()"),this.updated()},hide:function(){console.log(this.pageInfo.id,"hide"),this.hidden()},resize:function(){console.log(this.pageInfo.id,"resize")}}});
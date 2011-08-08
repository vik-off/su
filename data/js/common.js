function $(id){return document.getElementById(id);}
function ge(id){return document.getElementById(id);}

function trace(text, clear){if(clear){$('box').innerHTML = text;}else{$('box').innerHTML += text;}}

var msgbox = {
	boxID: 'topMessageBox',
	stack: [],
	status: false,
		
	show: function(text, style){
		var layer = $(this.boxID);
		var box = layer.firstChild;
		var textNode = box.lastChild.firstChild.firstChild;

		if(this.status){this.stack.push([text, style ? style : ""]); return; }
		if(!text){this.showFromStack();return;}
		
		if(style){if(style == 'ok'){
			box.style.backgroundColor = '#91FF96';}
			else{box.style.backgroundColor = '#FF7979';}
		}
		else{box.style.backgroundColor = '#DDDDDD';}
		
		textNode.innerHTML = text;
		layer.style.display = 'block';
		this.status = true;
		setTimeout(function(){msgbox.hide();},5000);
	},
	
	hide: function(){
		var layer = $(this.boxID);
		layer.style.display = 'none';
		this.status = false;		
		if(this.stack.length){this.showFromStack();}
	},
	
	showFromStack: function(){
		if(!this.stack.length){return;}
		var nextact = this.stack.shift();
		setTimeout(function(){msgbox.show(nextact[0],nextact[1]);},500);
	}
}

function addMenuPush(text, link){
	var b = $('additionalMenu');
	if(!b){alert("Дополнительное меню не найдено");return;}
	b.innerHTML += "<hr><a class='topMenuOpt' href='" + link + "' onClick='this.parentNode.style.display = \"none\";'>" + text + "</a>";
}

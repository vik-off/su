function queryToggle(){
	elm = document.getElementById("queryInputBox");
	if(elm.style.display == "none"){elm.style.display = "block"}
	else{elm.style.display = "none"}
}

function renameTable(oldName){
	
	ans = prompt('Введите новое имя таблицы "' + oldName + '"', oldName);
	
	if(ans == null)
		return;
	
	if(!ans.length){
		alert('Имя таблицы не должно быть пустым!');
		return;
	}
	
	try{
		var input = document.getElementById('newTableNameBox');
		input.value = ans;
		input.form.submit();
	}
	catch(e){
		alert('Внутренняя ошибка: \n' + e);
	}
}

var NavBar = {
	
	hide: function(){
		ge('navigationBar').style.display = 'none';
		ge('navBarOpener').style.display = 'block';
	},
	
	show: function(){
		ge('navigationBar').style.display = 'block';
		ge('navBarOpener').style.display = 'none';
	},
	
	adjustHeight: function(){
		var input = ge('navBarTblList');
		if(input == null)
			return;
		//alert(input.size);
	}
}

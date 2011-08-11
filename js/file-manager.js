
var fileTree = {
	curDirL: '',	// адрес в левой колонке
	curDirR: '',	// адрес в правой колонке
	curCol: false,	// текущая столбец (для заполнения списком файлов)
	response: '',	// переменная, содержащая ответ сервера (как правило, объект)
	act: false,		// текущее действие
		
	mustReload: false,	// флаг перезагрузки (чтобы перезагрузить второй столбец)
	fastMove: false,	// флаг быстрой навигации (без выделения элемента)
	
	selected: false,// прямая ссылка на выделенный DOM элемент
	target: false,	// имя выделенного файла или папки
	col: false,		// столбец, в котором находится выделенный элемент (для применения опций)
	type: false,	// 1 - папка, 2 - файл
	block: false,	// блокировка деятельности.
		
	activeColVal: false,	//активный столбец (заголовок выделен синим)
	
	init: function(path){
		
		this._bindKeyPress();
		this.load(path);
	},
	
	_bindKeyPress: function(){
		
		$(window).keypress(function(e){
			
			switch(e.keyCode){
				case 113: // F2
					trace("f2");
					return false;
				case 46: // DELETE
					trace("delete");
					break;
			}
		});
	},
	send: function(sendMsg){
		XHR.open("POST", 'data/php/ajax.php');
		XHR.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		XHR.send(sendMsg);
		XHR.onreadystatechange = this.getResponse;
		this.enableLoad();
	},
		
	getResponse: function(){
		if(XHR.readyState != 4){return;}
		
		fileTree.disableLoad();
		fileTree.block = false;
		
		if(fileTree.act == 'filetree'){
			try{eval("fileTree.response = " + (XHR.responseText));}
			catch(e){alert("Ошибка распознавания данных!\n\n\tОтвет сервера:\n" + XHR.responseText + '\n\n\tОшибка Javascript:\n' + e);}
			try{
				if(fileTree.curCol == 1){fileTree.curDirL = decodeURIComponent(fileTree.response.curDir); fileTree.activeCol(1);}
				else if(fileTree.curCol == 2){fileTree.curDirR = decodeURIComponent(fileTree.response.curDir); fileTree.activeCol(2);}
				else{fileTree.curDirL = fileTree.curDirR = decodeURIComponent(fileTree.response.curDir); fileTree.activeCol(0);}
				//заполнить таблицу
				fileTree.showList();
				//если перезагрузка
				if(fileTree.mustReload){fileTree.mustReload = false; fileTree.act = 'filetree'; fileTree.curCol = 2; fileTree.send('act=showTree&curDir=' + encodeURI(fileTree.curDirR));}
			}
			catch(e){alert("Ошибка декодирования данных!\nКолонка: "+fileTree.curCol+"\nОтвет сервера:\n" + XHR.responseText + '\n\nОшибка Javascript:\n' + e);}
		}
		else if(fileTree.act == 'rename'){
			if(XHR.responseText.substr(0,3) == '01.'){fileTree.log('Файл успешно переименован.', 'ok'); fileTree.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){fileTree.log('Файл не найден!', 'error');}
			else if(XHR.responseText.substr(0,3) == '03.'){fileTree.log('Файл с таким именем уже существует.', 'error');}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('Ошибка переименования.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка переименования.\n\n' + XHR.responseText);}
		}
		else if(fileTree.act == 'copy'){
			if(XHR.responseText.substr(0,3) == '01.'){fileTree.log('Файл успешно копирован.', 'ok'); fileTree.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('Файл не найден!');}
			else if(XHR.responseText.substr(0,3) == '03.'){if(confirm('Файл с таким именем существует. Перезаписать?')){fileTree.optCopy(true);}}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('Ошибка копирования.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка копирования.\n\n' + XHR.responseText);}
		}
		else if(fileTree.act == 'replace'){
			if(XHR.responseText.substr(0,3) == '01.'){fileTree.log('Файл успешно перемещен.', 'ok'); fileTree.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('Файл не найден!');}
			else if(XHR.responseText.substr(0,3) == '03.'){if(confirm('Файл с таким именем существует. Перезаписать?')){fileTree.optReplace(true);}}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('Ошибка перемещения.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка перемещения.\n\n' + XHR.responseText);}
		}
		else if(fileTree.act == 'delFile'){
			if(XHR.responseText.substr(0,3) == '01.'){fileTree.log('Файл удален', 'ok'); fileTree.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('Файл не найден!');}
			else if(XHR.responseText.substr(0,3) == '03.'){alert('Ошибка удаления файла.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка удаления.\n\n' + XHR.responseText);}
		}
		else if(fileTree.act == 'mkdir'){
			var ans = XHR.responseText.substr(0,3);
			if(ans == '01.'){fileTree.log('Папка успешно создана', 'ok'); fileTree.reload();}
			else if(ans == '02.'){fileTree.log('Директория с таким именем уже существует.', 'error');}
			else if(ans == '03.'){alert('Ошибка создания папки.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка.\n\n' + XHR.responseText);}
		}
		else if(fileTree.act == 'mkfile'){
			var ans = XHR.responseText.substr(0,3);
			if(ans == '01.'){fileTree.log('файл успешно создан', 'ok'); fileTree.reload();}
			else if(ans == '02.'){fileTree.log('Файл с таким именем уже существует.', 'error');}
			else if(ans == '03.'){alert('Ошибка создания файла.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка.\n\n' + XHR.responseText);}
		}
	},
	
	move: function(dirname, col){
		if(this.block){return;}
		this.block = true;
		this.act = 'filetree';
		this.curCol = col;
		// alert(encodeURI((col == 1) ? this.curDirL : this.curDirR)); return false;
		this.send('act=showTree&curDir=' + encodeURI((col == 1) ? this.curDirL : this.curDirR) + '&getDir=' + encodeURIComponent(dirname || ''));
	},
	
	jump: function(path, col){
		if(this.block){return;}
		this.block = true;
		this.act = 'filetree';
		this.curCol = col;
		this.send('act=showTree&curDir=' + encodeURIComponent(path));
	},
	
	load: function(path){
		if(this.block){return;}
		this.block = true;
		this.act = 'filetree';
		this.send('act=showTree' + (path ? '&curDir=' + encodeURIComponent(path) : ''));
	},
	
	reload: function(){
		if(this.block){return;}
		this.block = true;
		this.act = 'filetree';
		this.mustReload = true;
		this.curCol = 1;
		this.send('act=showTree&curDir=' + encodeURI(this.curDirL));
	},
		
	openFile: function(){
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		if(this.type != 2){alert("Надо выбрать файл!");return;}
		var param = encodeURI((this.col == 1 ? fileTree.curDirL : fileTree.curDirR) + '/' + this.target);
		window.open('data/php/fileView.php?fileView=' + param);
	},
		
	optRename: function(){
		fileTree.act = 'rename';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		var path = this.col == 1 ? fileTree.curDirL : fileTree.curDirR;
		if(!path){alert('Ошибка пути');return;}
		var name = prompt('Введите имя', this.target);
		if(name === false){return;}
		if(!name.length){alert('Имя не должно быть пустым');return;}
		if(this.target == name){log('имена совпадают','error');return;}
		this.block = true;
		fileTree.send('act=rename&path=' + encodeURI(path) + '&oldname=' + encodeURI(this.target) + '&newname=' + encodeURI(name));
	},
	
	optLoad: function(){
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		if(this.type != 2){alert("Надо выбрать файл!");return;}
		var param = encodeURI((this.col == 1 ? fileTree.curDirL : fileTree.curDirR) + '/' + this.target);
		window.open('data/php/fileLoader.php?loadfile=' + param, 'fileLoader');
	},
	
	optCopy: function(anyCase){
		fileTree.act = 'copy';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		if(!fileTree.curDirL || !fileTree.curDirR){alert("Ошибка путей!");return;}
		if(this.type != 2){alert("Надо выбрать файл!");return;}
		if(fileTree.curDirL == fileTree.curDirR){alert("Директории совпадают.");return;}
		this.block = true;
		fileTree.send('act=copyFile' + (anyCase ? '&anyCase=yes' : '') + '&dirFrom=' + encodeURI(this.col == 1 ? fileTree.curDirL : fileTree.curDirR) + '&dirTo=' + encodeURI(this.col == 2 ? fileTree.curDirL : fileTree.curDirR) + '&fname=' + encodeURI(this.target));
	},
	
	optReplace: function(anyCase){
		fileTree.act = 'replace';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		if(!fileTree.curDirL || !fileTree.curDirR){alert("Ошибка путей!");return;}
		if(this.type != 2){alert("Надо выбрать файл!");return;}
		if(!anyCase){if(!confirm('Переместить файл "' + this.target + '"?')){return;}}
		if(fileTree.curDirL == fileTree.curDirR){alert("Директории совпадают.");return;}
		this.block = true;
		fileTree.send('act=replaceFile' + (anyCase ? '&anyCase=yes' : '') + '&dirFrom=' + encodeURI(this.col == 1 ? fileTree.curDirL : fileTree.curDirR) + '&dirTo=' + encodeURI(this.col == 2 ? fileTree.curDirL : fileTree.curDirR) + '&fname=' + encodeURI(this.target));
	},
	
	optDelFile: function(){
		fileTree.act = 'delFile';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		if(!confirm('Удалить файл "' + this.target + '"?')){return;}
		var path = this.col == 1 ? fileTree.curDirL : fileTree.curDirR;
		if(!path){alert("Ошибка пути!");return;}
		this.block = true;
		fileTree.send('act=delFile&fullpath=' + encodeURI(path + '/' + this.target));
	},
		
	optMkdir: function(){
		fileTree.act = 'mkdir';
		if(!this.activeColVal){alert('Выберите столбец.'); return;}
		var path = this.activeColVal == 'fm-left-col' ? this.curDirL : this.curDirR;
		if(!path){alert('Ошибка пути');return;}
		var name = prompt('Введите имя папки','Новая папка');
		if(name === false){return;}
		if(!name.length){alert('Имя папки не должно быть пустым'); this.optMkdir();return;}
		this.block = true;
		fileTree.send('act=mkdir&path=' + encodeURI(path) + '&name=' + encodeURI(name));
	},
	
	optMkfile: function(){
		fileTree.act = 'mkfile';
		if(!this.activeColVal){alert('Выберите столбец.'); return;}
		var path = this.activeColVal == 'fm-left-col' ? this.curDirL : this.curDirR;
		if(!path){alert('Ошибка пути');return;}
		var name = prompt('Введите имя файла','file.txt');
		if(name === false){return;}
		if(!name.length){alert('Имя файла не должно быть пустым'); this.optMkfile();return;}
		this.block = true;
		fileTree.send('act=mkfile&path=' + encodeURI(path) + '&name=' + encodeURI(name));
	},

	select: function(elm, col, type){
		if(this.block){return;}
		if(this.selected){this.selected.parentNode.parentNode.className = 'fm-unselect';}
		elm.parentNode.parentNode.className = 'fm-select';
		
		this.selected = elm;
		this.col = col;
		this.activeCol(col);
		if(type){
			this.type = type;
			this.target = elm.lastChild.nodeValue;
		}
		else{
			this.target = false;
			this.type = false;
		}
	},
		
	unselect: function(){
		if(this.block){return;}
		if(this.selected){this.selected.parentNode.parentNode.className = 'fm-unselect';}
		this.selected = false;
		this.target = false;
		this.col = false;
		this.type = false;
	},
	
	activeCol: function(col){
		if(col == 1){col = 'fm-left-col'}else if(col == 2){col = 'fm-right-col'}else{col = false;}	//параметр 'col' поступает в виде '1', '2' или ''
		if(this.activeColVal){$(this.activeColVal).firstChild.firstChild.className = 'fm-col-inactive';}	//если столбец был выделен, делает его пассивным
		this.activeColVal = col;
		if(this.activeColVal){$(this.activeColVal).firstChild.firstChild.className = 'fm-col-active';}	//если выбран новый столбец, делает его активным
	},
	
	enableLoad: function(){
		$('loadingImg').style.display = 'inline';
	},
		
	disableLoad: function(){
		$('loadingImg').style.display = 'none';
	},
		
	fastMoveToggle: function(elm){
		if(elm.checked == true){this.fastMove = true; this.log('Быстрая навигация включена');}
		else{this.fastMove = false; this.log('Быстрая навигация отключена');}
		this.reload();
	},
		
	log: function(text, color){
		var row = document.createElement("DIV");
		var now = new Date();
		var dateStr = now.getDate() + '.' + now.getMonth() + '.' + now.getFullYear() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
		row.innerHTML = '<span class="fm-log-date">' + dateStr + '</span> ' + text;
		if(!color){color = 'black';}else if(color == 'ok'){color = 'green';}else if(color == 'error'){color = 'red';}
		row.setAttribute('style', 'color:' + color + ';font-size:11px;');
		$('fm-log-body').insertBefore(row,$('fm-log-body').firstChild);
	},

	showList: function(){
		var tb, tr, td1, td2;
		var imgDir = '';
		var imgFile = '';
		if(this.curCol == 1){tb = $('fm-left-col').lastChild;}
		else if(this.curCol == 2){tb = $('fm-right-col').lastChild;}
		else{this.curCol = 1; this.showList(); this.curCol = 2; this.showList(); return;}
		
		/**** очистка ****/
		while(tb.childNodes.length > 1){tb.removeChild(tb.lastChild);}
		this.unselect();
		
		if(this.fastMove){
			$('fm-left-col-up').onclick = function(){fileTree.move("..", 1); return false;}
			$('fm-left-col-up').ondblclick = function(){return false;}
			$('fm-right-col-up').onclick = function(){fileTree.move("..", 2); return false;}
			$('fm-right-col-up').ondblclick = function(){return false;}
		}else{
			$('fm-left-col-up').onclick = function(){fileTree.select(this, 1); return false;}
			$('fm-left-col-up').ondblclick = function(){fileTree.move("..", 1);return false;}
			$('fm-right-col-up').onclick = function(){fileTree.select(this, 2); return false;}
			$('fm-right-col-up').ondblclick = function(){fileTree.move("..", 2);return false;}
		}
		
		/**** заполнение папок ****/
		for(var i = 0; i < this.response.dirs.length; i++){
			curElm = this.response.dirs[i];
			tr = document.createElement("TR");
			td1 = document.createElement("TD");
			td2 = document.createElement("TD");
			
			tr.className = 'fm-unselect';
			
			if(this.fastMove){td1.innerHTML = "<a class='fm-half-jlink' href='#' onClick='fileTree.move(\"" + curElm[0] + "\", " + this.curCol + ");return false;' onDblClick='return false;'><img alt='d' src='data/images/fldr.png'>" + curElm[0] + "</a>";}
			else{td1.innerHTML = "<a class='fm-jlink' href='#' onClick='fileTree.select(this, " + this.curCol + ", 1); return false;' onDblClick='fileTree.move(\"" + curElm[0] + "\", " + this.curCol + "); return false;'><img alt='d' src='data/images/fldr.png'>" + curElm[0] + "</a>";}

			tr.appendChild(td1);
			tr.appendChild(td2);
			tb.appendChild(tr);
		}
		/**** заполнение файлов ****/
		for(var i = 0; i < this.response.files.length; i++){
			curElm = this.response.files[i];
			tr = document.createElement("TR");
			td1 = document.createElement("TD");
			td2 = document.createElement("TD");

			tr.className = 'fm-unselect';

			if(this.fastMove){td1.innerHTML = "<a class='fm-half-jlink' href='#' onClick='' onDblClick=''><img alt='f' src='data/images/file.png'>" + curElm[0] + "</a>";}
			else{td1.innerHTML = "<a class='fm-jlink' href='#' onClick='fileTree.select(this, " + this.curCol + ", 2); return false;' onDblClick='fileTree.openFile(); return false;'><img alt='f' src='data/images/file.png'>" + curElm[0] + "</a>";}

			td2.innerHTML = curElm[1];
			td2.style.textAlign = 'right';	
			tr.appendChild(td1);
			tr.appendChild(td2);
			tb.appendChild(tr);
		}
		
		/**** заполнение поля адреса ****/
		if(this.curCol == 1){$('addr-left').value = this.curDirL;}
		else if(this.curCol == 2){$('addr-right').value = this.curDirR;}
		
		/**** заполнение строки состояния ****/
		$('fm-status-bar').innerHTML = 'В директории <b><u>' + (this.curCol == 1 ? this.curDirL : this.curDirR) + '</u></b> свободно ' + this.response.freeSpace;
	}
}

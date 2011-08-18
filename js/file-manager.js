
var FileManager = {
	curCol: 0,   	// текущая столбец (для заполнения списком файлов)
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
	html: {
		left: {
			addr: null,
			col: null,
			tbody: null,
		},
		right: {
			addr: null,
			col: null,
			tbody: null,
		}
	},
	curDir: {
		left: null,
		right: null
	},
	selected: {
		left: null, // {name: '', type: '', html: '', htmlTr}
		right: null
	},
	
	init: function(path){
		
		this._bindKeyPress();
		this._findHTML();
		
		this.curDir.left = this.curDir.right = path;
		this.displayFileTree();
	},
	
	displayFileTree: function(){
		
		var cols = [];
		var curCol, elm;
		if(this.curCol == 'left') cols.push('left');
		else if(this.curCol == 'right') cols.push('right');
		else cols.push('left', 'right');
		
		for(var ci = 0; ci < cols.length; ci++){
			(function(curCol){
				$.get(href('fm-get-tree'), {dir: FileManager.curDir[curCol]}, function(response){
					
					if(response.errcode){
						trace(response.errmsg);
						return;
					}
					
					FileManager.activateCol(curCol);
					FileManager.html[curCol].tbody.empty();
					FileManager.html[curCol].addr.val(response.curDir);
					FileManager.selected[curCol] = null;
					
					// var_dump(response, 'a');
					FileManager.html[curCol].tbody.append(FileManager._createUpItem(curCol));
					for(var i = 0; i < response.dirs.length; i++)
						FileManager.html[curCol].tbody.append(FileManager._createTreeItem('dir', response.dirs[i], curCol));
						
					for(var i = 0; i < response.files.length; i++)
						FileManager.html[curCol].tbody.append(FileManager._createTreeItem('file', response.files[i], curCol));
				}, 'json');
			})(cols[ci]);
		}
	},
	
	_createUpItem: function(col){
		return $('<tr></tr>')
			.append($('<td></td>')
				.append($('<a class="fm-jlink" href="#"></a>')
					.click(this.fastMove
						? function(){return false;}
						: function(){FileManager.select('..', '..', col, this); return false;})
					.dblclick(this.fastMove
						? function(){return false;}
						: function(){return false;})
					.append('<img alt="up" align="middle" src="data/images/up.png">')
					.append('<span>..</span>')))
			.append('<td></td>');
	},
	
	_createTreeItem: function(type, elm, curCol){
		// папки
		if(type == 'dir'){
			return $('<tr></tr>')
				.append($('<td></td>')
					.append($('<a class="fm-half-jlink" href="#"></a>')
						 .click(FileManager._createClickHandler(type, elm, curCol))
						 .dblclick(FileManager._createDblClickHandler(type, elm, curCol))
						 .append('<img alt="d" src="data/images/fldr.png">')
						 .append('<span>' + elm.name + '</span>')))
				.append('<td>-</td>');
		}
		// файлы
		else{
			return $('<tr></tr>')
				.append($('<td></td>')
					.append($('<a class="fm-half-jlink" href="#"></a>')
						 .click(FileManager._createClickHandler(type, elm, curCol))
						 .dblclick(FileManager._createDblClickHandler(type, elm, curCol))
						 .append('<img alt="f" src="data/images/file.png">')
						 .append('<span>' + elm.name + '</span>')))
				.append('<td>' + elm.size + '</td>');
		}
	},
	
	_createClickHandler: function(type, elm, col){
		// папки
		if(type == 'dir'){
			return this.fastMove
				? function(){FileManager.cd(elm.name, col); trace(this + ' ' + type + ' ' + elm.name + ' ' + col); return false;}
				: function(){FileManager.select(type, elm, col, this); return false;};
		}
		// файлы
		else{
			return this.fastMove
				? function(){trace(type + ' ' + elm.name + ' ' + curCol); return false;}
				: function(){FileManager.select(type, elm, curCol, this); return false;};
		}
	},
	
	_createDblClickHandler: function(type, elm, curCol){
		if(type == 'dir'){
			return this.fastMove
				? function(){trace(type + ' ' + elm.name + ' ' + curCol); return false;}
				: function(){trace(type + ' ' + elm.name + ' ' + curCol); return false;};
		}
		// файлы
		else{
			return this.fastMove
				? function(){trace(type + ' ' + elm.name + ' ' + curCol); return false;}
				: function(){trace(type + ' ' + elm.name + ' ' + curCol); return false;};
		}
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
	
	_findHTML: function(){
		this.html = {
			left: {
				addr: $('#fm-addr-left'),
				col: $('#fm-left-col'),
				tbody: $('#fm-left-col-tbody'),
			},
			right: {
				addr: $('#fm-addr-right'),
				col: $('#fm-right-col'),
				tbody: $('#fm-right-col-tbody'),
			}
		}
	},
	
	_formatPath: function(){
		
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
		
		FileManager.disableLoad();
		FileManager.block = false;
		
		if(FileManager.act == 'fileTree'){
			try{eval("FileManager.response = " + (XHR.responseText));}
			catch(e){alert("Ошибка распознавания данных!\n\n\tОтвет сервера:\n" + XHR.responseText + '\n\n\tОшибка Javascript:\n' + e);}
			try{
				if(FileManager.curCol == 1){FileManager.curDirL = decodeURIComponent(FileManager.response.curDir); FileManager.activeCol(1);}
				else if(FileManager.curCol == 2){FileManager.curDirR = decodeURIComponent(FileManager.response.curDir); FileManager.activeCol(2);}
				else{FileManager.curDirL = FileManager.curDirR = decodeURIComponent(FileManager.response.curDir); FileManager.activeCol(0);}
				//заполнить таблицу
				FileManager.showList();
				//если перезагрузка
				if(FileManager.mustReload){FileManager.mustReload = false; FileManager.act = 'FileManager'; FileManager.curCol = 2; FileManager.send('act=showTree&curDir=' + encodeURI(FileManager.curDirR));}
			}
			catch(e){alert("Ошибка декодирования данных!\nКолонка: "+FileManager.curCol+"\nОтвет сервера:\n" + XHR.responseText + '\n\nОшибка Javascript:\n' + e);}
		}
		else if(FileManager.act == 'rename'){
			if(XHR.responseText.substr(0,3) == '01.'){FileManager.log('Файл успешно переименован.', 'ok'); FileManager.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){FileManager.log('Файл не найден!', 'error');}
			else if(XHR.responseText.substr(0,3) == '03.'){FileManager.log('Файл с таким именем уже существует.', 'error');}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('Ошибка переименования.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка переименования.\n\n' + XHR.responseText);}
		}
		else if(FileManager.act == 'copy'){
			if(XHR.responseText.substr(0,3) == '01.'){FileManager.log('Файл успешно копирован.', 'ok'); FileManager.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('Файл не найден!');}
			else if(XHR.responseText.substr(0,3) == '03.'){if(confirm('Файл с таким именем существует. Перезаписать?')){FileManager.optCopy(true);}}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('Ошибка копирования.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка копирования.\n\n' + XHR.responseText);}
		}
		else if(FileManager.act == 'replace'){
			if(XHR.responseText.substr(0,3) == '01.'){FileManager.log('Файл успешно перемещен.', 'ok'); FileManager.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('Файл не найден!');}
			else if(XHR.responseText.substr(0,3) == '03.'){if(confirm('Файл с таким именем существует. Перезаписать?')){FileManager.optReplace(true);}}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('Ошибка перемещения.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка перемещения.\n\n' + XHR.responseText);}
		}
		else if(FileManager.act == 'delFile'){
			if(XHR.responseText.substr(0,3) == '01.'){FileManager.log('Файл удален', 'ok'); FileManager.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('Файл не найден!');}
			else if(XHR.responseText.substr(0,3) == '03.'){alert('Ошибка удаления файла.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка удаления.\n\n' + XHR.responseText);}
		}
		else if(FileManager.act == 'mkdir'){
			var ans = XHR.responseText.substr(0,3);
			if(ans == '01.'){FileManager.log('Папка успешно создана', 'ok'); FileManager.reload();}
			else if(ans == '02.'){FileManager.log('Директория с таким именем уже существует.', 'error');}
			else if(ans == '03.'){alert('Ошибка создания папки.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка.\n\n' + XHR.responseText);}
		}
		else if(FileManager.act == 'mkfile'){
			var ans = XHR.responseText.substr(0,3);
			if(ans == '01.'){FileManager.log('файл успешно создан', 'ok'); FileManager.reload();}
			else if(ans == '02.'){FileManager.log('Файл с таким именем уже существует.', 'error');}
			else if(ans == '03.'){alert('Ошибка создания файла.\n\n' + XHR.responseText);}
			else{alert('Непредвиденная ошибка.\n\n' + XHR.responseText);}
		}
	},
	
	cd: function(dirname, col){
		if(this.block) return;
		this.block = true;
		this.curDir[col] = this.curDir[col]
		this.displayFileTree();
	},
	
	jump: function(path, col){
		if(this.block){return;}
		this.block = true;
		this.act = 'FileManager';
		this.curCol = col;
		this.send('act=showTree&curDir=' + encodeURIComponent(path));
	},
	
	load: function(path){
		if(this.block){return;}
		this.block = true;
		this.act = 'fileTree';
		this.send('act=showTree' + (path ? '&curDir=' + encodeURIComponent(path) : ''));
	},
	
	reload: function(){
		if(this.block){return;}
		this.block = true;
		this.act = 'FileManager';
		this.mustReload = true;
		this.curCol = 1;
		this.send('act=showTree&curDir=' + encodeURI(this.curDirL));
	},
		
	openFile: function(){
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		if(this.type != 2){alert("Надо выбрать файл!");return;}
		var param = encodeURI((this.col == 1 ? FileManager.curDirL : FileManager.curDirR) + '/' + this.target);
		window.open('data/php/fileView.php?fileView=' + param);
	},
		
	optRename: function(){
		FileManager.act = 'rename';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		var path = this.col == 1 ? FileManager.curDirL : FileManager.curDirR;
		if(!path){alert('Ошибка пути');return;}
		var name = prompt('Введите имя', this.target);
		if(name === false){return;}
		if(!name.length){alert('Имя не должно быть пустым');return;}
		if(this.target == name){log('имена совпадают','error');return;}
		this.block = true;
		FileManager.send('act=rename&path=' + encodeURI(path) + '&oldname=' + encodeURI(this.target) + '&newname=' + encodeURI(name));
	},
	
	optLoad: function(){
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		if(this.type != 2){alert("Надо выбрать файл!");return;}
		var param = encodeURI((this.col == 1 ? FileManager.curDirL : FileManager.curDirR) + '/' + this.target);
		window.open('data/php/fileLoader.php?loadfile=' + param, 'fileLoader');
	},
	
	optCopy: function(anyCase){
		FileManager.act = 'copy';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		if(!FileManager.curDirL || !FileManager.curDirR){alert("Ошибка путей!");return;}
		if(this.type != 2){alert("Надо выбрать файл!");return;}
		if(FileManager.curDirL == FileManager.curDirR){alert("Директории совпадают.");return;}
		this.block = true;
		FileManager.send('act=copyFile' + (anyCase ? '&anyCase=yes' : '') + '&dirFrom=' + encodeURI(this.col == 1 ? FileManager.curDirL : FileManager.curDirR) + '&dirTo=' + encodeURI(this.col == 2 ? FileManager.curDirL : FileManager.curDirR) + '&fname=' + encodeURI(this.target));
	},
	
	optReplace: function(anyCase){
		FileManager.act = 'replace';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		if(!FileManager.curDirL || !FileManager.curDirR){alert("Ошибка путей!");return;}
		if(this.type != 2){alert("Надо выбрать файл!");return;}
		if(!anyCase){if(!confirm('Переместить файл "' + this.target + '"?')){return;}}
		if(FileManager.curDirL == FileManager.curDirR){alert("Директории совпадают.");return;}
		this.block = true;
		FileManager.send('act=replaceFile' + (anyCase ? '&anyCase=yes' : '') + '&dirFrom=' + encodeURI(this.col == 1 ? FileManager.curDirL : FileManager.curDirR) + '&dirTo=' + encodeURI(this.col == 2 ? FileManager.curDirL : FileManager.curDirR) + '&fname=' + encodeURI(this.target));
	},
	
	optDelFile: function(){
		FileManager.act = 'delFile';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("Выберите файл!");return;}
		if(!confirm('Удалить файл "' + this.target + '"?')){return;}
		var path = this.col == 1 ? FileManager.curDirL : FileManager.curDirR;
		if(!path){alert("Ошибка пути!");return;}
		this.block = true;
		FileManager.send('act=delFile&fullpath=' + encodeURI(path + '/' + this.target));
	},
		
	optMkdir: function(){
		FileManager.act = 'mkdir';
		if(!this.activeColVal){alert('Выберите столбец.'); return;}
		var path = this.activeColVal == 'fm-left-col' ? this.curDirL : this.curDirR;
		if(!path){alert('Ошибка пути');return;}
		var name = prompt('Введите имя папки','Новая папка');
		if(name === false){return;}
		if(!name.length){alert('Имя папки не должно быть пустым'); this.optMkdir();return;}
		this.block = true;
		FileManager.send('act=mkdir&path=' + encodeURI(path) + '&name=' + encodeURI(name));
	},
	
	optMkfile: function(){
		FileManager.act = 'mkfile';
		if(!this.activeColVal){alert('Выберите столбец.'); return;}
		var path = this.activeColVal == 'fm-left-col' ? this.curDirL : this.curDirR;
		if(!path){alert('Ошибка пути');return;}
		var name = prompt('Введите имя файла','file.txt');
		if(name === false){return;}
		if(!name.length){alert('Имя файла не должно быть пустым'); this.optMkfile();return;}
		this.block = true;
		FileManager.send('act=mkfile&path=' + encodeURI(path) + '&name=' + encodeURI(name));
	},

	select: function(type, name, col, elm){
		
		if(this.block) return;
		if(this.selected[col]) this.selected[col].htmlTr.removeClass('fm-select');
		
		this.selected[col] = {
			name: name,
			type: type,
			html: $(elm),
			htmlTr: $(elm).parent().parent()
		};
		this.selected[col].htmlTr.addClass('fm-select');
		this.activateCol(col);
	},
		
	unselect: function(){
		if(this.block){return;}
		if(this.selected){this.selected.parentNode.parentNode.className = 'fm-unselect';}
		this.selected = false;
		this.target = false;
		this.col = false;
		this.type = false;
	},
	
	activateCol: function(col){
		
		if(this.curCol == col) return;
		
		this.curCol = col;
		this.html.left.col.removeClass('fm-col-active');
		this.html.right.col.removeClass('fm-col-active');
		this.html[col].col.addClass('fm-col-active');
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
	
	/**
	 * @param string type [''|ok|error]
	 */
	log: function(text, type){
		var color = 'black';
		switch(type){
			case 'ok': color = 'green'; break;
			case 'error': color = 'red'; break;
		}
		$('<div style="color: ' + color + ';"></div>')
			.append('<span class="fm-log-date">' + new Date().getYNString() + ' </span>')
			.append('<span>' + text + '</span>')
			.appendTo('#fm-log-body');
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
			$('fm-left-col-up').onclick = function(){FileManager.cd("..", 1); return false;}
			$('fm-left-col-up').ondblclick = function(){return false;}
			$('fm-right-col-up').onclick = function(){FileManager.cd("..", 2); return false;}
			$('fm-right-col-up').ondblclick = function(){return false;}
		}else{
			$('fm-left-col-up').onclick = function(){FileManager.select(this, 1); return false;}
			$('fm-left-col-up').ondblclick = function(){FileManager.cd("..", 1);return false;}
			$('fm-right-col-up').onclick = function(){FileManager.select(this, 2); return false;}
			$('fm-right-col-up').ondblclick = function(){FileManager.cd("..", 2);return false;}
		}
		
		/**** заполнение папок ****/
		for(var i = 0; i < this.response.dirs.length; i++){
			curElm = this.response.dirs[i];
			tr = document.createElement("TR");
			td1 = document.createElement("TD");
			td2 = document.createElement("TD");
			
			tr.className = 'fm-unselect';
			
			if(this.fastMove){td1.innerHTML = "<a class='fm-half-jlink' href='#' onClick='FileManager.cd(\"" + curElm[0] + "\", " + this.curCol + ");return false;' onDblClick='return false;'><img alt='d' src='data/images/fldr.png'>" + curElm[0] + "</a>";}
			else{td1.innerHTML = "<a class='fm-jlink' href='#' onClick='FileManager.select(this, " + this.curCol + ", 1); return false;' onDblClick='FileManager.cd(\"" + curElm[0] + "\", " + this.curCol + "); return false;'><img alt='d' src='data/images/fldr.png'>" + curElm[0] + "</a>";}

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
			else{td1.innerHTML = "<a class='fm-jlink' href='#' onClick='FileManager.select(this, " + this.curCol + ", 2); return false;' onDblClick='FileManager.openFile(); return false;'><img alt='f' src='data/images/file.png'>" + curElm[0] + "</a>";}

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

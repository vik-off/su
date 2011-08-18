
var FileManager = {
	curCol: null,   // текущая столбец (для заполнения списком файлов)
	response: '',	// переменная, содержащая ответ сервера (как правило, объект)
	act: false,		// текущее действие
		
	mustReload: false,	// флаг перезагрузки (чтобы перезагрузить второй столбец)
	fastMove: true,	// флаг быстрой навигации (без выделения элемента)
	
	selected: false,// прямая ссылка на выделенный DOM элемент
	target: false,	// имя выделенного файла или папки
	col: false,		// столбец, в котором находится выделенный элемент (для применения опций)
	type: false,	// 1 - папка, 2 - файл
	block: false,	// блокировка деятельности.
		
	activeColVal: false,	//активный столбец (заголовок выделен синим)
	html: {
		btnFastMove: null,
		colBoxes: null,
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
		left: [], // {name: '', type: '', html: '', htmlTr}
		right: []
	},
	
	init: function(path){
		
		this._findHTML();
		this._bindEvents();
		
		this.curDir.left = this.curDir.right = path;
		this.activateCol('left');
		this.displayFileTree(['left', 'right']);
	},
	
	_bindEvents: function(){
		
		$(window).keypress(function(e){
			
			// trace(e.keyCode);
			switch(e.keyCode){
				case 113: // F2
					trace("f2");
					return false;
				case 46: // DELETE
					trace("delete");
					break;
				case 27: // ESC
					if(FileManager.curCol){
						// если есть выделенные файлы - сбросить выделение
						if(FileManager.selected[FileManager.curCol].length)
							FileManager.unselect(FileManager.curCol);
						// иначе деактивировать активную колонку
						else
							FileManager.activateCol(null);
					}
					break;
			}
		});
		
		$(document).click(function(e){
			
			// при щелчке вне коммандера, деактивируем обе вкладки
			if(!$(e.target).parents('#fm-wrap').length){
				FileManager.activateCol(null);
				return;
			}
		});
		
		this.html.colBoxes.click(function(e){
			
			var col = $(this).hasClass('fm-left') ? 'left' : 'right';
			
			// щелчек по той же самой колонке
			if(FileManager.curCol == col){
				FileManager.unselect(col);
			}
			// щелчек по неактивной колонке активизирует ее
			else{
				FileManager.activateCol(col);
			}
			return;
			var trg;
			if(trg = $(e.target).hasClass('fm-col-box') || trg = $(e.target).parent().hasClass('fm-col-box')){
				trace(trg);
			}
			trace(e.target.className);
		});
	},
	
	_findHTML: function(){
		this.html = {
			btnFastMove: $('#btn-fast-mode'),
			colBoxes: $('.fm-col-box'),
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
	
	displayFileTree: function(cols){
		
		this.block = true;
		this.showLoadIcon();
		
		for(var ci = 0; ci < cols.length; ci++){
			(function(col, ci, ct){
				$.get(href('fm-get-tree'), {dir: FileManager.curDir[col]}, function(response){
					
					if(response.errcode){
						FileManager.block = false;
						FileManager.hideLoadIcon();
						trace(response.errmsg);
						return;
					}
					
					// $('fm-status-bar').innerHTML = 'В директории <b><u>' + (this.curCol == 1 ? this.curDirL : this.curDirR) + '</u></b> свободно ' + this.response.freeSpace;
					FileManager.html[col].tbody.empty();
					FileManager.html[col].addr.val(response.curDir);
					FileManager.selected[col] = [];
					
					var_dump(response, 'o=c/files a');
					FileManager.html[col].tbody.append(FileManager._createUpItem(col));
					for(var i = 0; i < response.dirs.length; i++)
						FileManager.html[col].tbody.append(FileManager._createTreeItem('dir', response.dirs[i], col));
						
					for(var i = 0; i < response.files.length; i++)
						FileManager.html[col].tbody.append(FileManager._createTreeItem('file', response.files[i], col));
					
					// последняя итерация
					if(ci == ct){
						FileManager.block = false;
						FileManager.hideLoadIcon();
					}
						
				}, 'json');
			})(cols[ci], ci, cols.length - 1);
		}
	},
	
	_createUpItem: function(col){
		return $('<tr></tr>')
				.hover(
					function(){$(this).addClass('fm-row-hover');},
					function(){$(this).removeClass('fm-row-hover');})
				.click(this.fastMove
					? function(){FileManager.cd('..', col); return false;}
					: function(){FileManager.select('..', '..', col, this); return false;})
				.dblclick(this.fastMove
					? function(){return false;}
					: function(){FileManager.cd('..', col); return false;})
			.append('<td class="fm-col-icon"><img alt="f" src="data/images/up.png"></td>')
			.append($('<td class="fm-col-name">..</td>'))
			.append('<td></td>')
			.append('<td></td>');
	},
	
	_createTreeItem: function(type, elm, curCol){
		// папки
		if(type == 'dir'){
			return $('<tr></tr>')
				.hover(
					function(){$(this).addClass('fm-row-hover');},
					function(){$(this).removeClass('fm-row-hover');})
				.click(FileManager._createClickHandler(type, elm, curCol))
				.dblclick(FileManager._createDblClickHandler(type, elm, curCol))
				
				.append('<td class="fm-col-icon"><img alt="d" src="data/images/fldr.png"></td>')
				.append($('<td class="fm-col-name">' + elm.name + '</td>'))
				.append('<td style="text-align: center;">-</td>')
				.append('<td class="fm-col-emtime" title="' + elm.emtime + '">' + elm.emtime.substr(0, 11) + '</td>');
		}
		// файлы
		else{
			return $('<tr></tr>')
				.hover(
					function(){$(this).addClass('fm-row-hover');},
					function(){$(this).removeClass('fm-row-hover');})
				.click(FileManager._createClickHandler(type, elm, curCol))
				.dblclick(FileManager._createDblClickHandler(type, elm, curCol))
				
				.append('<td class="fm-col-icon"><img alt="f" src="data/images/file.png"></td>')
				.append($('<td class="fm-col-name">' + elm.name + '</td>'))
				.append('<td style="text-align: right;">' + elm.size + '</td>')
				.append('<td class="fm-col-emtime" title="' + elm.emtime + '">' + elm.emtime.substr(0, 11) + '</td>');
		}
	},
	
	_createClickHandler: function(type, elm, col){
		// папки
		if(type == 'dir'){
			return this.fastMove
				// fast move
				? function(e){
					if(e.ctrlKey)
						FileManager.select(type, elm, col, this, true);
					else
						FileManager.cd(elm.name, col);
					e.stopPropagation();
					return false;
				}
				// no fast move
				: function(e){
					FileManager.select(type, elm, col, this, e.ctrlKey);
					e.stopPropagation();
					return false;
				};
		}
		// файлы
		else{
			return this.fastMove
				// fast move
				? function(e){
					if(e.ctrlKey)
						FileManager.select(type, elm, col, this, true);
					else
						trace(type + ' ' + elm.name + ' ' + col);
					return false;
				}
				// no fast move
				: function(e){
					FileManager.select(type, elm, col, this, e.ctrlKey);
					return false;
				};
		}
	},
	
	_createDblClickHandler: function(type, elm, col){
		if(type == 'dir'){
			return this.fastMove
				? function(){return false;}
				: function(e){FileManager.cd(elm.name, col); return false;};
		}
		// файлы
		else{
			return this.fastMove
				? function(){trace(type + ' ' + elm.name + ' ' + col); return false;}
				: function(){trace(type + ' ' + elm.name + ' ' + col); return false;};
		}
	},
	
	_formatPath: function(){
		
	},
	
	send: function(sendMsg){
		XHR.open("POST", 'data/php/ajax.php');
		XHR.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		XHR.send(sendMsg);
		XHR.onreadystatechange = this.getResponse;
		this.showLoadIcon();
	},
		
	getResponse: function(){
		if(XHR.readyState != 4){return;}
		
		FileManager.hideLoadIcon();
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
	
	cd: function(dir, col){
		
		if(this.block)
			return;
		
		if(!/[\/\\]$/.test(this.curDir[col]))
			this.curDir[col] += '/';
		this.curDir[col] += dir;
		this.activateCol(col);
		this.displayFileTree([col]);
	},
	
	jump: function(path, col){
		
		if(this.block)
			return;
		
		this.curDir[col] = path;
		this.activateCol(col);
		this.displayFileTree([col]);
	},
	
	load: function(path){
		if(this.block){return;}
		this.block = true;
		this.act = 'fileTree';
		this.send('act=showTree' + (path ? '&curDir=' + encodeURIComponent(path) : ''));
	},
	
	reload: function(){
		
		if(this.block)
			return;
			
		this.displayFileTree(['left', 'right']);
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

	select: function(type, name, col, elm, append){
		
		if(this.block)
			return;
		
		// если выделение не добавляется, очистить все предыдущие выбранные элементы
		if(!append){
			this.unselect(col);
		}
		
		// если файл должен быть добавлен в выделение, и при этом уже выделен,
		// тогда снимем выделение
		if(append){
			for(var i = this.selected[col].length - 1; i >= 0; i--){
				if(this.selected[col][i].name == name){
					this.selected[col][i].html.removeClass('fm-select');
					this.selected[col].splice(i, 1);
					return;
				}
			}
		}
		
		var item = {
			type: type, // тип (файл или папка)
			name: name, // имя выделенного файла
			html: $(elm), // jquery dom объект tr-строки
		}
		item.html.addClass('fm-select');
		this.selected[col].push(item);
		this.activateCol(col);
	},
	
	unselect: function(col){
		
		if(this.block)
			return;
			
		for(var i = this.selected[col].length - 1; i >= 0; i--)
			this.selected[col][i].html.removeClass('fm-select');
		this.selected[col] = [];
	},
	
	activateCol: function(col){
		
		if(this.curCol == col)
			return;
		
		this.curCol = col;
		this.html.left.col.removeClass('fm-col-active');
		this.html.right.col.removeClass('fm-col-active');
		if(col)
			this.html[col].col.addClass('fm-col-active');
	},
	
	showLoadIcon: function(){
		$('#load-icon').show();
	},
		
	hideLoadIcon: function(){
		$('#load-icon').hide();
	},
		
	fastMoveToggle: function(elm){
		
		if(this.block)
			return;
			
		if(elm.checked == true){
			this.fastMove = true;
			this.log('Быстрая навигация включена');
		}else{
			this.fastMove = false;
			this.log('Быстрая навигация отключена');
		}
		this.displayFileTree(['left', 'right']);
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
}

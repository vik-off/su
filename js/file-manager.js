
var FileManager = {
	curCol: null,   // текущая панель
		
	mustReload: false,	// флаг перезагрузки (чтобы перезагрузить второй столбец)
	fastMove: true,	// флаг быстрой навигации (без выделения элемента)
	block: false,	// блокировка деятельности.
		
	html: {
		btnFastMove: null,
		colBoxes: null,
		left: {
			addr: null,
			col: null,
			tbody: null,
			freeSpace: null,
		},
		right: {
			addr: null,
			col: null,
			tbody: null,
			freeSpace: null,
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
		
		if(!this._parseHash(path));
		
		
		this.activateCol('left');
		this.displayFileTree(['left', 'right']);
		this.fitHeight(true);
	},
	
	_bindEvents: function(){
		
		$(window).keypress(function(e){
			
			if(e.target.tagName.toLowerCase() == 'input')
				return true;
			
			// trace(e.keyCode)
			// return false;
			switch(e.keyCode){
				case 8: // BACKSPACE
					if(FileManager.curCol){
						FileManager.cd('..', FileManager.curCol);
						return false;
					}
					break;
				case 13: // ENTER
					if(FileManager.curCol){
						FileManager.shortcuts.enter();
						return false;
					}
					break;
				case 36: // HOME
					if(FileManager.curCol){
						FileManager.shortcuts.home();
						return false;
					}
					break;
				case 35: // END
					if(FileManager.curCol){
						FileManager.shortcuts.end();
						return false;
					}
					break;
				case 38: // UP
					if(FileManager.curCol){
						FileManager.shortcuts.up();
						return false;
					}
					break;
				case 40: // DOWN
					if(FileManager.curCol){
						FileManager.shortcuts.down();
						return false;
					}
					break;
				case 9: // TAB
					FileManager.shortcuts.tab();
					return false;
				case 97: // A
					// ctrl + A - выделить все
					if(e.ctrlKey && FileManager.curCol){
						FileManager.shortcuts.selectAll();
						return false;
					}
					break;
				case 113: // F2
					FileManager.actions.rename();
					return false;
				case 46: // DELETE
					if(FileManager.curCol){
						FileManager.actions.del();
						return false;
					}
					break;
				case 27: // ESC
					FileManager.shortcuts.esc();
					break;
			}
		});
		
		$(document).click(function(e){
			
			// при щелчке вне коммандера, уберем выделение активной панели
			// и деактивируем обе панели
			if(!$(e.target).parents('#fm-wrap').length && FileManager.curCol){
				FileManager.unselect(FileManager.curCol);
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
		});
	},
	
	shortcuts: {
		selectAll: function(e){
			FileManager.unselect(FileManager.curCol);
			FileManager.html[FileManager.curCol].tbody.children().each(function(){
				var t = $(this);
				var type = null;
				if(t.hasClass('fm-row-dir'))
					type = 'dir';
				if(t.hasClass('fm-row-file'))
					type = 'file';
				if(type)
					FileManager.select(FileManager.curCol, this, true);
			});
		},
		
		esc: function(){
			
			// скрытие контекстного меню
			if(FileManager.ContextMenu.isDisplayed){
				FileManager.ContextMenu.close();
				return;
			}
			
			// увод фокуса и выделения с панелей
			if(FileManager.curCol){
				// если есть выделенные файлы - сбросить выделение
				if(FileManager.selected[FileManager.curCol].length)
					FileManager.unselect(FileManager.curCol);
				// иначе деактивировать активную колонку
				else
					FileManager.activateCol(null);
			}
		},
		
		home: function(){
			FileManager.unselect(FileManager.curCol);
			var item = FileManager.html[FileManager.curCol].tbody.children().first();
			FileManager.select(FileManager.curCol, item);
			
			FileManager.html[FileManager.curCol].tbody.parent().parent().scrollTop(0);
		},
		
		end: function(){
			FileManager.unselect(FileManager.curCol);
			var item = FileManager.html[FileManager.curCol].tbody.children().last();
			FileManager.select(FileManager.curCol, item);
			
			FileManager.html[FileManager.curCol].tbody.parent().parent().scrollTop(
				FileManager.html[FileManager.curCol].tbody.parent().height()
			);
		},
		
		tab: function(){
			
			if(FileManager.curCol == 'left')
				FileManager.activateCol('right');
			else
				FileManager.activateCol('left');
		},
	
		up: function(){
			
			// передвижение выделения опций меню
			if(FileManager.ContextMenu.isDisplayed){
				FileManager.ContextMenu.activatePrevOpt();
				return;
			}
			
			// передвижение выделения файлов
			var l = FileManager.selected[FileManager.curCol].length;
			var item;
			if (l) {
				item = FileManager.selected[FileManager.curCol][l-1].html.prev();
				if (!item.length) {
					item = null;
					// item = FileManager.html[FileManager.curCol].tbody.children().last();
				} else {
					FileManager.unselect(FileManager.curCol);
				}
			} else {
				item = FileManager.html[FileManager.curCol].tbody.children().last();
			}
			if(item)
				FileManager.select(FileManager.curCol, item);
		},
		
		down: function(){
			
			// передвижение выделения опций меню
			if(FileManager.ContextMenu.isDisplayed){
				FileManager.ContextMenu.activateNextOpt();
				return;
			}
			
			// передвижение выделения файлов
			var l = FileManager.selected[FileManager.curCol].length;
			var item;
			if(l){
				item = FileManager.selected[FileManager.curCol][l-1].html.next();
				if(!item.length){
					item = null;
					// item = FileManager.html[FileManager.curCol].tbody.children().first();
				}else{
					FileManager.unselect(FileManager.curCol);
				}
			}else{
				item = FileManager.html[FileManager.curCol].tbody.children().first();
			}
			if(item)
				FileManager.select(FileManager.curCol, item);
		},
		
		enter: function(){
			
			// клик по выделенному элементу контекстного меню
			if(FileManager.ContextMenu.isDisplayed){
				if(FileManager.ContextMenu.activeOptIndex !== null)
					FileManager.ContextMenu.options[FileManager.ContextMenu.activeOptIndex].click();
				return;
			}
			
			// клик по выделенному элементу дерева
			if(FileManager.selected[FileManager.curCol].length == 1){
				FileManager.selected[FileManager.curCol][0].html.click();
			}
		},
	},
	
	_findHTML: function(){
		this.html = {
			btnFastMove: $('#btn-fast-mode'),
			colBoxes: $('.fm-col-box'),
			left: {
				addr: $('#fm-addr-left'),
				col: $('#fm-left-col'),
				tbody: $('#fm-left-col-tbody'),
				freeSpace: $('#fm-left-freespace'),
				scroller: $('.fm-col-scroller.left'),
			},
			right: {
				addr: $('#fm-addr-right'),
				col: $('#fm-right-col'),
				tbody: $('#fm-right-col-tbody'),
				freeSpace: $('#fm-right-freespace'),
				scroller: $('.fm-col-scroller.right'),
			}
		}
	},
	
	_parseHash: function(path){
		
		var hash = location.hash;
		if(hash.length < 2){
			this.curDir.left = path;
			this.curDir.right = path;
			return false;
		}
		
		hash = hash.substr(1);
		var pair;
		var _GET = {};
		var pairs = hash.split('&');
		for(var i in pairs){
			pair = pairs[i].split('=');
			_GET[pair[0]] = pair[1] || '';
		}
		
		this.curDir.left = _GET['ldir'] || path;
		this.curDir.right = _GET['rdir'] || path;
		
		return true;
	},
	
	updateHash: function(){
		
		location.hash = '#'
			+ 'ldir=' + this.curDir.left
			+ '&rdir=' + this.curDir.right;
	},
	
	displayFileTree: function(cols){
		
		this.block = true;
		this.showLoadIcon();
		
		for(var ci = 0; ci < cols.length; ci++){
			(function(col, ci, ct){
				$.get(href('fm-get-tree'), {dir: FileManager.curDir[col]}, function(response){
					
					if(response.errcode){
						FileManager.block = false;
						FileManager.updateHash();
						FileManager.hideLoadIcon();
						trace(response.errmsg);
						return;
					}
					
					FileManager.html[col].freeSpace.html('В каталоге  свободно ' + response.freeSpace);
					FileManager.html[col].tbody.empty();
					FileManager.curDir[col] = response.curDir;
					FileManager.html[col].addr.val(response.curDir);
					FileManager.selected[col] = [];
					
					// var_dump(response, 'o=c/files a');
					FileManager.html[col].tbody.append(FileManager._createUpItem(col, response.curDir));
					for(var i = 0; i < response.dirs.length; i++)
						FileManager.html[col].tbody.append(FileManager._createTreeItem('dir', response.dirs[i], col, response.curDir));
						
					for(var i = 0; i < response.files.length; i++)
						FileManager.html[col].tbody.append(FileManager._createTreeItem('file', response.files[i], col, response.curDir));
					
					var maxNameWidth = 0;
					FileManager.html[col].tbody.children().each(function(){
						var w = $(this).children('.fm-col-name').width();
						if(w > maxNameWidth)
							maxNameWidth = w;
					});
					if(maxNameWidth)
						FileManager.html[col].tbody.children().children('.fm-col-name').css('width', Math.round(maxNameWidth * 1.2));
					
					// последняя итерация
					if(ci == ct){
						FileManager.block = false;
						FileManager.updateHash();
						FileManager.hideLoadIcon();
					}
						
				}, 'json');
			})(cols[ci], ci, cols.length - 1);
		}
	},
	
	_createUpItem: function(col, path){
		return $('<tr class="fm-row-up"></tr>')
				.data('type', 'up')
				.data('path', path)
				.data('name', '..')
				.hover(
					function(){$(this).addClass('fm-row-hover');},
					function(){$(this).removeClass('fm-row-hover');})
				.click(this.fastMove
					? function(){FileManager.cd('..', col); return false;}
					: function(){FileManager.select(col, this); return false;})
				.dblclick(this.fastMove
					? function(){return false;}
					: function(){FileManager.cd('..', col); return false;})
			.append('<td class="fm-col-icon"><img alt="f" src="data/images/up.png"></td>')
			.append($('<td class="fm-col-name"><label>..</label></td>'))
			.append('<td></td>')
			.append('<td></td>');
	},
	
	_createTreeItem: function(type, elm, col, path){
		// папки
		if(type == 'dir'){
			return $('<tr class="fm-row-dir"></tr>')
				.data('type', type)
				.data('path', path)
				.data('name', elm.name)
				.hover(
					function(){$(this).addClass('fm-row-hover');},
					function(){$(this).removeClass('fm-row-hover');})
				.click(FileManager._createClickHandler(type, elm, col))
				.dblclick(FileManager._createDblClickHandler(type, elm, col))
				
				.append('<td class="fm-col-icon"><img alt="d" src="data/images/fldr.png"></td>')
				.append($('<td class="fm-col-name"><label>' + elm.name + '</label></td>'))
				.append('<td style="text-align: center;">-</td>')
				.append('<td class="fm-col-emtime" title="' + elm.emtime + '">' + elm.emtime.substr(0, 11) + '</td>');
		}
		// файлы
		else{
			return $('<tr class="fm-row-file"></tr>')
				.data('type', type)
				.data('path', path)
				.data('name', elm.name)
				.hover(
					function(){$(this).addClass('fm-row-hover');},
					function(){$(this).removeClass('fm-row-hover');})
				.click(FileManager._createClickHandler(type, elm, col))
				.dblclick(FileManager._createDblClickHandler(type, elm, col))
				
				.append('<td class="fm-col-icon"><img alt="f" src="data/images/file.png"></td>')
				.append($('<td class="fm-col-name"><label>' + elm.name + '</label></td>'))
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
						FileManager.select(col, this, true);
					else
						FileManager.cd(elm.name, col);
					e.stopPropagation();
					return false;
				}
				// no fast move
				: function(e){
					FileManager.select(col, this, e.ctrlKey);
					e.stopPropagation();
					return false;
				};
		}
		// файлы
		else{
			return this.fastMove
				// fast move
				? function(e){
					var t = $(this);
					if(e.ctrlKey)
						FileManager.select(col, this, true);
					else{
						FileManager.ContextMenu.create(elm.name)
							.addOpt('открыть', function(){FileManager.actions.open(t.data('path') + elm.name);})
							.addOpt('править', function(){FileManager.actions.edit(t.data('path') + elm.name);})
							.addOpt('переименовать', function(){FileManager.actions.rename(t.data('path'), elm.name, 'file');})
							.addOpt('скачать', function(){FileManager.actions.download(t.data('path') + elm.name);})
							.addOpt('удалить', function(){FileManager.actions.del(t.data('path') + elm.name);})
							.show(
								e.clientX || (t.offset().left + 50),
								e.clientY || (t.offset().top + 5));
					}
					return false;
				}
				// no fast move
				: function(e){
					FileManager.select(col, this, e.ctrlKey);
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
	
	reload: function(panel){
		
		if(this.block)
			return;
		
		panel = panel ? [panel] : ['left', 'right'];
		this.displayFileTree(panel);
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
		
	optMkdir: function(){
		
		if (!this.curCol){
			alert('Выберите столбец.');
			return;
		}
		
		var path = this.curDir[this.curCol];
		if (!path) {
			alert('Ошибка пути');
			return;
		}
		
		var name = prompt('Введите имя папки','Новая папка');
		if (typeof name != 'string') {
			return;
		}
		if (!name.length) {
			alert('Имя папки не должно быть пустым');
			return;
		}
		
		$.post(href('fm-mkdir'), {path: path, name: name}, function(response){
			if (response != 'ok') {
				alert('Ошибка создания папки:\n' + response);
				return;
			}
			FileManager.displayFileTree([FileManager.curCol]);
		});
	},
	
	optMkfile: function(){
		
		if (!this.curCol){
			alert('Выберите столбец.');
			return;
		}
		
		var path = this.curDir[this.curCol];
		if (!path) {
			alert('Ошибка пути');
			return;
		}
		
		var name = prompt('Введите имя файла','file.txt');
		if (typeof name != 'string') {
			return;
		}
		if (!name.length) {
			alert('Имя файла не должно быть пустым');
			return;
		}
		
		$.post(href('fm-mkfile'), {path: path, name: name}, function(response){
			if (response != 'ok') {
				alert('Ошибка создания файла:\n' + response);
				return;
			}
			FileManager.displayFileTree([FileManager.curCol]);
		});
	},

	select: function(col, elm, append){
		
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
		
		var $elm = $(elm);
		var item = {
			type:     $elm.data('type'),                       // тип [file|dir]
			path:     $elm.data('path'),
			name:     $elm.data('name'),
			fullName: $elm.data('path') + $elm.data('name'),   // полный путь выделенного файла
			html:     $elm,                                    // jquery dom объект tr-строки
		}
		
		item.html.addClass('fm-select');
		this.selected[col].push(item);
		this.activateCol(col);
		
		// прокрукта, чтобы текущий элемент стал видимым
		var scroller = this.html[col].scroller;
		var scrollerHeight = scroller.height();
		var scrollerScroll = scroller.scrollTop();
		var elmPos = $elm.position().top;
		var scroll = -1;
		
		if (elmPos < 20)
			scroll = scrollerScroll - (30 - elmPos);
		else if (elmPos > scrollerHeight - 20)
			scroll = scrollerScroll + (elmPos - scrollerHeight + 30)
		
		if (scroll > -1)
			scroller.scrollTop(scroll);
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
		
	fastMoveToggle: function(enable){
		
		if(this.block)
			return;
			
		if (enable) {
			this.fastMove = true;
			this.log('Быстрая навигация включена');
		} else {
			this.fastMove = false;
			this.log('Быстрая навигация отключена');
		}
		this.displayFileTree(['left', 'right']);
	},
	
	fitHeight: function(enable){
		
		var box = $('.fm-col-scroller');
		
		var docH = $('#su-content').height();
		var winH = $(window).height();
		var boxH = box.height();
		
		if (enable) {
			box.css('height', boxH + (winH - docH));
		} else {
			box.css('height', 'auto');
		}
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
		text = text.replace(/\n/g, '<br />');
		$('<div style="color: ' + color + ';"></div>')
			.append('<span class="fm-log-date">' + new Date().getYNString() + ' </span>')
			.append('<span>' + text + '</span>')
			.appendTo('#fm-log-body');
	},
	
	actions: {
		open: function(fullname){
			window.open(href('fm-openfile&f=' + fullname), '_blank');
		},
		edit: function(fullname){
			window.open(href('fm-editfile&f=' + fullname), '_blank');
		},
		download: function(fullname){
			window.open(href('fm-download&f=' + fullname), '_blank');
		},
		del: function(fullname){
			
			var files = [];
			if(fullname){
				files.push(fullname);
			}else if(FileManager.curCol && FileManager.selected[FileManager.curCol].length){
				for(var i = FileManager.selected[FileManager.curCol].length - 1; i >= 0; i--)
					files.push(FileManager.selected[FileManager.curCol][i].fullName);
			}
			
			if(!files.length){
				alert('нечего удалять');
				return;
			}
			
			var filesStr = '';
			for(var i = files.length - 1; i >= 0; i--)
				filesStr += '\n' + files[i];
			
			if(confirm('удалить ' + files.length + ' файлов безвозвратно?\n' + filesStr)){
				$.post(href('fm-delete'), {files: files}, function(response){
					if (response != 'ok') {
						alert(response);
						return;
					}
					if (files.length == 1)
						FileManager.log('Файл ' + files[0] + ' удален.');
					else
						FileManager.log('Файлы' + filesStr + '\nудалены.');
					FileManager.reload();
				});
			}
		},
		rename: function(path, originName, type) {
			
			if (!path) {
				if (FileManager.curCol && FileManager.selected[FileManager.curCol].length) {
					if (FileManager.selected[FileManager.curCol].length > 1) {
						alert('Выберите не более одного файла');
						return;
					}
					path = FileManager.selected[FileManager.curCol][0].path;
					originName = FileManager.selected[FileManager.curCol][0].name;
					type = FileManager.selected[FileManager.curCol][0].type;
				} else {
					alert('файлы не выбраны');
					return;
				}
			}
			
			var name = prompt('Введите имя', originName);
			
			if (name === false || !name.length)
				return;
			if (name == originName) {
				FileManager.log('имена совпадают','error');
				return;
			}
			
			$.post(href('fm-rename'), {type: type, path: path, originName: originName, newName: name}, function(response){
				if (response == 'ok') {
					FileManager.log('Файл ' + path + originName + ' переименован в ' + path + name);
					FileManager.reload();
				} else {
					alert(response);
				}
			});
		},
		copy: function(){
			
		},
		move: function(){
			
		},
	},
	
	ContextMenu: {
		isDisplayed: false,
		html: null,
		options: [],
		activeOptIndex: null,
		
		create: function(html){
			if(this.html)
				this.clear();
			this.html = $('<div class="fm-context-menu"></div>');
			
			$(document).bind('click.fm-context-menu', function(e){
				FileManager.ContextMenu.close();
			});
			
			if(html)
				this.addHtml(html);
			return this;
		},
		addHtml: function(html){
			this.html.append($('<div class="fm-context-menu-text"></div>').append(html));
			return this;
		},
		addOpt: function(text, clickHandler){
			var optIndex = this.options.length;
			var opt = $('<a class="fm-context-menu-opt"></a>')
				.append(text)
				.click(function(e){
					clickHandler();
					e.stopPropagation();
					FileManager.ContextMenu.close();
				})
				.hover(function(){
					$(this).addClass('active');
					FileManager.ContextMenu.activeOptIndex = optIndex;
				}, function(){
					$(this).removeClass('active');
					FileManager.ContextMenu.activeOptIndex = null;
				});
			this.options[optIndex] = opt;
			this.html.append(opt);
			return this;
		},
		activateNextOpt: function(){
			var l = this.options.length;
			if(l){
				if(this.activeOptIndex === null){
					this.activeOptIndex = 0;
				}else if(this.activeOptIndex < (l - 1)){
					this.options[this.activeOptIndex].removeClass('active');
					this.activeOptIndex++;
				}else{
					this.options[this.activeOptIndex].removeClass('active');
					this.activeOptIndex = 0;
				}
				this.options[this.activeOptIndex].addClass('active');
			}
		},
		activatePrevOpt: function(){
			var l = this.options.length;
			if(l){
				if(this.activeOptIndex === null){
					this.activeOptIndex = l - 1;
				}else if(this.activeOptIndex > 0){
					this.options[this.activeOptIndex].removeClass('active');
					this.activeOptIndex--;
				}else{
					this.options[this.activeOptIndex].removeClass('active');
					this.activeOptIndex = l - 1;
				}
				this.options[this.activeOptIndex].addClass('active');
			}
		},
		show: function(x, y){
			this.isDisplayed = true;
			this.html.appendTo(document.body);
			this.html.css({
				left: x - this.html.width() / 2,
				top: y + $(document).scrollTop() - this.html.height() / 2,
			});
			return this;
		},
		clear: function(){
			if(this.html)
				this.html.empty();
			return this;
		},
		close: function(){
			this.isDisplayed = false;
			if(this.html)
				this.html.remove();
			this.html = null;
			this.options = [];
			this.activeOptIndex = null;
			$(document).unbind('click.fm-context-menu');
			return this;
		}
	}
}

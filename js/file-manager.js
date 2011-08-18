
var FileManager = {
	curCol: 0,   	// ������� ������� (��� ���������� ������� ������)
	response: '',	// ����������, ���������� ����� ������� (��� �������, ������)
	act: false,		// ������� ��������
		
	mustReload: false,	// ���� ������������ (����� ������������� ������ �������)
	fastMove: true,	// ���� ������� ��������� (��� ��������� ��������)
	
	selected: false,// ������ ������ �� ���������� DOM �������
	target: false,	// ��� ����������� ����� ��� �����
	col: false,		// �������, � ������� ��������� ���������� ������� (��� ���������� �����)
	type: false,	// 1 - �����, 2 - ����
	block: false,	// ���������� ������������.
		
	activeColVal: false,	//�������� ������� (��������� ������� �����)
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
			
			switch(e.keyCode){
				case 113: // F2
					trace("f2");
					return false;
				case 46: // DELETE
					trace("delete");
					break;
			}
		});
		
		this.html.colBoxes.click(function(e){
			
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
					
					FileManager.html[col].tbody.empty();
					FileManager.html[col].addr.val(response.curDir);
					FileManager.selected[col] = [];
					
					var_dump(response, 'o=c/files a');
					FileManager.html[col].tbody.append(FileManager._createUpItem(col));
					for(var i = 0; i < response.dirs.length; i++)
						FileManager.html[col].tbody.append(FileManager._createTreeItem('dir', response.dirs[i], col));
						
					for(var i = 0; i < response.files.length; i++)
						FileManager.html[col].tbody.append(FileManager._createTreeItem('file', response.files[i], col));
					
					// ��������� ��������
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
			.append('<td class="fm-col-icon"><img alt="f" src="data/images/up.png"></td>')
			.append($('<td class="fm-col-name">..</td>')
				.click(this.fastMove
					? function(){FileManager.cd('..', col); return false;}
					: function(){FileManager.select('..', '..', col, this); return false;})
				.dblclick(this.fastMove
					? function(){return false;}
					: function(){FileManager.cd('..', col); return false;})
			)
			.append('<td></td>');
	},
	
	_createTreeItem: function(type, elm, curCol){
		// �����
		if(type == 'dir'){
			return $('<tr></tr>')
				.append('<td class="fm-col-icon"><img alt="d" src="data/images/fldr.png"></td>')
				.append($('<td class="fm-col-name">' + elm.name + '</td>')
					 .click(FileManager._createClickHandler(type, elm, curCol))
					 .dblclick(FileManager._createDblClickHandler(type, elm, curCol)))
					 // .append('<input type="text" disabled="disabled" value="' + elm.name + '" size="' + elm.name.length + '" />')
					 // .append('<button class="fm-text-button" onclick="return false;">' + elm.name + '</button>')
				.append('<td style="text-align: center;">-</td>')
				.append('<td class="fm-col-emtime" title="' + elm.emtime + '">' + elm.emtime.substr(0, 11) + '</td>');
		}
		// �����
		else{
			return $('<tr></tr>')
				.append('<td class="fm-col-icon"><img alt="f" src="data/images/file.png"></td>')
				.append($('<td class="fm-col-name">' + elm.name + '</td>')
					 .click(FileManager._createClickHandler(type, elm, curCol))
					 .dblclick(FileManager._createDblClickHandler(type, elm, curCol)))
				.append('<td style="text-align: right;">' + elm.size + '</td>')
				.append('<td class="fm-col-emtime" title="' + elm.emtime + '">' + elm.emtime.substr(0, 11) + '</td>');
		}
	},
	
	_createClickHandler: function(type, elm, col){
		// �����
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
		// �����
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
		// �����
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
			catch(e){alert("������ ������������� ������!\n\n\t����� �������:\n" + XHR.responseText + '\n\n\t������ Javascript:\n' + e);}
			try{
				if(FileManager.curCol == 1){FileManager.curDirL = decodeURIComponent(FileManager.response.curDir); FileManager.activeCol(1);}
				else if(FileManager.curCol == 2){FileManager.curDirR = decodeURIComponent(FileManager.response.curDir); FileManager.activeCol(2);}
				else{FileManager.curDirL = FileManager.curDirR = decodeURIComponent(FileManager.response.curDir); FileManager.activeCol(0);}
				//��������� �������
				FileManager.showList();
				//���� ������������
				if(FileManager.mustReload){FileManager.mustReload = false; FileManager.act = 'FileManager'; FileManager.curCol = 2; FileManager.send('act=showTree&curDir=' + encodeURI(FileManager.curDirR));}
			}
			catch(e){alert("������ ������������� ������!\n�������: "+FileManager.curCol+"\n����� �������:\n" + XHR.responseText + '\n\n������ Javascript:\n' + e);}
		}
		else if(FileManager.act == 'rename'){
			if(XHR.responseText.substr(0,3) == '01.'){FileManager.log('���� ������� ������������.', 'ok'); FileManager.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){FileManager.log('���� �� ������!', 'error');}
			else if(XHR.responseText.substr(0,3) == '03.'){FileManager.log('���� � ����� ������ ��� ����������.', 'error');}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('������ ��������������.\n\n' + XHR.responseText);}
			else{alert('�������������� ������ ��������������.\n\n' + XHR.responseText);}
		}
		else if(FileManager.act == 'copy'){
			if(XHR.responseText.substr(0,3) == '01.'){FileManager.log('���� ������� ���������.', 'ok'); FileManager.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('���� �� ������!');}
			else if(XHR.responseText.substr(0,3) == '03.'){if(confirm('���� � ����� ������ ����������. ������������?')){FileManager.optCopy(true);}}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('������ �����������.\n\n' + XHR.responseText);}
			else{alert('�������������� ������ �����������.\n\n' + XHR.responseText);}
		}
		else if(FileManager.act == 'replace'){
			if(XHR.responseText.substr(0,3) == '01.'){FileManager.log('���� ������� ���������.', 'ok'); FileManager.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('���� �� ������!');}
			else if(XHR.responseText.substr(0,3) == '03.'){if(confirm('���� � ����� ������ ����������. ������������?')){FileManager.optReplace(true);}}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('������ �����������.\n\n' + XHR.responseText);}
			else{alert('�������������� ������ �����������.\n\n' + XHR.responseText);}
		}
		else if(FileManager.act == 'delFile'){
			if(XHR.responseText.substr(0,3) == '01.'){FileManager.log('���� ������', 'ok'); FileManager.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('���� �� ������!');}
			else if(XHR.responseText.substr(0,3) == '03.'){alert('������ �������� �����.\n\n' + XHR.responseText);}
			else{alert('�������������� ������ ��������.\n\n' + XHR.responseText);}
		}
		else if(FileManager.act == 'mkdir'){
			var ans = XHR.responseText.substr(0,3);
			if(ans == '01.'){FileManager.log('����� ������� �������', 'ok'); FileManager.reload();}
			else if(ans == '02.'){FileManager.log('���������� � ����� ������ ��� ����������.', 'error');}
			else if(ans == '03.'){alert('������ �������� �����.\n\n' + XHR.responseText);}
			else{alert('�������������� ������.\n\n' + XHR.responseText);}
		}
		else if(FileManager.act == 'mkfile'){
			var ans = XHR.responseText.substr(0,3);
			if(ans == '01.'){FileManager.log('���� ������� ������', 'ok'); FileManager.reload();}
			else if(ans == '02.'){FileManager.log('���� � ����� ������ ��� ����������.', 'error');}
			else if(ans == '03.'){alert('������ �������� �����.\n\n' + XHR.responseText);}
			else{alert('�������������� ������.\n\n' + XHR.responseText);}
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
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		if(this.type != 2){alert("���� ������� ����!");return;}
		var param = encodeURI((this.col == 1 ? FileManager.curDirL : FileManager.curDirR) + '/' + this.target);
		window.open('data/php/fileView.php?fileView=' + param);
	},
		
	optRename: function(){
		FileManager.act = 'rename';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		var path = this.col == 1 ? FileManager.curDirL : FileManager.curDirR;
		if(!path){alert('������ ����');return;}
		var name = prompt('������� ���', this.target);
		if(name === false){return;}
		if(!name.length){alert('��� �� ������ ���� ������');return;}
		if(this.target == name){log('����� ���������','error');return;}
		this.block = true;
		FileManager.send('act=rename&path=' + encodeURI(path) + '&oldname=' + encodeURI(this.target) + '&newname=' + encodeURI(name));
	},
	
	optLoad: function(){
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		if(this.type != 2){alert("���� ������� ����!");return;}
		var param = encodeURI((this.col == 1 ? FileManager.curDirL : FileManager.curDirR) + '/' + this.target);
		window.open('data/php/fileLoader.php?loadfile=' + param, 'fileLoader');
	},
	
	optCopy: function(anyCase){
		FileManager.act = 'copy';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		if(!FileManager.curDirL || !FileManager.curDirR){alert("������ �����!");return;}
		if(this.type != 2){alert("���� ������� ����!");return;}
		if(FileManager.curDirL == FileManager.curDirR){alert("���������� ���������.");return;}
		this.block = true;
		FileManager.send('act=copyFile' + (anyCase ? '&anyCase=yes' : '') + '&dirFrom=' + encodeURI(this.col == 1 ? FileManager.curDirL : FileManager.curDirR) + '&dirTo=' + encodeURI(this.col == 2 ? FileManager.curDirL : FileManager.curDirR) + '&fname=' + encodeURI(this.target));
	},
	
	optReplace: function(anyCase){
		FileManager.act = 'replace';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		if(!FileManager.curDirL || !FileManager.curDirR){alert("������ �����!");return;}
		if(this.type != 2){alert("���� ������� ����!");return;}
		if(!anyCase){if(!confirm('����������� ���� "' + this.target + '"?')){return;}}
		if(FileManager.curDirL == FileManager.curDirR){alert("���������� ���������.");return;}
		this.block = true;
		FileManager.send('act=replaceFile' + (anyCase ? '&anyCase=yes' : '') + '&dirFrom=' + encodeURI(this.col == 1 ? FileManager.curDirL : FileManager.curDirR) + '&dirTo=' + encodeURI(this.col == 2 ? FileManager.curDirL : FileManager.curDirR) + '&fname=' + encodeURI(this.target));
	},
	
	optDelFile: function(){
		FileManager.act = 'delFile';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		if(!confirm('������� ���� "' + this.target + '"?')){return;}
		var path = this.col == 1 ? FileManager.curDirL : FileManager.curDirR;
		if(!path){alert("������ ����!");return;}
		this.block = true;
		FileManager.send('act=delFile&fullpath=' + encodeURI(path + '/' + this.target));
	},
		
	optMkdir: function(){
		FileManager.act = 'mkdir';
		if(!this.activeColVal){alert('�������� �������.'); return;}
		var path = this.activeColVal == 'fm-left-col' ? this.curDirL : this.curDirR;
		if(!path){alert('������ ����');return;}
		var name = prompt('������� ��� �����','����� �����');
		if(name === false){return;}
		if(!name.length){alert('��� ����� �� ������ ���� ������'); this.optMkdir();return;}
		this.block = true;
		FileManager.send('act=mkdir&path=' + encodeURI(path) + '&name=' + encodeURI(name));
	},
	
	optMkfile: function(){
		FileManager.act = 'mkfile';
		if(!this.activeColVal){alert('�������� �������.'); return;}
		var path = this.activeColVal == 'fm-left-col' ? this.curDirL : this.curDirR;
		if(!path){alert('������ ����');return;}
		var name = prompt('������� ��� �����','file.txt');
		if(name === false){return;}
		if(!name.length){alert('��� ����� �� ������ ���� ������'); this.optMkfile();return;}
		this.block = true;
		FileManager.send('act=mkfile&path=' + encodeURI(path) + '&name=' + encodeURI(name));
	},

	select: function(type, name, col, elm, append){
		
		if(this.block)
			return;
		
		// ���� ��������� �� �����������, �������� ��� ���������� ��������� ��������
		if(!append){
			for(var i = this.selected[col].length - 1; i >= 0; i--)
				this.selected[col][i].htmlTr.removeClass('fm-select');
			this.selected[col] = [];
		}
		
		var item = {
			type: type, // ��� (���� ��� �����)
			name: name, // ��� ����������� �����
			html: $(elm), // jquery dom ������ �����
			htmlTr: $(elm).parent() // jquery dom ������ tr-������, ���������� ��������� ����
		}
		item.htmlTr.addClass('fm-select');
		this.selected[col].push(item);
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
		
		if(this.curCol == col)
			return;
		
		this.curCol = col;
		this.html.left.col.removeClass('fm-col-active');
		this.html.right.col.removeClass('fm-col-active');
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
			this.log('������� ��������� ��������');
		}else{
			this.fastMove = false;
			this.log('������� ��������� ���������');
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

	showList: function(){
		var tb, tr, td1, td2;
		var imgDir = '';
		var imgFile = '';
		if(this.curCol == 1){tb = $('fm-left-col').lastChild;}
		else if(this.curCol == 2){tb = $('fm-right-col').lastChild;}
		else{this.curCol = 1; this.showList(); this.curCol = 2; this.showList(); return;}
		
		/**** ������� ****/
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
		
		/**** ���������� ����� ****/
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
		/**** ���������� ������ ****/
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
		
		/**** ���������� ���� ������ ****/
		if(this.curCol == 1){$('addr-left').value = this.curDirL;}
		else if(this.curCol == 2){$('addr-right').value = this.curDirR;}
		
		/**** ���������� ������ ��������� ****/
		$('fm-status-bar').innerHTML = '� ���������� <b><u>' + (this.curCol == 1 ? this.curDirL : this.curDirR) + '</u></b> �������� ' + this.response.freeSpace;
	}
}

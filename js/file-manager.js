
var fileTree = {
	curDirL: '',	// ����� � ����� �������
	curDirR: '',	// ����� � ������ �������
	curCol: false,	// ������� ������� (��� ���������� ������� ������)
	response: '',	// ����������, ���������� ����� ������� (��� �������, ������)
	act: false,		// ������� ��������
		
	mustReload: false,	// ���� ������������ (����� ������������� ������ �������)
	fastMove: false,	// ���� ������� ��������� (��� ��������� ��������)
	
	selected: false,// ������ ������ �� ���������� DOM �������
	target: false,	// ��� ����������� ����� ��� �����
	col: false,		// �������, � ������� ��������� ���������� ������� (��� ���������� �����)
	type: false,	// 1 - �����, 2 - ����
	block: false,	// ���������� ������������.
		
	activeColVal: false,	//�������� ������� (��������� ������� �����)
	
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
			catch(e){alert("������ ������������� ������!\n\n\t����� �������:\n" + XHR.responseText + '\n\n\t������ Javascript:\n' + e);}
			try{
				if(fileTree.curCol == 1){fileTree.curDirL = decodeURIComponent(fileTree.response.curDir); fileTree.activeCol(1);}
				else if(fileTree.curCol == 2){fileTree.curDirR = decodeURIComponent(fileTree.response.curDir); fileTree.activeCol(2);}
				else{fileTree.curDirL = fileTree.curDirR = decodeURIComponent(fileTree.response.curDir); fileTree.activeCol(0);}
				//��������� �������
				fileTree.showList();
				//���� ������������
				if(fileTree.mustReload){fileTree.mustReload = false; fileTree.act = 'filetree'; fileTree.curCol = 2; fileTree.send('act=showTree&curDir=' + encodeURI(fileTree.curDirR));}
			}
			catch(e){alert("������ ������������� ������!\n�������: "+fileTree.curCol+"\n����� �������:\n" + XHR.responseText + '\n\n������ Javascript:\n' + e);}
		}
		else if(fileTree.act == 'rename'){
			if(XHR.responseText.substr(0,3) == '01.'){fileTree.log('���� ������� ������������.', 'ok'); fileTree.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){fileTree.log('���� �� ������!', 'error');}
			else if(XHR.responseText.substr(0,3) == '03.'){fileTree.log('���� � ����� ������ ��� ����������.', 'error');}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('������ ��������������.\n\n' + XHR.responseText);}
			else{alert('�������������� ������ ��������������.\n\n' + XHR.responseText);}
		}
		else if(fileTree.act == 'copy'){
			if(XHR.responseText.substr(0,3) == '01.'){fileTree.log('���� ������� ���������.', 'ok'); fileTree.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('���� �� ������!');}
			else if(XHR.responseText.substr(0,3) == '03.'){if(confirm('���� � ����� ������ ����������. ������������?')){fileTree.optCopy(true);}}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('������ �����������.\n\n' + XHR.responseText);}
			else{alert('�������������� ������ �����������.\n\n' + XHR.responseText);}
		}
		else if(fileTree.act == 'replace'){
			if(XHR.responseText.substr(0,3) == '01.'){fileTree.log('���� ������� ���������.', 'ok'); fileTree.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('���� �� ������!');}
			else if(XHR.responseText.substr(0,3) == '03.'){if(confirm('���� � ����� ������ ����������. ������������?')){fileTree.optReplace(true);}}
			else if(XHR.responseText.substr(0,3) == '04.'){alert('������ �����������.\n\n' + XHR.responseText);}
			else{alert('�������������� ������ �����������.\n\n' + XHR.responseText);}
		}
		else if(fileTree.act == 'delFile'){
			if(XHR.responseText.substr(0,3) == '01.'){fileTree.log('���� ������', 'ok'); fileTree.reload();}
			else if(XHR.responseText.substr(0,3) == '02.'){alert('���� �� ������!');}
			else if(XHR.responseText.substr(0,3) == '03.'){alert('������ �������� �����.\n\n' + XHR.responseText);}
			else{alert('�������������� ������ ��������.\n\n' + XHR.responseText);}
		}
		else if(fileTree.act == 'mkdir'){
			var ans = XHR.responseText.substr(0,3);
			if(ans == '01.'){fileTree.log('����� ������� �������', 'ok'); fileTree.reload();}
			else if(ans == '02.'){fileTree.log('���������� � ����� ������ ��� ����������.', 'error');}
			else if(ans == '03.'){alert('������ �������� �����.\n\n' + XHR.responseText);}
			else{alert('�������������� ������.\n\n' + XHR.responseText);}
		}
		else if(fileTree.act == 'mkfile'){
			var ans = XHR.responseText.substr(0,3);
			if(ans == '01.'){fileTree.log('���� ������� ������', 'ok'); fileTree.reload();}
			else if(ans == '02.'){fileTree.log('���� � ����� ������ ��� ����������.', 'error');}
			else if(ans == '03.'){alert('������ �������� �����.\n\n' + XHR.responseText);}
			else{alert('�������������� ������.\n\n' + XHR.responseText);}
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
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		if(this.type != 2){alert("���� ������� ����!");return;}
		var param = encodeURI((this.col == 1 ? fileTree.curDirL : fileTree.curDirR) + '/' + this.target);
		window.open('data/php/fileView.php?fileView=' + param);
	},
		
	optRename: function(){
		fileTree.act = 'rename';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		var path = this.col == 1 ? fileTree.curDirL : fileTree.curDirR;
		if(!path){alert('������ ����');return;}
		var name = prompt('������� ���', this.target);
		if(name === false){return;}
		if(!name.length){alert('��� �� ������ ���� ������');return;}
		if(this.target == name){log('����� ���������','error');return;}
		this.block = true;
		fileTree.send('act=rename&path=' + encodeURI(path) + '&oldname=' + encodeURI(this.target) + '&newname=' + encodeURI(name));
	},
	
	optLoad: function(){
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		if(this.type != 2){alert("���� ������� ����!");return;}
		var param = encodeURI((this.col == 1 ? fileTree.curDirL : fileTree.curDirR) + '/' + this.target);
		window.open('data/php/fileLoader.php?loadfile=' + param, 'fileLoader');
	},
	
	optCopy: function(anyCase){
		fileTree.act = 'copy';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		if(!fileTree.curDirL || !fileTree.curDirR){alert("������ �����!");return;}
		if(this.type != 2){alert("���� ������� ����!");return;}
		if(fileTree.curDirL == fileTree.curDirR){alert("���������� ���������.");return;}
		this.block = true;
		fileTree.send('act=copyFile' + (anyCase ? '&anyCase=yes' : '') + '&dirFrom=' + encodeURI(this.col == 1 ? fileTree.curDirL : fileTree.curDirR) + '&dirTo=' + encodeURI(this.col == 2 ? fileTree.curDirL : fileTree.curDirR) + '&fname=' + encodeURI(this.target));
	},
	
	optReplace: function(anyCase){
		fileTree.act = 'replace';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		if(!fileTree.curDirL || !fileTree.curDirR){alert("������ �����!");return;}
		if(this.type != 2){alert("���� ������� ����!");return;}
		if(!anyCase){if(!confirm('����������� ���� "' + this.target + '"?')){return;}}
		if(fileTree.curDirL == fileTree.curDirR){alert("���������� ���������.");return;}
		this.block = true;
		fileTree.send('act=replaceFile' + (anyCase ? '&anyCase=yes' : '') + '&dirFrom=' + encodeURI(this.col == 1 ? fileTree.curDirL : fileTree.curDirR) + '&dirTo=' + encodeURI(this.col == 2 ? fileTree.curDirL : fileTree.curDirR) + '&fname=' + encodeURI(this.target));
	},
	
	optDelFile: function(){
		fileTree.act = 'delFile';
		if(!this.selected || !this.target || !(this.col == 1 || this.col == 2)){alert("�������� ����!");return;}
		if(!confirm('������� ���� "' + this.target + '"?')){return;}
		var path = this.col == 1 ? fileTree.curDirL : fileTree.curDirR;
		if(!path){alert("������ ����!");return;}
		this.block = true;
		fileTree.send('act=delFile&fullpath=' + encodeURI(path + '/' + this.target));
	},
		
	optMkdir: function(){
		fileTree.act = 'mkdir';
		if(!this.activeColVal){alert('�������� �������.'); return;}
		var path = this.activeColVal == 'fm-left-col' ? this.curDirL : this.curDirR;
		if(!path){alert('������ ����');return;}
		var name = prompt('������� ��� �����','����� �����');
		if(name === false){return;}
		if(!name.length){alert('��� ����� �� ������ ���� ������'); this.optMkdir();return;}
		this.block = true;
		fileTree.send('act=mkdir&path=' + encodeURI(path) + '&name=' + encodeURI(name));
	},
	
	optMkfile: function(){
		fileTree.act = 'mkfile';
		if(!this.activeColVal){alert('�������� �������.'); return;}
		var path = this.activeColVal == 'fm-left-col' ? this.curDirL : this.curDirR;
		if(!path){alert('������ ����');return;}
		var name = prompt('������� ��� �����','file.txt');
		if(name === false){return;}
		if(!name.length){alert('��� ����� �� ������ ���� ������'); this.optMkfile();return;}
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
		if(col == 1){col = 'fm-left-col'}else if(col == 2){col = 'fm-right-col'}else{col = false;}	//�������� 'col' ��������� � ���� '1', '2' ��� ''
		if(this.activeColVal){$(this.activeColVal).firstChild.firstChild.className = 'fm-col-inactive';}	//���� ������� ��� �������, ������ ��� ���������
		this.activeColVal = col;
		if(this.activeColVal){$(this.activeColVal).firstChild.firstChild.className = 'fm-col-active';}	//���� ������ ����� �������, ������ ��� ��������
	},
	
	enableLoad: function(){
		$('loadingImg').style.display = 'inline';
	},
		
	disableLoad: function(){
		$('loadingImg').style.display = 'none';
	},
		
	fastMoveToggle: function(elm){
		if(elm.checked == true){this.fastMove = true; this.log('������� ��������� ��������');}
		else{this.fastMove = false; this.log('������� ��������� ���������');}
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
		
		/**** ������� ****/
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
		
		/**** ���������� ����� ****/
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
		/**** ���������� ������ ****/
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
		
		/**** ���������� ���� ������ ****/
		if(this.curCol == 1){$('addr-left').value = this.curDirL;}
		else if(this.curCol == 2){$('addr-right').value = this.curDirR;}
		
		/**** ���������� ������ ��������� ****/
		$('fm-status-bar').innerHTML = '� ���������� <b><u>' + (this.curCol == 1 ? this.curDirL : this.curDirR) + '</u></b> �������� ' + this.response.freeSpace;
	}
}

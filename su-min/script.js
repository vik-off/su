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
var XHR = false;
if(XMLHttpRequest){XHR = new XMLHttpRequest();}
else{
	try{XHR = new ActiveXObject("Msxml2.XMLHTTP");}
	catch(e){
	  try{XHR = new ActiveXObject("Microsoft.XMLHTTP");}
	  catch (e2){ alert('ajax не поддерживается браузером');}
	}
}


var printing = '';
function print_r(obj, level){
	if(!level){level = 1;}
	if(level > 2){return;}
	if(typeof obj == 'object'){
		for(var i in obj){
			for(var j = 1; j < level; j++){printing += '- ';}
			if(typeof obj[i] == 'object'){printing +=i + ' => {' + '<br>'; print_r(obj[i], level+1);}
			else if(i == 'length'){for(k = 0; k < obj[i]; k++){print_r(obj[k], level+1);}}
			else{printing += i + ' => ' + obj[i] + '<br>';}
		}
		for(var j = 1; j < level-1; j++){printing += '- ';}
		printing += '}<br><br>';
	}
	else{printing += obj + "<br>";}
	
}

function bodyKeyDown(evt){
	var k = evt.keyCode;
	if(k == '46'){fileTree.optDelFile(); return false;}	//DELETE
	if(k == '113'){fileTree.optRename(); return false;}	//F2
	return true;
}

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
		var path = this.activeColVal == 'leftCol' ? this.curDirL : this.curDirR;
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
		var path = this.activeColVal == 'leftCol' ? this.curDirL : this.curDirR;
		if(!path){alert('Ошибка пути');return;}
		var name = prompt('Введите имя файла','file.txt');
		if(name === false){return;}
		if(!name.length){alert('Имя файла не должно быть пустым'); this.optMkfile();return;}
		this.block = true;
		fileTree.send('act=mkfile&path=' + encodeURI(path) + '&name=' + encodeURI(name));
	},

	select: function(elm, col, type){
		if(this.block){return;}
		if(this.selected){this.selected.parentNode.parentNode.className = 'unselect';}
		elm.parentNode.parentNode.className = 'select';
		
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
		if(this.selected){this.selected.parentNode.parentNode.className = 'unselect';}
		this.selected = false;
		this.target = false;
		this.col = false;
		this.type = false;
	},
	
	activeCol: function(col){
		if(col == 1){col = 'leftCol'}else if(col == 2){col = 'rightCol'}else{col = false;}	//параметр 'col' поступает в виде '1', '2' или ''
		if(this.activeColVal){$(this.activeColVal).firstChild.firstChild.className = 'passive';}	//если столбец был выделен, делает его пассивным
		this.activeColVal = col;
		if(this.activeColVal){$(this.activeColVal).firstChild.firstChild.className = 'active';}	//если выбран новый столбец, делает его активным
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
		row.innerHTML = '<span class="logDate">' + dateStr + '</span> ' + text;
		if(!color){color = 'black';}else if(color == 'ok'){color = 'green';}else if(color == 'error'){color = 'red';}
		row.setAttribute('style', 'color:' + color + ';font-size:11px;');
		$('logBox').insertBefore(row,$('logBox').firstChild);
	},

	showList: function(){
		var tb, tr, td1, td2;
		var imgDir = '';
		var imgFile = '';
		if(this.curCol == 1){tb = $('leftCol').lastChild;}
		else if(this.curCol == 2){tb = $('rightCol').lastChild;}
		else{this.curCol = 1; this.showList(); this.curCol = 2; this.showList(); return;}
		
		/**** очистка ****/
		while(tb.childNodes.length > 1){tb.removeChild(tb.lastChild);}
		this.unselect();
		
		if(this.fastMove){
			$('leftColUp').onclick = function(){fileTree.move("..", 1); return false;}
			$('leftColUp').ondblclick = function(){return false;}
			$('rightColUp').onclick = function(){fileTree.move("..", 2); return false;}
			$('rightColUp').ondblclick = function(){return false;}
		}else{
			$('leftColUp').onclick = function(){fileTree.select(this, 1); return false;}
			$('leftColUp').ondblclick = function(){fileTree.move("..", 1);return false;}
			$('rightColUp').onclick = function(){fileTree.select(this, 2); return false;}
			$('rightColUp').ondblclick = function(){fileTree.move("..", 2);return false;}
		}
		
		/**** заполнение папок ****/
		for(var i = 0; i < this.response.dirs.length; i++){
			curElm = this.response.dirs[i];
			tr = document.createElement("TR");
			td1 = document.createElement("TD");
			td2 = document.createElement("TD");
			
			tr.className = 'unselect';
			
			if(this.fastMove){td1.innerHTML = "<a class='halffict fldr' href='#' onClick='fileTree.move(\"" + curElm[0] + "\", " + this.curCol + ");return false;' onDblClick='return false;'>" + curElm[0] + "</a>";}
			else{td1.innerHTML = "<a class='fict fldr' href='#' onClick='fileTree.select(this, " + this.curCol + ", 1); return false;' onDblClick='fileTree.move(\"" + curElm[0] + "\", " + this.curCol + "); return false;'>" + curElm[0] + "</a>";}

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

			tr.className = 'unselect';

			if(this.fastMove){td1.innerHTML = "<a class='halffict file' href='#' onClick='' onDblClick=''>" + curElm[0] + "</a>";}
			else{td1.innerHTML = "<a class='fict file' href='#' onClick='fileTree.select(this, " + this.curCol + ", 2); return false;' onDblClick='fileTree.openFile(); return false;'>" + curElm[0] + "</a>";}

			td2.innerHTML = curElm[1];
			td2.style.textAlign = 'right';	
			tr.appendChild(td1);
			tr.appendChild(td2);
			tb.appendChild(tr);
		}
		
		/**** заполнение поля адреса ****/
		if(this.curCol == 1){$('addrBoxLeft').value = this.curDirL;}
		else if(this.curCol == 2){$('addrBoxRight').value = this.curDirR;}
		
		/**** заполнение строки состояния ****/
		$('statusBar').innerHTML = 'В директории <b><u>' + (this.curCol == 1 ? this.curDirL : this.curDirR) + '</u></b> свободно ' + this.response.freeSpace;
	}
}
elmMenuBtn=false;
elmContextMenu=false;
elmNameItem=false;
elmRenamItem=false;
sureText=false;

/**** плавающее меню ****/

	sDivId='slideDiv';
	movePopup=false;
	popupX=800;
	popupY=50;
	clickX=false;
	clickY=false;
	vScroll=0;

function bodyScroll(){vScroll=document.body.scrollTop;document.getElementById(sDivId).style.top=popupY+vScroll}

function bodyMouseMove(){
	pElm=document.getElementById(sDivId);
	if(movePopup){
		pElm.style.left=popupX+event.screenX-clickX;
		pElm.style.top=popupY+vScroll+event.screenY-clickY;
	}
}

function allMouseUp(){
	movePopup=false;
	popupX=parseInt(document.getElementById(sDivId).style.left);
	popupY=parseInt(document.getElementById(sDivId).style.top)-vScroll;
}
/*************************/

function docLoad(){
}

function sure(){
	ans=confirm("Продолжить?");
	if(ans){ans=false; return true;}
	else{ans=false; return false;}
}

function changecurdir(elm){
	elm.style.display="none";
	formdiv=document.getElementById('newfldrbox');
	formdiv.style.display="inline-block";
	formdiv.firstChild.firstChild.select();
	formdiv.firstChild.firstChild.focus();
}

function bodyClick(){
	if(event.srcElement.nodeName!="A"){
		//дополнительное меню
		if(event.srcElement.id!='addMenuToggle'){document.getElementById('additionalMenu').style.display='none';}
		//контекстное меню
		if(event.srcElement.getAttribute('name')!='optionNode' && event.srcElement.getAttribute('name')!='optionNodesBtn'){if(elmContextMenu){elmContextMenu.style.display='none';elmContextMenu=false;}if(elmMenuBtn){elmMenuBtn.style.display='block';elmMenuBtn=false;}}
		//переименование файлов
		if(event.srcElement.id.indexOf('nameinput')==-1 && event.srcElement.getAttribute('name')!='optionNode' && event.srcElement.getAttribute('name')!='optionNodesBtn'){if(elmRenamItem){elmRenamItem.style.display='none';elmRenamItem=false;}if(elmNameItem){elmNameItem.style.display='block';elmNameItem=false;}}
		//изменение директроии
		//if(event.srcElement.id!="fldrbox" && event.srcElement.getAttribute("name")!="newcurdir"){document.getElementById('fldrbox').style.display='inline-block';document.getElementById('newfldrbox').style.display='none';}
	}
}

function bodyKeyPress(){
	if(event.keyCode==27){	//esc
		if(elmMenuBtn){elmMenuBtn.style.display='block';elmMenuBtn=false;}if(elmContextMenu){elmContextMenu.style.display='none';elmContextMenu=false;}
		if(elmRenamItem){elmRenamItem.style.display='none';elmRenamItem=false;}if(elmNameItem){elmNameItem.style.display='block';elmNameItem=false;}
		document.getElementById('additionalMenu').style.display='none';
		ftView.unselect();
	}
}

function light(elm,act){if(act==1){elm.style.backgroundColor="#0000FF";elm.style.color="#FFFFFF";}else{elm.style.backgroundColor="transparent";elm.style.color="#000000";}}

function editFileFunc(act,param){
	if(act==0){document.getElementById('fileEditCheckbox').checked=param.checked;}
	else if(act==1){document.getElementById('fileEditSave').click();}
	else if(act==2){document.getElementById('fileEditCancel').click();}
}

function minimaze(elm){
	textDiv=elm.parentNode.nextSibling;
	bodyDiv=elm.parentNode.parentNode;
	if(textDiv.style.display=="none"){textDiv.style.display="block";bodyDiv.style.overflow="visible";bodyDiv.style.width="250px";}
	else{textDiv.style.display="none";bodyDiv.style.overflow="hidden";bodyDiv.style.width="15px";}
}


function popupMouseOver(elm){
	elm.firstChild.style.backgroundColor="#EEEEEE";
	elm.className="slideDivShow";
}

function popupMouseOut(elm){
	elm.firstChild.style.backgroundColor="transparent";
	elm.className="slideDivHide";
}
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

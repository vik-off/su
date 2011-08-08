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
	/**** выпадающее меню ****/
	//document.body.onclick=bodyClick;
	//document.body.onkeypress=bodyKeyPress;
	/**** плавающее меню ****/
	//document.body.onscroll=bodyScroll;
	//document.body.onmousemove=bodyMouseMove;
	//document.body.onmouseup=allMouseUp;
	//document.getElementById(sDivId).style.display='block';
	popupX=screen.width-450;
	//document.getElementById(sDivId).style.left=popupX;
//	vScroll=document.body.scrollTop;
	//document.getElementById(sDivId).style.top=popupY+vScroll;
	/*************************/
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

function contextMenu(curelm){
	if(elmMenuBtn){elmMenuBtn.style.display='block';}
	if(elmContextMenu){elmContextMenu.style.display='none';}	
	elmMenuBtn=curelm;	
	elmContextMenu=curelm.previousSibling;
	elmMenuBtn.style.display='none';
	elmContextMenu.style.display='block';
}

function elmOptions(act,param){
	if(elmContextMenu){elmContextMenu.style.display='none';}if(elmMenuBtn){elmMenuBtn.style.display='block';}
	if(elmRenamItem){elmRenamItem.style.display='none';}if(elmNameItem){elmNameItem.style.display='block';}

	if(act=='rename'){
		elmNameItem=document.getElementById('namelink'+param);
		elmRenamItem=document.getElementById('nameform'+param);
		try{elmNameItem.style.display='none';}
		catch(e){alert(e);}
		elmRenamItem.style.display='block';
		document.getElementById('nameinput'+param).select();
		document.getElementById('nameinput'+param).focus();
	}
	else if(act=='href'){location.href=param;}
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

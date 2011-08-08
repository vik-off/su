function showAll(){
	var divArr = document.getElementsByTagName("DIV");
	for(var i = 0; i < divArr.length; i++){if(divArr[i].className == 'subBox'){divArr[i].style.display = 'block';}}
}

function hideAll(){
	var divArr = document.getElementsByTagName("DIV");
	for(var i = 0; i < divArr.length; i++){if(divArr[i].className == 'subBox'){divArr[i].style.display = 'none';}}
}

function toggleSub(elm){
	var b = elm.nextSibling;
	if(b.style.display == "none"){b.style.display = "block";}
	else{b.style.display = "none";}
}
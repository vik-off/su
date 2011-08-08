function sendData(){parent.outFrame.location = "socketBottomFrame?addr="+encodeURIComponent(document.getElementById("addrBox").value);}

function toggle(box){
	var d;
	if(box == 'response'){d = parent.outFrame.document.getElementById('responseHeaders');}
	else if(box == 'request'){d = parent.outFrame.document.getElementById('requestHeaders');}
	if(!d){return;}
	if(d.style.display == 'none'){d.style.display = 'block';}
	else{d.style.display = 'none';}
}

<?

function getVar(&$varname, $defaultVal = '', $type = ''){

	if(!isset($varname))
		return $defaultVal;
	
	if(strlen($type))
		settype($varname, $type);
	
	return $varname;
}

/*------------------------------------------\
|											|
|	   		  -- MSGBOX --					|
|											|
|	Перезагрузка страницы и вывод			|
|	информационных сообщений.				|
|											|
|	nextMsgbox - сохраняет сообщение		|
|	для вывода на следующей странице		|
|											|
|	docreload - перезагружает документ		|
|											|
|	msgbox - выводит сохраненные сообщения	|
|											|
\------------------------------------------*/
$msgboxstack = array();

function nextMsgbox($text,$style = ""){
	$GLOBALS['msgboxstack'][] = array($text,$style);
}

function docreload($text = '', $msgboxText='', $msgboxStyle = ''){
	$get = "";
	if($msgboxText){nextMsgbox($msgboxText, $msgboxStyle);}
	if(count($GLOBALS['msgboxstack'])){$get .= 'msgbox='.urlencode(serialize($GLOBALS['msgboxstack']));}
	if($text){if($get){$get .= '&';} $get .= $text;}
	if($get){$get = '?'.$get;}	
	echo"<script type='text/javascript'>location.href = location.pathname + '".$get."';</script>";
	exit();
}

function msgbox(){
	if($_GET['msgbox']){
		$msgArr = unserialize(stripslashes($_GET['msgbox']));
		foreach($msgArr as $msg){echo"<script type='text/javascript'>msgbox.show('".addslashes($msg[0])."','".$msg[1]."');</script>";}
	}
}

/*--------------------------------------------------\
|													|
|	   		 	 -- АВТОРИЗАЦИЯ --					|
|													|
|	authorization - функция применяется				|
|	для авторизации пользователей. Используется		|
|	до первого вывода данных в браузер				|
|													|
\--------------------------------------------------*/
function authorization(){
  
  	if(!isset($_COOKIE['access'])){$_COOKIE['access'] = 'deny'; /*header("location: ".$_SERVER['SCRIPT_NAME']);*/}

	if(isset($_POST['enteravtorization'])){
		if(md5($_POST['login']) == '16ca8355099ca0a57e9379d9f38e114c' && md5($_POST['pass']) == 'd38968b4c37c3c08674fbef8147c9037'){
			if($_POST['rememberMe'] == 'yes'){setcookie("access","16ca8355099ca0a57e9379d9f38e114c",time()+60*60*24*365*10) or die("ошибка куки");}
			else{setcookie("access","16ca8355099ca0a57e9379d9f38e114c") or die("ошибка куки");}
		}
		header("location: ".$_SERVER['SCRIPT_NAME']);
	}


	/**** ПРОВЕРКА ****/
	$authorized = 'no';
	$error = '';
	if(isset($_COOKIE)){if($_COOKIE['access'] == '16ca8355099ca0a57e9379d9f38e114c'){$authorized = 'complite';}}
	else{$error = '<div style="color:red;margin-bottom:10px;">Для авторизации надо включить куки.</div>';}

	/**** ВЫВОД ФОРМЫ АВТОРИЗАЦИИ ****/
	if($authorized != 'complite'){
		echo
			"<html><head><title>SITE UTILIT</title></head><body>".
			"<form action='".$_SERVER['SCRIPT_NAME']."' method='post' style='margin-top:22%;' align='center'>".
			"<div style='background-color:#EEEEEE;display:inline-block;padding:50px;border:solid 1px #AAAAAA;'>".
				"<h1>SITE UTILIT</h1>".
				/*$error.*/
				"<table border=0 align='center'>".
					"<tr><td>логин</td><td><input type='password' name='login'></td></tr>".
					"<tr><td>пароль</td><td><input type='password' name='pass'></td></tr>".
					"<tr><td></td><td style='padding:5px 0px;'><input type='checkbox' name='rememberMe' value='yes'><span onClick='this.previousSibling.click();' style='cursor:pointer;'> Запомнить меня</span></td></tr>".
					"<tr><td></td><td><input type='submit' name='enteravtorization' value='Войти'></td></tr>".
				"</table>".
			"</div>".
			"</form>".
			"</body></html>"
		;
		exit();
	}
	
	// автоматическая авторизцация
	if(isset($_GET['autoEnter']) && $_GET['autoEnter']=='enable' && $_GET['a']!='' && $_GET['b']!=''){
		
		$autoEnterAccess = false;
		$enterTimeout = false;
		$siteName = 'site_utilit';
		switch($_GET['a']){
			case md5($siteName."1"):$enterTimeout = 1; break;
			case md5($siteName."5"):$enterTimeout = 5; break;
			case md5($siteName."10"):$enterTimeout = 10; break;
			case md5($siteName."20"):$enterTimeout = 20; break;
		}
		if($enterTimeout){$enterTimeout *= 60; for($i=0;$i<=$enterTimeout;$i++){$paramB=md5($siteName.(time()-date("Z")-$i)."YURIJNOVIKOV");if($paramB == $_GET['b']){$autoEnterAccess = true; break;}}}
		if($autoEnterAccess === true){setcookie("access","16ca8355099ca0a57e9379d9f38e114c");}
	}
	//-- выход --//
	if(getVar($_GET['exit']) == 'yes'){setcookie("access",""); header("location: ".$_SERVER['SCRIPT_NAME']);}
}
/*************************************************************************/
	function sizeFormat($byteSize){
		$byteSize=abs($byteSize);
		if($byteSize > 1073741824){$size = number_format($byteSize / 1073741824, 2, ".", " ")."&nbsp;Гб";}
		elseif($byteSize > 1048576){$size = number_format($byteSize / 1048576, 2, ".", " ")."&nbsp;Мб";}
		else{$size = number_format($byteSize / 1024, 2, ".", " ")."&nbsp;кб";}
		return $size;
	}
	function errMsg($text){
		$msg=
			"<table width='100%' border=0><tr>".
			"<td align='left' style='color:red;font-weight:bold;padding:3;'>".$text."</td>".
			"<td align='right'><form action='".$_SERVER['SCRIPT_NAME']."' method='get'>".
			"<input type='hidden' name='curfldr' value='".urlencode(realpath("."))."'><input style='width:40;height:40;' type='submit' name='ok' value='Ok'></form></td>".
			"</tr></table>";
		echo"<script>document.getElementById('slideDivTextBox').style.display='block';document.getElementById('slideDivText1').innerHTML=\"".$msg."\";</script>";
	}
	function clearMsg($text){
		$msg=
			"<table width='100%' border=0><tr>".
			"<td align='left' style='color:#1E9A5A;font-weight:bold;padding:3;'>".$text."</td>".
			"<td align='right'><form action='".$_SERVER['SCRIPT_NAME']."' method='get'>".
			"<input type='hidden' name='curfldr' value='".urlencode(realpath("."))."'><input style='width:40;height:40;' type='submit' name='ok' value='Ok'></form></td>".
			"</tr></table>";
		echo"<script>document.getElementById('slideDivTextBox').style.display='block';document.getElementById('slideDivText1').innerHTML=\"".$msg."\";</script>";
	}
	function confirmMsg($text){echo"<script>document.getElementById('slideDivTextBox').style.display='block';document.getElementById('slideDivText1').innerHTML=\"<div style='color:#0F58B4;font-weight:bold;padding:3;'>".$text."</div>\";</script>";}
	function dataMsg($text){$text=str_replace("\\","\\\\",$text);echo"<script>document.getElementById('slideDivTextBox').style.display='block';document.getElementById('slideDivText0').innerHTML=\"<div style='color:black;padding:3;'>".$text."</div>\";</script>";}

	function reload($param,$hold){
		if($param && $param!=""){$param="&".$param;}
		$msg="location.href=\"".$_SERVER['SCRIPT_NAME']."?curfldr=".urlencode(realpath(".")).$param."\"";
		if($hold){$msg="setTimeout(function(){".$msg."},5000);";}
		$msg="<script>".$msg."</script>";
		echo $msg;
	}
	function DBerrMsg($text,$param=""){
		$msg=
			"<table width='100%' border=0><tr>".
			"<td align='left' style='color:red;font-weight:bold;padding:3;'>".$text."</td>".
			"<td align='right'><form action='".$_SERVER['SCRIPT_NAME']."?".$param."' method='post'>".
			"<input style='width:40;height:40;' type='submit' name='ok' value='Ok'></form></td>".
			"</tr></table>";
		echo"<script>document.getElementById('slideDivTextBox').style.display='block';document.getElementById('slideDivText1').innerHTML=\"".$msg."\";</script>";
	}
	function DBclearMsg($text,$param=""){
		$msg=
			"<table width='100%' border=0><tr>".
			"<td align='left' style='color:#1E9A5A;font-weight:bold;padding:3;'>".$text."</td>".
			"<td align='right'><form action='".$_SERVER['SCRIPT_NAME']."?".$param."' method='post'>".
			"<input style='width:40;height:40;' type='submit' name='ok' value='Ok'></form></td>".
			"</tr></table>";
		echo"<script>document.getElementById('slideDivTextBox').style.display='block';document.getElementById('slideDivText1').innerHTML=\"".$msg."\";</script>";
	}
	function DBreload($param="",$hold=false,$timeOut=3){
		if($param!=""){$param="?".$param;}
		$timeOut*=1000;
		$msg="location.href=\"".$_SERVER['SCRIPT_NAME'].$param."\"";
		if($hold){$msg="setTimeout(function(){".$msg."},".$timeOut.");";}
		$msg="<script>".$msg."</script>";
		echo $msg;
	}
	function yesNoMsg($text,$submit1,$submit2,$isPost){
		if($isPost){$method = "POST";}
		else{$method = "GET";}
		$msg=
			"<form action='".$_SERVER['SCRIPT_NAME']."' method = '".$method."'><table border=0 width='100%'><tr>".
			"<td align='left'>".$text."</td>".
			"<td align='right'><input style='width:40;height:40;margin:1;' type='submit' name='".$submit1."' value='да'>".
			"<input style='width:40;height:40;margin:1;' type='submit' name='".$submit2."' value='нет'></td>".
			"</tr></table></form>";
		echo'<script>document.getElementById("slideDivTextBox").style.display="block";document.getElementById("slideDivText1").innerHTML="'.$msg.'"</script>';
	}
/*--------------------------------------------------\
\--------------------------------------------------*/

function ansi2utf($str){
	return iconv('windows-1251','UTF-8', $str);
}

function utf2ansi($str){
	return iconv('UTF-8','windows-1251', $str);
}
?>
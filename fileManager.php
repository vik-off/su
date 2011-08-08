<?
session_start();
require_once('./data/php/func.php');

authorization();


// директория
	if(isset($_GET['newcurdir']) && is_dir(urldecode($_GET['newcurdir']))){chdir(urldecode($_GET['newcurdir']));}
	elseif(isset($_GET['curfldr']) && is_dir(urldecode($_GET['curfldr']))){chdir(urldecode($_GET['curfldr']));}
	
// скачать файл
if($_GET['loadfile'] != ''){
	$toGet = urldecode($_GET['loadfile']);
	if(file_exists($toGet)){
		header("Content-type: text/plain");
		header("Content-Disposition: attachment; filename=".$toGet);
		readfile($toGet);exit();
	}else{print("Ошибка! невозможно скачать ".$toGet.". Файл не найден.");}
}else{print("Ошибка! Пустое имя файла.");}

echoHead();
echo"<body>";
echoTopRow();

define("OPTIONS_BUTTON","<div onClick='contextMenu(this)' name='optionNodesBtn' style='border:outset 1px #555555;background-color:#A3A3A3;height:11px;overflow:hidden;font-size:9px;color:white;font-weight:bold;cursor:hand;' onMouseOver='this.style.backgroundColor=\"#777777\";' onMouseOut='this.style.backgroundColor=\"#A3A3A3\";this.style.borderStyle=\"outset\";'onMouseDown='this.style.borderStyle=\"inset\"' onMouseUp='this.style.borderStyle=\"outset\"'>опции</div>");

	/******** выполнение операций *********/
// переименовать файл
	if(isset($_GET['renameFile'])){
		if($_GET['newfilename']!=""){
			if(file_exists(urldecode($_GET['oldfilename']))){
				$newFile=urldecode($_GET['newfilename']);
				$oldFile=urldecode($_GET['oldfilename']);
				if($newFile!=$oldFile){
					if(file_exists($newFile)){errMsg("Ошибка! Файл с именем ".$newFile." уже существует.");}
					else{if(@rename($oldFile,$newFile)){clearMsg("Файл <u>".$_GET['oldfilename']."</u> успешно переименован<br>в <u>".$newFile."</u>");reload('',true);}else{errMsg("Невозможно переименовать файл <u>".$newFile."</u>.");}}
				}
			}else{errMsg("Ошибка! Файл <u>".$oldFile."</u> не найден.");}
		}else{errMsg("Имя файла не должно быть путым.");}
	}
//сохранить файл
	if(isset($_POST['saveFile']) && isset($_POST['fileToSave'])){
		if(file_exists(urldecode($_POST['fileToSave']))){
			if($_POST['file_content']!='' || $_POST['canSaveEmpty']=='yes'){
				$f=fopen(urldecode($_POST['fileToSave']),"w+");
				fwrite($f,str_replace("<//text"."area>","</text"."area>",$_POST['file_content']));
				fclose($f);
			}else{errMsg("Ошибка! Невозможно сохранить пустой файл.");}
		}else{errMsg("Ошибка! Файл \"".urldecode($_POST['fileToSave'])."\" не найден.");}
	}
//переместить файл
	if(isset($_GET['pastefile']) && $_GET['pastefile']=='yes'){
		if($_SESSION['copyFile']){
			if(file_exists($_SESSION['copyFile'])){
				if($_GET['todir']){$filepath="./".urldecode($_GET['todir']);}
				else{$filepath=".";}
				if(is_dir($filepath)){copy($_SESSION['copyFile'],$filepath."/".basename($_SESSION['copyFile']));$_SESSION['copyFile']=false;chdir($filepath);}
				else{errMsg("Ошибка! Неверная директория");}
			}else{errMsg("Ошибка! Файл ".$_SESSION['copyFile']." не найден");}
		}
		elseif($_SESSION['cutFile']){
			if(file_exists($_SESSION['cutFile'])){
				if($_GET['todir']){$filepath="./".urldecode($_GET['todir']);}
				else{$filepath=".";}
				if(is_dir($filepath)){rename($_SESSION['cutFile'],$filepath."/".basename($_SESSION['cutFile']));$_SESSION['cutFile']=false;chdir($filepath);}
				else{errMsg("Ошибка! Неверная директория");}
			}else{errMsg("Ошибка! Файл ".$_SESSION['cutFile']." не найден");}
		}
	}
//отменить перемещение
	if(isset($_GET['cancelcut']) && $_GET['cancelcut']=='yes' && isset($_SESSION['cutFile'])){$_SESSION['cutFile']=false;reload('',false);}	
//отменить копирование
	if(isset($_GET['cancelcopy']) && $_GET['cancelcopy']=='yes' && isset($_SESSION['copyFile'])){$_SESSION['copyFile']=false;reload('',false);}
//создать файл
	if(isset($_GET['createnewfile'])){
		$toOverwite=false;$toSkip=false;
		if($_GET['createnewfile']=='overwrite'){if($_GET['overwritefile']){$toOverwite=true;}else{$toSkip=true;}}
		if($_GET['newfilename']!="" && !$toSkip){
			$newFile=urldecode($_GET['newfilename']);
			if(!file_exists($newFile) || $toOverwite){$f=fopen($newFile,"w");fclose($f);clearMsg("Файл <u>".$newFile."</u> успешно создан");reload('',true);}
			else{confirmMsg(
					"<form align='center' action='".$_SERVER['SCRIPT_NAME']."' method='get'>Файл с именем <u>".$newFile."</u> уже существует. Заменить?<br>".
					"<input type='hidden' name='curfldr' value='".urlencode(realpath("."))."'>".
					"<input type='hidden' name='newfilename' value='".$newFile."'>".
					"<input type='hidden' name='createnewfile' value='overwrite'>".
					"<div style='margin-top:10;'><input type='submit' name='cancel' value='Нет'> ".
					"<input type='submit' name='overwritefile' value='Да'></div></form>");
			}
		}elseif(!$toSkip){errMsg("Ошибка! Имя файла не должно быть пустым");}
	}	
//создать каталог
	if(isset($_GET['createnewdir'])){
		if($_GET['newdirname']!=""){
			$newDir=urldecode($_GET['newdirname']);
			if(!is_dir($newDir)){mkdir($newDir);clearMsg("Каталог <u>".$newDir."</u> успешно создан");reload('',true);}
			else{errMsg("Ошибка! Папка с именем <u>".$newDir."</u> уже существует.");}
		}else{errMsg("Ошибка! Имя папки не должно быть пустым");}
	}	
//удалить файл
	if(isset($_GET['deleteFile'])){
		if($_GET['fileToDelete']!=''){
			$toDel=urldecode($_GET['fileToDelete']);
			if(file_exists($toDel)){
				if(unlink($toDel)){clearMsg("Файл <u>".$toDel."</u> уделен");reload('',true);}
				else{errMsg("Ошибка! Не удается удалить \"".$toDel."\". Возможно имеются жесткие ссылки на файл.");}}
			else{errMsg("Ошибка! Файл не найден");}
		}else{errMsg("Ошибка! Имя файла не указано.");}
	}
//удалить каталог
	if(isset($_GET['deleteDir'])){
		if($_GET['dirToDelete']!=''){
			$toDel=urldecode($_GET['dirToDelete']);
			if(is_dir("./".$toDel)){
				if(@rmdir("./".$toDel)){clearMsg("Каталог <u>".$toDel."</u> уделен");reload('',true);}
				else{errMsg("Ошибка! Не удается удалить \"".$toDel."\". Возможно каталог не пуст.");}}
			else{errMsg("Ошибка! Каталог не найден");}
		}
	}
	
/******** вывод на экран *********/
	$showPlace='fileTree';
	$makedir=false;
	$makefile=false;

	if(!isset($_SESSION['cutFile'])){$_SESSION['cutFile']=false;}
	if(!isset($_SESSION['copyFile'])){$_SESSION['copyFile']=false;}
	
	if(isset($_GET['filetree'])){
		switch($_GET['filetree']){
			case 'up'		: chdir("..");reload('',false);break;
			case 'fldrdown'	: if(is_dir("./".urldecode($_GET['fldrname']))){chdir("./".urldecode($_GET['fldrname'])."/");reload('',false);}break;
			case 'showfile'	: $showPlace='fileView';break;
			case 'editfile'	: $showPlace='fileEdit';break;
			case 'cutfile'	: if(file_exists(urldecode($_GET['filename']))){$_SESSION['copyFile']=false;$_SESSION['cutFile']=realpath(urldecode($_GET['filename']));}break;
			case 'copyfile'	: if(file_exists(urldecode($_GET['filename']))){$_SESSION['cutFile']=false;$_SESSION['copyFile']=realpath(urldecode($_GET['filename']));}break;
			case 'makedir'	: $makedir=true;break;
			case 'makefile'	: $makefile=true;break;
			case 'deletefile':if(file_exists(urldecode($_GET['file']))){confirmMsg("<form align='center' action='".$_SERVER['SCRIPT_NAME']."' method='get'>Удалить файл<br><u>".addslashes(realpath('.'))."/".urldecode($_GET['file'])."</u> ?<div style='margin-top:10;'><input type='hidden' name='curfldr' value='".urlencode(realpath("."))."'><input type='hidden' name='fileToDelete' value='".urldecode($_GET['file'])."'><input type='submit' name='deleteFile' value='Да'> <input type='submit' name='Cancel' value='Нет'></div></form>");}break;
			case 'deletedir': if(is_dir(urldecode($_GET['dirname']))){confirmMsg("<form align='center' action='".$_SERVER['SCRIPT_NAME']."' method='get'>Удалить каталог<br><u>".addslashes(realpath('.'))."/".urldecode($_GET['dirname'])."/</u> ?<div style='margin-top:10;'><input type='hidden' name='curfldr' value='".urlencode(realpath("."))."'><input type='hidden' name='dirToDelete' value='".urldecode($_GET['dirname'])."'><input type='submit' name='deleteDir' value='Да'> <input type='submit' name='Cancel' value='Нет'></div></form>");}break;
		}
	}
	
	//вернуться в исходную директорию
	if(isset($_GET['goToParentDirectory']) && $_GET['goToParentDirectory']=='yes'){chdir(".");}
	
	$curfldr="?curfldr=".urlencode(realpath("."));
	
	echo"<script>document.getElementById('slideDivText2').innerHTML=\"<div><a style='font-size:10px;' href='".$curfldr."&filetree=makedir'>создать каталог</a><br><a style='font-size:10px;' href='".$curfldr."&filetree=makefile'>создать файл</a></div>\"</script>";
	if($makedir){confirmMsg("<form action='".$_SERVER['SCRIPT_NAME']."' method='get'>Создать каталог:<div style='margin:5 0;'><input type='text' name='newdirname'></div><input type='hidden' name='curfldr' value='".urlencode(realpath("."))."'> <input type='submit' name='createnewdir' value='Создать'> <input type='submit' name='cancel' value='Отмена'></form>");}
	if($makefile){confirmMsg("<form action='".$_SERVER['SCRIPT_NAME']."' method='get'>Создать файл:<div style='margin:5 0;'><input type='text' name='newfilename'><input type='hidden' name='curfldr' value='".urlencode(realpath("."))."'></div><input type='submit' name='createnewfile' value='Создать'> <input type='submit' name='cancel' value='Отмена'></form>");}
	if($_SESSION['cutFile']){dataMsg("<div align='center' style='background-color:#EEEEEE;padding:5;'>Файл <b>".$_SESSION['cutFile']."</b> ожидает перемещения.<div style='margin:5 0;'><a href='".$curfldr."&cancelcut=yes' style='background-color:#CCCCCC;padding:3;'>отменить</a></div></div>");}
	if($_SESSION['copyFile']){dataMsg("<div align='center' style='background-color:#EEEEEE;padding:5;'>Файл <b>".$_SESSION['copyFile']."</b> ожидает копирования. <div style='margin:5 0;'><a href='".$curfldr."&cancelcopy=yes' style='background-color:#CCCCCC;padding:3;'>отменить</a></div></div>");}
	echo "<div style='margin:10 0;'><u>Адрес:</u> <div id='fldrbox' onMouseDown='changecurdir(this)' style='display:inline-block;border:solid 3px transparent;background-color:#EEEEEE;width:500px;'>".realpath(".")."</div><div id='newfldrbox' style='display:none;'><form action='".$_SERVER['SCRIPT_NAME']."' method='get'><input type='text' name='newcurdir' value='".realpath(".")."' style='width:504px;'><input type='hidden' name='curfldr' value='".realpath(".")."'> <input type='submit' name='go' value='Перейти'></form></div></div>";

	if($showPlace=='fileTree'){
		$tmpDirsArr=array();	$tmpFilesArr=array();		
		$dirsArr=array();		$filesArr=array();
		$idCount=0;
	
	//-- чтение директории --//
		$d=opendir(".");
		while(($elm=readdir($d))!==false){
			if($elm=="." || $elm==".."){continue;}
			if(is_dir($elm)){$tmpDirsArr[]=$elm;}
			else{$tmpFilesArr[]=$elm;}
		}
		closedir($d);
		
	//-- сортировка имен файлов --//
	if(!isset($_SESSION['fileListOrder'])){$_SESSION['fileListOrder']='none';}
	
	if(isset($_GET['fileOrder'])){
		switch($_GET['fileOrder']){
			case "none": $_SESSION['fileListOrder']='none';break;
			case "direct": $_SESSION['fileListOrder']='direct';break;
			case "reverse": $_SESSION['fileListOrder']='reverse';break;
		}
	}
	
	switch($_SESSION['fileListOrder']){
		case "direct":sort($tmpFilesArr);sort($tmpDirsArr);break;
		case "reverse":rsort($tmpFilesArr);rsort($tmpDirsArr);break;
	}
		
	//-- папки --//				
		if(count($tmpDirsArr)>0){
			foreach($tmpDirsArr as $elm){
				$enterRow="
					<div id='namelink".$idCount."'><a style='font-weight:normal;color:black;' href='".$curfldr."&filetree=fldrdown&fldrname=".urlencode($elm)."'><img align='middle' src='data/images/fldr.png'> ".$elm."</a></div>
					<div id='nameform".$idCount."' style='display:none;'><form action='".$_SERVER['SCRIPT_NAME']."' method='get'><input id='nameinput".$idCount."' type='text' name='newfilename' value='".$elm."' size='30'><input type='hidden' name='curfldr' value='".realpath(".")."'><input type='hidden' name='oldfilename' value='".$elm."'></form></div>";
			//контекстное меню
				$optionsRow=
					"<div name='optionNodesBox' class='optList'>".
/* переименовать */		"<div class='opt' name='optionNode' onClick='elmOptions(\"rename\",".$idCount.")' onMouseOver='light(this,1)' onMouseOut='light(this,0)'>переименовать</div>".
/* удалить		 */		"<div class='opt' name='optionNode' onClick='elmOptions(\"href\",\"".$curfldr."&filetree=deletedir&dirname=".urlencode($elm)."\");' onMouseOver='light(this,1)' onMouseOut='light(this,0)'>удалить</div>";
/* вставить		 */	if($_SESSION['cutFile'] || $_SESSION['copyFile']){$optionsRow.="<div class='opt' name='optionNode' onMouseOver='light(this,1)' onMouseOut='light(this,0)' onClick='elmOptions(\"href\",\"".$curfldr."&pastefile=yes&todir=".urlencode($elm)."\")'>вставить</div>";}
				$optionsRow.="</div>".OPTIONS_BUTTON;
				$sizeRow="";
				$dirsArr[]=array($enterRow,$optionsRow,$sizeRow);
				$idCount++;
			}
		}
		//-- файлы --//				
		if(count($tmpFilesArr)>0){
			foreach($tmpFilesArr as $elm){
				$enterRow="
					<div id='namelink".$idCount."'><a style='font-weight:normal;color:black;' href='".$curfldr."&filetree=showfile&filename=".urlencode($elm)."'><img align='middle' src='data/images/file.png'> ".$elm."</a></div>
					<div id='nameform".$idCount."' style='display:none;'><form action='".$_SERVER['SCRIPT_NAME']."' method='get'><input id='nameinput".$idCount."' type='text' name='newfilename' value='".$elm."' size='30'><input type='hidden' name='renameFile' value='yes'><input type='hidden' name='curfldr' value='".realpath(".")."'><input type='hidden' name='oldfilename' value='".$elm."'></form></div>";
				$sizeRow=sizeFormat(filesize($elm));
			//контекстное меню
				$optionsRow=
					"<div name='optionNodesBox' class='optList'>".
/* скачать		 */		"<div class='opt' name='optionNode' onClick='elmOptions(\"href\",\"".$curfldr."&loadfile=".urlencode($elm)."\")' 					onMouseOver='light(this,1)' onMouseOut='light(this,0)'>скачать</div><hr>".
/* переименовать */		"<div class='opt' name='optionNode' onClick='elmOptions(\"rename\",".$idCount.")' 						 							onMouseOver='light(this,1)'onMouseOut='light(this,0)'>переименовать</div><hr>".
/* копировать	 */		"<div class='opt' name='optionNode' onClick='elmOptions(\"href\",\"".$curfldr."&filetree=copyfile&filename=".urlencode($elm)."\")' 	onMouseOver='light(this,1)' onMouseOut='light(this,0)'>копировать</div>".
/* вырезать		 */		"<div class='opt' name='optionNode' onClick='elmOptions(\"href\",\"".$curfldr."&filetree=cutfile&filename=".urlencode($elm)."\")' 	onMouseOver='light(this,1)' onMouseOut='light(this,0)'>вырезать</div><hr>".
/* удалить		 */		"<div class='opt' name='optionNode' onClick='elmOptions(\"href\",\"".$curfldr."&filetree=deletefile&file=".urlencode($elm)."\");' 	onMouseOver='light(this,1)' onMouseOut='light(this,0)'>удалить</div>".
/* редактировать */		"<div class='opt' name='optionNode' onClick='elmOptions(\"href\",\"".$curfldr."&filetree=editfile&filename=".urlencode($elm)."\")' 	onMouseOver='light(this,1)' onMouseOut='light(this,0)'>редактировать</div>".
					"</div>".OPTIONS_BUTTON;
				$filesArr[]=array($enterRow,$optionsRow,$sizeRow);
				$idCount++;
			}
		}
	//-- вывод таблицы на экран --//
		echo"<table id='filesListLeft' border=1><tr><th colspan='2' style='padding:0;'>";
		switch($_SESSION['fileListOrder']){
			case "none": echo"<a href='".$curfldr."&fileOrder=direct' style='color:black;'>имя</a>";break;
			case "direct": echo"<a href='".$curfldr."&fileOrder=reverse' style='color:black;'>&#9660;имя</a>";break;
			case "reverse": echo"<a href='".$curfldr."&fileOrder=none' style='color:black;'>&#9650;имя</a>";break;
		}
		
		echo"</th><th>размер</th></tr><td style='border-right-style:none;'><a href='".$curfldr."&filetree=up'><img align='middle' src='data/images/up.png'></a></td><td align='center' style='border-left-style:none;'><div name='optionNodesBox' class='optList'>";
		if($_SESSION['cutFile'] || $_SESSION['copyFile']){echo"<div class='opt' name='optionNode' onClick='elmOptions(\"href\",\"".$curfldr."&pastefile=yes\")' onMouseOver='light(this,1)' onMouseOut='light(this,0)'>вставить</div><hr>";}
		echo
			"<div class='opt' name='optionNode' onClick='elmOptions(\"href\",\"".$curfldr."&filetree=makedir\")' onMouseOver='light(this,1)' onMouseOut='light(this,0)'>создать каталог</div>".
			"<div class='opt' name='optionNode' onClick='elmOptions(\"href\",\"".$curfldr."&filetree=makefile\")' onMouseOver='light(this,1)' onMouseOut='light(this,0)'>создать файл</div>".
			"</div>".OPTIONS_BUTTON."</td></tr>";
		foreach($dirsArr as $row){echo "<tr><td style='border-right-style:none;'>".$row[0]."</td><td align='center' style='border-left-style:none;'>".$row[1]."</td><td align='right'>".$row[2]."</td></tr>";}
		foreach($filesArr as $row){echo "<tr><td style='border-right-style:none;'>".$row[0]."</td><td align='center' style='border-left-style:none;'>".$row[1]."</td><td align='right'>".$row[2]."</td></tr>";}
		echo"</table>";
	}
	//-- просмотр файла --//
	elseif($showPlace=='fileView'){
		if(is_file(urldecode($_GET['filename']))){
			echo"<p><a href='".$curfldr."'>назад</a></p><p><b>".urldecode($_GET['filename'])."</b></p>";
			$fileArr=file(urldecode($_GET['filename']));
			$outText="";
			foreach($fileArr as $row){$outText.=htmlspecialchars($row)."<br>";}
			echo "<div style='font-family:monospace;background-color:#EEEEEE;padding:5px;border:double 3px #999999;'>".$outText."</div>";
		}
		else{echo"Ошибка. Файл не найден";}
	}
	//-- редактирование файла --//
	elseif($showPlace=='fileEdit'){
		if(is_file(urldecode($_GET['filename']))){
			echo"<p><a href='".$curfldr."'>назад</a></p><p><b>".urldecode($_GET['filename'])."</b></p>";
			$fileArr=file(urldecode($_GET['filename']));
			$fileNumRows=count($fileArr);
			$outText=str_replace("</text"."area>","<//text"."area>",implode($fileArr,""));
			echo"
				<form action='".$_SERVER['SCRIPT_NAME']."".$curfldr."' method='POST'>
				<textarea style='font-family:monospace;' name='file_content' rows='".round($fileNumRows*1.15)."' cols='150'>".$outText."</text"."area>
				<input type='hidden' name='fileToSave' value='".urldecode($_GET['filename'])."'>
				<div><input type='checkbox' id='fileEditCheckbox' name='canSaveEmpty' value='yes'> Разрешить сохранить пустой файл</div> 
				<div style='margin:30;'><input id='fileEditSave' type='submit' name='saveFile' value='Сохранить'> <input id='fileEditCancel' type='submit' name='cancel' value='Отменить'></div>";
		
			dataMsg("<div><input type='checkbox' onClick='editFileFunc(0,this);'> Разрешить сохранить пустой файл</div>".
				"<div align='center' style='margin-top:10;'><button onClick='editFileFunc(1)'>Сохранить</button> <button onClick='editFileFunc(2)'>Отменить</button></div>");
		}
		else{echo"Ошибка. Файл не найден";}
	}

echoFooter();
?>
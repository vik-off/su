<?php

require_once('func.php');

function getDir($path = '.'){

	$fTree = array('dirs' => array(), 'files' => array());

	$d = opendir($path) or die('Ошибка открытия файла');
	while(($elm = readdir($d)) !== false){
		if($elm == "." || $elm == ".."){continue;}
		// $elm = iconv('windows-1251','UTF-8', $elm);
		if(is_dir($elm)){$fTree['dirs'][] = $elm;}
		else{$fTree['files'][] = $elm;}
	}
	closedir($d);
	$f = fopen('1.txt', 'w');
	fwrite($f, print_r($fTree, 1));
	fclose($f);
	return $fTree;
}

function makeJSON($arr){	// {dirs: ['php','css','data'], files: ['index.php', 'data.txt'], curDir: 'D:/AppServ/www/site_utilit/data/php'};
	// print_r($arr); die;
	if(!is_array($arr['dirs'])){die('Передан неверный аргумент. makeJSON');}
	if(!is_array($arr['files'])){die('Передан неверный аргумент. makeJSON');}
	
	// $jsRow = '';
	// $jsDirs = '';
	// $jsFiles = '';
	
	$jsRow = '';
	$jsDirs = array();
	$jsFiles = array();
	
	foreach($arr['dirs'] as $d){$jsDirs[] = '["'.ansi2utf($d).'", ""]';}
	foreach($arr['files'] as $f){$jsFiles[] = '["'.ansi2utf($f).'", "'.sizeFormat(filesize($f)).'"]';}
	$jsRow = '{dirs: ['.implode(',',$jsDirs).'], files: ['.implode(',',$jsFiles).'], curDir: "'.urlencode(ansi2utf(realpath('.'))).'", freeSpace: "'.sizeFormat(disk_free_space(realpath('.'))).'"};';

	// foreach($arr['dirs'] as $d){if($jsDirs){$jsDirs .= ', ';} $jsDirs .= '["'.$d.'", ""]';}
	// foreach($arr['files'] as $f){if($jsFiles){$jsFiles .= ', ';} $jsFiles .= '["'.$f.'", "'.sizeFormat(filesize($f)).'"]';}
	// $jsRow = '{dirs: ['.$jsDirs.'], files: ['.$jsFiles.'], curDir: "'.urlencode(iconv('windows-1251','UTF-8', realpath('.'))).'", freeSpace: "'.sizeFormat(disk_free_space(realpath('.'))).'"};';
	
	// header('Content-Type: text/plain;charset=windows-1251');
	echo $jsRow;
}

if($_POST['act'] == 'showTree'){
	// $curDir = iconv('UTF-8','windows-1251', urldecode(getVar($_POST['curDir'])));
	// $getDir = iconv('UTF-8','windows-1251', urldecode(getVar($_POST['getDir'])));
	$curDir = urldecode(getVar($_POST['curDir']));
	$getDir = urldecode(getVar($_POST['getDir']));
	if(strlen($curDir)){chdir(utf2ansi($curDir)) or die('error in getDir: "'.$curDir.'"');}
	if(strlen($getDir)){chdir(utf2ansi($getDir)) or die('error in getDir: "'.$getDir.'"');}
	
	makeJSON(getDir());
}

if($_POST['act'] == 'copyFile'){
	$from = iconv('UTF-8','windows-1251', urldecode($_POST['dirFrom']));
	$to = iconv('UTF-8','windows-1251', urldecode($_POST['dirTo']));
	$fname = iconv('UTF-8','windows-1251', urldecode($_POST['fname']));
	if(!file_exists($from.DIRECTORY_SEPARATOR.$fname)){echo"02.";exit();}								//файл не найден
	if(file_exists($to.DIRECTORY_SEPARATOR.$fname)){if(getVar($_POST['anyCase']) != 'yes'){echo"03.";exit();}}	//файл с таким именем существует
	if(copy($from.DIRECTORY_SEPARATOR.$fname, $to.DIRECTORY_SEPARATOR.$fname)){echo"01.";}else{echo"04.";}	//ок
}

if($_POST['act'] == 'replaceFile'){
	$from = iconv('UTF-8','windows-1251', urldecode($_POST['dirFrom']));
	$to = iconv('UTF-8','windows-1251', urldecode($_POST['dirTo']));
	$fname = iconv('UTF-8','windows-1251', urldecode($_POST['fname']));
	if(!file_exists($from.DIRECTORY_SEPARATOR.$fname)){echo"02.";exit();}										//файл не найден
	if(file_exists($to.DIRECTORY_SEPARATOR.$fname)){if($_POST['anyCase'] == 'yes'){unlink($to.DIRECTORY_SEPARATOR.$fname);}else{echo"03.";exit();}}	//файл с таким именем существует
	if(rename($from.DIRECTORY_SEPARATOR.$fname, $to.DIRECTORY_SEPARATOR.$fname)){echo"01.";}else{echo"04.";}	//ок
}

if($_POST['act'] == 'delFile'){
	$fpath = iconv('UTF-8','windows-1251', urldecode($_POST['fullpath']));
	if(is_dir($fpath)){if(rmdir($fpath)){echo"01.";}else{echo"03.";}}
	elseif(file_exists($fpath)){if(unlink($fpath)){echo"01.";}else{echo"03.";}}	//ок
	else{echo"02.";exit();}	//файл не найден
}

if($_POST['act'] == 'rename'){
	$path = iconv('UTF-8','windows-1251', urldecode($_POST['path']));
	$oldName = iconv('UTF-8','windows-1251', urldecode($_POST['oldname']));
	$newName = iconv('UTF-8','windows-1251', urldecode($_POST['newname']));
	if(!file_exists($path.DIRECTORY_SEPARATOR.$oldName)){echo"02.";exit();}	//файл не найден
	if(file_exists($path.DIRECTORY_SEPARATOR.$newName)){echo"03.";exit();}	//файл с таким именем существует
	if(rename($path.DIRECTORY_SEPARATOR.$oldName, $path.DIRECTORY_SEPARATOR.$newName)){echo"01.";}else{echo"04.";}	//ок
}

if($_POST['act'] == 'mkdir'){
	$path = iconv('UTF-8','windows-1251', urldecode($_POST['path']));
	$name = iconv('UTF-8','windows-1251', urldecode($_POST['name']));
	if(file_exists($path.DIRECTORY_SEPARATOR.$name)){echo"02.";exit();}	//дитектория уже существует
	if(mkdir($path.DIRECTORY_SEPARATOR.$name)){echo"01.";}else{echo"03.";}	//ок
}

if($_POST['act'] == 'mkfile'){
	$path = iconv('UTF-8','windows-1251', urldecode($_POST['path']));
	$name = iconv('UTF-8','windows-1251', urldecode($_POST['name']));
	if(file_exists($path.DIRECTORY_SEPARATOR.$name)){echo"02.";exit();}	//дитектория уже существует
	if($f = fopen($path.DIRECTORY_SEPARATOR.$name, 'w')){fclose($f);echo"01.";}else{echo"03.";}	//ок
}
?>
<?
if(isset($_GET['loadfile']) && strlen($_GET['loadfile'])){
	
	$toGet = iconv('UTF-8','windows-1251', stripslashes(urldecode($_GET['loadfile'])));

	if(file_exists($toGet)){
		header("Content-type: text/plain");
		header("Content-Disposition: attachment; filename=".iconv('windows-1251','UTF-8', basename($toGet)));
		readfile($toGet);
	}else{echo("Ошибка! невозможно скачать ".$toGet.". Файл не найден.");}
}
?>
<html>
<head>
<title></title>
</head>
<body>
<?
if(isset($_GET['fileView']) && strlen($_GET['fileView'])){
	
	$toGet = iconv('UTF-8','windows-1251', stripslashes(urldecode($_GET['fileView'])));

	if(file_exists($toGet)){
		echo '<pre>'.htmlspecialchars(file_get_contents($toGet)).'</pre>';
	}else{echo("Ошибка! Файл ".$toGet." не найден.");}
}
else{echo"<h2>Файл не найден</h2>";}
?>
</body>
</html>
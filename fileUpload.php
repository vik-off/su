<?
session_start();
require_once('./data/php/func.php');

authorization();

echoHead();
echo"<body>";
echoTopRow();

if(isset($_POST['uploadtoserver'])){
	$okMsgRow = "";
	$errMsgRow = "";
	foreach($_FILES as $upfile){
		if(!$upfile['name']){continue;}
		if(file_exists($upfile['tmp_name'])){
			if(is_dir("./uploads")){if(move_uploaded_file($upfile['tmp_name'],"./uploads/".$upfile['name'])){$okMsgRow.=" <span style='margin-left:15px;'> - <b>".$upfile['name']."</b></span><br>";}else{$errMsgRow.="Ошибка перемещения файла ".$upfile['name'].".<br>";}}
			else{$errMsgRow.="папка 'uploads' не найдена.<br>";}
		}else{$errMsgRow.="Ошибка загрузки файла.<br>";}
	}
	if($okMsgRow){echo"<div style='background-color:#7EFFC3;padding:10px;margin:10px;display:inline-block;'>файлы<br>".$okMsgRow."загружены на сервер в <a href='fileManagerAJAX.php?p=uploads'>uploads</a></div>";}
	if($errMsgRow){echo"<div style='background-color:#FFA5B6;padding:10px;margin:10px;display:inline-block;'>".$errMsgRow."</div>";}
}
?>
	
<form action='<?=$_SERVER['SCRIPT_NAME'];?>' method='post' enctype='multipart/form-data' style='margin:20px;'>
	<div style='margin:25px 0px;'><input type='file' name='uploadedfile1'></div>
	<div style='margin:25px 0px;'><input type='file' name='uploadedfile2'></div>
	<div style='margin:25px 0px;'><input type='file' name='uploadedfile3'></div>
	<div style='margin:25px 0px;'><input type='file' name='uploadedfile4'></div>
	<div style='margin:25px 0px;'><input type='file' name='uploadedfile5'></div>
	<div style='margin:25px 0px;'><input type='submit' name='uploadtoserver' value='Загрузить на сервер'>
</form>

</body>
</html>
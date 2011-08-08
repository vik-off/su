<?
session_start();
require_once('./data/php/func.php');

authorization();

if(isset($_GET['toplace'])){
	switch($_GET['toplace']){
		case 'globals.php': 		header('location: globals.php');exit();
		case 'fileUpload.php':		header('location: fileUpload.php');exit();
		case 'fileManager.php':		header('location: fileManager.php');exit();
		case 'fileManagerAJAX.php':	header('location: fileManagerAJAX.php');exit();
		case 'socketBrowser.php':	header('location: socketBrowser.php');exit();
		case 'sqlManager.php':		header('location: sqlManager.php');exit();
	}
}

echoHead();
?>

<body>

<? echoTopRow();?>
		<div style='background-color:#EEEEEE;border:double 3px #999999;margin:30px 100px;display:inline-block;'>
			<div align='center' style='border-bottom:solid 1px #999999;background-color:#777777;padding:2px 0px;font-size:20px;color:#FFFFFF;font-weight:bold;text-decoration:underline;'>SITE UTILIT</div>
			<div style='padding:10px;'>
				<b>Сервер</b>:<br><?=$_SERVER['SERVER_NAME'];?><br><br>
				<b>IP адрес сервера</b>:<br><?=$_SERVER['SERVER_ADDR'];?><br><br>
				<b>Программное обеспечение сервера</b>:<br><?=$_SERVER['SERVER_SOFTWARE'];?><br><br>
				<b>Администратор сервера</b>:<br><?=$_SERVER['SERVER_ADMIN'];?><br><br><hr><br>
				<b>Ваш текущий IP</b>:<br><?=$_SERVER['REMOTE_ADDR'];?><br><br>
				<b>Ваше программное обеспечение</b>:<br><?=$_SERVER['HTTP_USER_AGENT'];?><br><br>
			</div>
			<div align='center' style='border-top:solid 1px #999999;background-color:#777777;padding:2px 0px;font-size:11px;color:#FFFFFF;font-weight:bold;'>Разработчик: <a style='color:white;' href='mailto:yurijnovikov@gmail.com'>Юрий Новиков</a></div>
		</div>
		
		<div style='margin-left:100px;margin-top:30px;'>
			<h2 align='left' style='font-size:20px;text-decoration:underline;'>Доступные действия</h2>
			<a class='menuRow' href='globals.php'>Глобальные массивы и переменные</a>
			<a class='menuRow' href='fileManager.php'>Файловый менеджер</a>
			<a class='menuRow' href='fileManagerAJAX.php'>Файловый менеджер AJAX</a>
			<a class='menuRow' href='sqlManager.php'>SQL менеджер</a>
			<a class='menuRow' href='fileUpload.php'>Загрузка файлов на сервер</a>
			<a class='menuRow' href='public.php'>Открытая страничка</a>
			<a class='menuRow' href='?exit=yes'>выход</a>
		</div>

<? echoFooter();?>
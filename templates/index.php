<div class="index-infoblock">
	<h1>SITE UTILIT</h1>
	<div class="items">
		<div><b>Сервер</b>:<br><?=$_SERVER['SERVER_NAME'];?></div>
		<div><b>IP адрес сервера</b>:<br><?=$_SERVER['SERVER_ADDR'];?></div>
		<div><b>Программное обеспечение сервера</b>:<br><?=$_SERVER['SERVER_SOFTWARE'];?></div>
		<div><b>Администратор сервера</b>:<br><?=$_SERVER['SERVER_ADMIN'];?></div>
		<div><b>Ваш текущий IP</b>:<br><?=$_SERVER['REMOTE_ADDR'];?></div>
		<div><b>Ваше программное обеспечение</b>:<br><?=$_SERVER['HTTP_USER_AGENT'];?></div>
	</div>
	<div class="footer">Разработчик: <a style='color:white;' href='mailto:yurijnovikov@gmail.com'>Юрий Новиков</a></div>
</div>

<div class="index-menu">
	<h1>Доступные действия</h1>
	<a href="<?= href('globals'); ?>">Глобальные массивы и переменные</a>
	<a href="<?= href('phpinfo'); ?>">phpinfo</a>
	<a href="<?= href('file-manager'); ?>">Файловый менеджер</a>
	<a href='sqlManager.php'>SQL менеджер</a>
	<a href='public.php'>Открытая страничка</a>
	<a href='?exit=yes'>выход</a>
</div>

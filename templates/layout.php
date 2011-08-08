<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title><?= $this->_getHtmlTitle(); ?></title>
	<base href="<?= $this->_getHtmlBaseHref(); ?>" />
	<link rel="stylesheet" href="css/layout.css" type="text/css" />
	<link rel="stylesheet" href="css/content.css" type="text/css" />
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
</head>
<body>
	<div id="topMenuBox">
		<table border=0 width="100%">
		<tr>
			<td width="50"><a href="#" onClick="history.back();return false;">назад</a></td>
			<td>
				<form method="get" action="" style="display:inline">
				<select id="topMenuSelect" name="r" onChange="this.form.submit();">
					<option value="index">Главная страница
					<option value="globals">глобальные массивы и переменные
					<option value="fileManager.php">файловый менеджер
					<option value="fileManagerAJAX.php">файловый менеджер AJAX
					<option value="sqlManager.php">SQL менеджер
					<option value="fileUpload.php">загрузка файлов на сервер
					<option value="socketBrowser.php">сокет браузер
				</select>
				<script type="text/javascript">
				$('.topMenuSelect').val('<?= FrontController::get()->requestMethod; ?>');
				</script>
				 <input type="submit" name="go" value="Перейти">
				</form>
			</td>
			<td width="15">
				<a id="topMenuToggleBtn" onClick="if(\$(\"additionalMenu\").style.display==\"none\"){\$(\"additionalMenu\").style.display=\"block\";}else{\$(\"additionalMenu\").style.display=\"none\";}">&#9660;</a>
				<div id="additionalMenu" style="display:none;position:absolute;border:solid 1px black;width:200px;margin-left:-180px;background-color:#EEEEEE;border:solid 1px #777777;">
					<a class="topMenuOpt" href="?clearSession=all" onClick="this.parentNode.style.display = \"none\";">Очистить текущую сессию</a>
				</div>
			</td>
			<td width="50"><button onClick=\"location.href = "?exit=yes";\">Выход</button></td>
		</tr>
		</table>
	</div>
	<div style="margin:20px 30px;">
		<?= $this->_getHtmlContent(); ?>
	</div>
	
</body>
</html>

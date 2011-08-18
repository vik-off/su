<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title><?= $this->_getHtmlTitle(); ?></title>
	<base href="<?= $this->_getHtmlBaseHref(); ?>" />
	<link rel="stylesheet" href="css/layout.css" type="text/css" />
	<link rel="stylesheet" href="css/content.css" type="text/css" />
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
	<script type="text/javascript" src="http://scripts.vik-off.net/debug.js"></script>
	<script type="text/javascript">
	
		function href(href){
			return 'index-new.php?r=' + href;
		}

		// расширения стандартного объекта Date
		Date.prototype.getYNString = function(type){

			var months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
			var seconds = this.getSeconds();
			var minutes = this.getMinutes();
			seconds = seconds < 10 ? ('0' + seconds) : seconds;
			minutes = minutes < 10 ? ('0' + minutes) : minutes;
			
			switch(type){
				case 'date':return this.getDate() + ' ' + months[this.getMonth()] + ' ' + this.getFullYear();
				case 'time':return this.getHours() + ':' + minutes + ':' + seconds;
				default:return this.getDate() + ' ' + months[this.getMonth()] + ' ' + this.getFullYear() + ' ' + this.getHours() + ':' + minutes + ':' + seconds;
			}
		}
		
		$(function(){
			
			VikDebug.init();
			
			// отлов ajax-ошибок
			$.ajaxSetup({
				error: function(xhr){
					trace(xhr.responseText);
					return true;
				}
			});
		});
	
	</script>
</head>
<body>
	<div id="topMenuBox">
		<table border=0 width="100%">
		<tr>
			<td width="50"><a href="#" onClick="history.back();return false;">назад</a></td>
			<td>
				<form method="get" action="" style="display:inline">
				<select id="top-menu-select" name="r" onChange="this.form.submit();">
					<option value="index">главная страница
					<option value="phpinfo">phpinfo
					<option value="globals">глобальные массивы и переменные
					<option value="file-manager">файловый менеджер
					<option value="sqlManager.php">SQL менеджер
					<option value="fileUpload.php">загрузка файлов на сервер
					<option value="socketBrowser.php">сокет браузер
				</select>
				<script type="text/javascript">
				$('#top-menu-select').val('<?= FrontController::get()->requestMethod; ?>');
				</script>
				 <input type="submit" name="go" value="Перейти">
				</form>
			</td>
			<td width="15">
				<a id="topMenuToggleBtn" onClick="$('#addit-menu').toggle();">&#9660;</a>
				<div id="addit-menu" style="">
					<a href="<?= href('clear-session'); ?>">Очистить текущую сессию</a>
				</div>
				<script type="text/javascript">
				$(function(){
					
					$('#addit-menu a').live('click', function(){
						$('#addit-menu').hide();
					});
					$(window).keypress(function(e){
						if(e.keyCode == 27)
							$('#addit-menu').hide();
					});
				});
				</script>
			</td>
			<td width="50">
				<form class="" action="" method="post">
					<?= FORMCODE; ?>
					<input type="hidden" name="action" value="logout" />
					<input type="submit" value="Выход" />
				</form>
			</td>
		</tr>
		</table>
	</div>
	<div style="margin:20px 30px;">
		<?= $this->_getHtmlContent(); ?>
	</div>
	
</body>
</html>

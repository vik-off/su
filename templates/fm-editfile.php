<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html>
<head>
	<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
	<title>Редактирование файла <?= $filename; ?></title>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
	<script type="text/javascript" src="http://scripts.vik-off.net/debug.js"></script>
	<script type="text/javascript" src="http://jsxedit.googlecode.com/files/xedit.last.js"></script>
	<style type="text/css">
		body{
			margin: 0;
			padding: 0;
		}
		h1{
			font-size: 16px;
			margin: 0;
			padding: 0;
		}
		#save-icon{
			color: #02CC05;
			border: solid 1px #02CC05;
			background-color: #F8FFF7;
			font-size: 13px;
			padding: 2px 10px;
			display: none;
		}
		#wrapper{
			display: block;
			position: absolute;
			overflow: hidden;
			width: 100%;
			height: 100%;
			left: 0px;
			top: 0px;
		}
		#table-wrap{
			border-collapse: collapse;
			width: 100%;
			height: 100%;
		}
		#content-input{
			position: relative;
			width: 99%;
			height: 20em;
			font-family: monospace;
			font-size: 13px;
			background-color: #F5F5F5;
			margin: 0 5px;
			padding: 1px 2px;
			border: solid 1px black;
		}
	</style>
</head>
<body>

	<form id="file-edit-form" action="" method="post">
		<input type="hidden" name="allowDuplication" value="1" />
		<input type="hidden" name="action" value="fm-save-file" />
		<input type="hidden" name="file-name" value="<?= $filename; ?>" />
		
		<div id="wrapper">
			<table id="table-wrap">
			<tr style="height: 30px; vertical-align: middle;">
				<td>
					<div style="position: relative;">
						<h1 style="text-align: center;line-height: 30px;"><?= $filename; ?> </h1>
						<div style="position: absolute; top: 5px; right: 10px;">
							<span id="save-icon">сохранено</span>
							<input type="submit" value="сохранить" />
							<input type="button" value="закрыть" onclick="if(confirm('Выйти без сохранения изменений?')){window.close();}" />
						</div>
					</div>
				</td>
			</tr>
			<tr>
				<td id="content-input-parent">
					<textarea id="content-input" spellcheck="false" name="file-content"><?= $filecontent; ?></textarea>
				</td>
			</tr>
			</table>
		</div>
	</form>
	
	<script type="text/javascript">
		$(function(){
			
			$('#content-input')
				.height($('#content-input-parent').height() - 5)
				.focus();
			
			xedit.setSelectionPos(document.getElementById("content-input"), 0, 0);
			
			function saveFile(){
				
				var data = $('#file-edit-form').serializeArray();
				data.push({
					name: 'allowEmpty',
					value: (/^\s*$/.test($('#content-input').val()) && confirm("сохранить файл пустым? (возможно содержание пробельных символов)")) ? 1 : 0});
				
				// var_dump(data); return false;
				$.post('<?= WWW_ROOT; ?>', data, function(response){
					if(response == 'ok'){
						$('#save-icon').fadeIn('fast').delay(1500).fadeOut('slow');
						// setTimeout(function(){$('#save-icon').fadeOut('slow');}, 1000);
					}else{
						alert('Ошибка!\n' + response);
					}
				})
			}
			
			$('#file-edit-form').submit(function(){
				saveFile();
				return false;
			});
			
			xedit.bind(document.getElementById("content-input"), function (elm){
				 saveFile();
			});
		});
	</script>

</body>
</html>

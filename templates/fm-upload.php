<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title>Загрузка файлов</title>
	<style>
	*{
		padding: 0;
		margin: 0;
		font-size: 12px;
		font-family: arial, sans-serif;
	}
	</style>
	<script type="text/javascript">
	function fillCurDir(panel){
		
		var dir = window.parent.FileManager
			? window.parent.FileManager.curDir['<?=$panel;?>']
			: prompt('Введите папку для загрузки', '<?= realpath('.'); ?>');
			
		document.getElementById('dir-input').value=dir;
		return dir ? true : false;
	}
	function updateParent(){
		if(window.parent.FileManager)
			window.parent.FileManager.reload('<?=$panel;?>');
	}
	
	<? if($message): ?>
		updateParent();
		alert('<?=$message;?>');
	<? endif; ?>
	
	</script>
</head>
<body>
	<form action="" enctype="multipart/form-data" method="post" onsubmit="return fillCurDir('<?=$panel;?>');">
		<?= FORMCODE; ?>
		<input type="hidden" name="action" value="fm-upload" />
		<input type="hidden" name="panel" value="<?=$panel;?>" />
		<input type="hidden" id="dir-input" name="dir" value="" />
		
		<div style="white-space: nowrap;">
			<input type="file" name="files[]" multiple="multiple" style="border: solid 1px #777; padding: 1px 5px; width: 200px;" />
			<input type="submit" value="Загрузить" style="border: solid 1px #777; padding: 1px 5px;" />
			[MAX: <?= ini_get('upload_max_filesize'); ?>]
		</div>
	</form>
</body>
</html>

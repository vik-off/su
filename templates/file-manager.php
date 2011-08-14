	
<table id="fm-wrap" border>
<tr><td colspan="3" class="fm-head-title">Vik-Off - commander</td></tr>
<tr>
	<td colspan="3">
		<table style="width:100%; margin: 1px 0;">
		<tr>
			<td style="width:150px;"><input id="btn-fast-mode" type="checkbox" onclick="FileManager.fastMoveToggle(this);"> <label for="btn-fast-mode">Быстрая навигация</label></td>
			<td style="width:20px;"><a class="fm-opt-icon" href="#" onclick="FileManager.optMkdir();return false;"><img alt="cd" title="Создать папку" src="data/images/createDir.png"></a></td>
			<td style="width:20px;"><a class="fm-opt-icon" href="#" onclick="FileManager.optMkfile();return false;"><img alt="cf" title="Создать файл" src="data/images/createFile.png"></a></td>
			<td></td>
			<td style="width:60px;text-align:center;"><img id="loadingImg" style="display:none;" src="data/images/load.gif"></td>
		</tr>
		</table>
		<table class="fm-file-options">
		<tr>
			<td><a onclick="FileManager.reload();">Обновить</a></td>
			<td><a>Редакторовать</a></td>
			<td><a onclick="FileManager.optLoad();">Скачать</a></td>
			<td><a onclick="FileManager.optRename();">Переименовать</a></td>
			<td><a onclick="FileManager.optCopy();">Копировать</a></td>
			<td><a onclick="FileManager.optReplace();">Переместить</a></td>
			<td><a onclick="FileManager.optDelFile();">Удалить</a></td>
		</tr>
		</table>
	</td>
</tr>
<tr>
	<td><input id="fm-addr-left" type="text" onKeyPress="if(event.keyCode == 13){FileManager.jump(this.value, 1);}"></td>
	<td></td>
	<td><input id="fm-addr-right" type="text" onKeyPress="if(event.keyCode == 13){FileManager.jump(this.value, 2);}"></td>
</tr>
<tr valign="top">
	<td class="fm-col-box">
		<div>
			<table id="fm-left-col" class="fm-col" border=0 align="left">
				<thead><tr onclick="FileManager.activateCol('left');"><th>Имя</th><th>Размер</th></tr></thead>
				<tbody id="fm-left-col-tbody"></tbody>
			</table>
		</div>
	</td>
	<td></td>
	<td class="fm-col-box">
		<div>
			<table id="fm-right-col" class="fm-col" border=0 align="left">
				<thead><tr onclick="FileManager.activateCol('right');"><th>Имя</th><th>Размер</th></tr></thead>
				<tbody id="fm-right-col-tbody"></tbody>
			</table>
		</div>
	</td>
</tr><tr>
	<td colspan="3">
		<div id="fm-status-bar" style="margin: 7px;"></div>
		<div id="fm-log-title">Действия</div>
		<div id="fm-log-body"></div>
	</td>
</tr></table>

<script type="text/javascript" src="js/file-manager.js"></script>
<script type="text/javascript">
$(function(){
	FileManager.init("<?=addslashes(realpath(".").DIRECTORY_SEPARATOR.getVar($_GET["p"]));?>");
});
</script>
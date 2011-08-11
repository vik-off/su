	
<table id="fm-wrap" border>
<tr><td colspan="3" class="fm-head-title">Vik-Off - commander</td></tr>
<tr>
	<td colspan="3">
		<table style="width:100%; margin: 1px 0;">
		<tr>
			<td style="width:150px;"><input id="btn-fast-mode" type="checkbox" onclick="fileTree.fastMoveToggle(this);"> <label for="btn-fast-mode">Быстрая навигация</label></td>
			<td style="width:20px;"><a class="fm-opt-icon" href="#" onclick="fileTree.optMkdir();return false;"><img alt="cd" title="Создать папку" src="data/images/createDir.png"></a></td>
			<td style="width:20px;"><a class="fm-opt-icon" href="#" onclick="fileTree.optMkfile();return false;"><img alt="cf" title="Создать файл" src="data/images/createFile.png"></a></td>
			<td></td>
			<td style="width:60px;text-align:center;"><img id="loadingImg" style="display:none;" src="data/images/load.gif"></td>
		</tr>
		</table>
		<table class="fm-file-options">
		<tr>
			<td><a onclick="fileTree.reload();">Обновить</a></td>
			<td><a>Редакторовать</a></td>
			<td><a onclick="fileTree.optLoad();">Скачать</a></td>
			<td><a onclick="fileTree.optRename();">Переименовать</a></td>
			<td><a onclick="fileTree.optCopy();">Копировать</a></td>
			<td><a onclick="fileTree.optReplace();">Переместить</a></td>
			<td><a onclick="fileTree.optDelFile();">Удалить</a></td>
		</tr>
		</table>
	</td>
</tr>
<tr>
	<td><input id="fm-addr-left" type="text" onKeyPress="if(event.keyCode == 13){fileTree.jump(this.value, 1);}"></td>
	<td></td>
	<td><input id="fm-addr-right" type="text" onKeyPress="if(event.keyCode == 13){fileTree.jump(this.value, 2);}"></td>
</tr>
<tr valign="top">
	<td class="fm-col-box">
		<div>
			<table id="fm-left-col"  border=0 align="left">
			<thead>
			<tr class="fm-col-inactive" onclick="fileTree.unselect();fileTree.activeCol(1);">
				<th>Имя</th>
				<th>Размер</th>
			</tr>
			</thead>
			<tbody>
			<tr>
				<td><a id="fm-left-col-up" class="fm-jlink" href="#"><img alt="up" align="middle" src="data/images/up.png">..</a></td>
				<td></td>
			</tr>
			</tbody>
			</table>
		</div>
	</td>
	<td></td>
	<td class="fm-col-box">
		<div>
			<table id="fm-right-col" border=0 align="left">
			<thead>
			<tr class="fm-col-inactive" onclick="fileTree.unselect();fileTree.activeCol(2);">
				<th>Имя</th>
				<th>Размер</th>
			</tr>
			</thead>
			<tbody>
			<tr>
				<td><a id="fm-right-col-up" class="fm-jlink" href="#"><img alt="up" align="middle" src="data/images/up.png">..</a></td>
				<td></td>
			</tr>
			</tbody>
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

<script type="text/javascript">
$(function(){
	fileTree.init("<?=addslashes(realpath(".").DIRECTORY_SEPARATOR.getVar($_GET["p"]));?>");
});
</script>
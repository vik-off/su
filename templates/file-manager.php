	
<table id="fm-wrap" border>
<tr><td colspan="3" class="fm-head-title">Vik-Off - commander</td></tr>
<tr>
	<td colspan="3">
		<table style="width:100%; margin: 1px 0;">
		<tr>
			<td style="width:150px;"><label><input type="checkbox" onclick="FileManager.fastMoveToggle(this.checked);" checked="checked"> Быстрая навигация</label></td>
			<td style="width:150px;"><label><input type="checkbox" onclick="FileManager.fitHeight(this.checked);" checked="checked"> Подогнать по высоте</label></td>
			<td style="width:20px;"><a class="fm-opt-icon" href="#" onclick="FileManager.optMkdir();return false;"><img alt="cd" title="Создать папку" src="data/images/createDir.png"></a></td>
			<td style="width:20px;"><a class="fm-opt-icon" href="#" onclick="FileManager.optMkfile();return false;"><img alt="cf" title="Создать файл" src="data/images/createFile.png"></a></td>
			<td></td>
			<td style="width:60px;text-align:center;"><img id="load-icon" style="display:none;" src="data/images/load.gif"></td>
		</tr>
		</table>
		<table class="fm-file-options">
		<tr>
			<td><a onclick="FileManager.reload();">Обновить</a></td>
			<td><a>Редакторовать</a></td>
			<td><a href='#' onclick="FileManager.optLoad(); return false;">Скачать</a></td>
			<td><a href='#' onclick="FileManager.actions.rename(); return false;">Переименовать</a></td>
			<td><a href='#' onclick="FileManager.actions.copy(); return false;">Копировать</a></td>
			<td><a href='#' onclick="FileManager.actions.move(); ; return false;">Переместить</a></td>
			<td><a href='#' onclick="FileManager.actions.del(); return false;">Удалить</a></td>
		</tr>
		</table>
	</td>
</tr>
<tr>
	<td><input id="fm-addr-left" type="text" onKeyPress="if(event.keyCode == 13){FileManager.jump(this.value, 'left');}"></td>
	<td></td>
	<td><input id="fm-addr-right" type="text" onKeyPress="if(event.keyCode == 13){FileManager.jump(this.value, 'right');}"></td>
</tr>
<tr valign="top" id="fm-cols-box">
	<td class="fm-col-box fm-left">
		<div class="fm-col-scroller left">
			<table id="fm-left-col" class="fm-col" border=0 align="left">
				<thead>
				<tr class="fm-col-header">
					<th colspan="2">Имя</th>
					<th>Размер</th>
					<th title="дата последнего изменения">Дата изм.</th>
				</tr>
				</thead>
				<tbody id="fm-left-col-tbody"></tbody>
			</table>
		</div>
	</td>
	<td></td>
	<td class="fm-col-box fm-right">
		<div class="fm-col-scroller right">
			<table id="fm-right-col" class="fm-col" border=0 align="left">
				<thead>
				<tr class="fm-col-header">
					<th colspan="2">Имя</th>
					<th>Размер</th>
					<th title="дата последнего изменения">Дата изм.</th>
				</tr>
				</thead>
				<tbody id="fm-right-col-tbody"></tbody>
			</table>
		</div>
	</td>
</tr>
<tr>
	<td id="fm-left-freespace">В каталоге свободно: ...</td>
	<td></td>
	<td id="fm-right-freespace">В каталоге свободно: ...</td>
</tr>
<tr>
	<td><iframe src="<?=href('fm-upload?panel=left');?>" class="fm-upload"></iframe></td>
	<td></td>
	<td><iframe src="<?=href('fm-upload?panel=right');?>" class="fm-upload"></iframe></td>
</tr>
<tr>
	<td colspan="3">
		<div id="fm-status-bar" style="margin: 7px;"></div>
		<div id="fm-log-title">Действия</div>
		<div id="fm-log-body"></div>
	</td>
</tr></table>

<script type="text/javascript" src="js/file-manager.js"></script>
<script type="text/javascript">
$(function(){
	FileManager.init("<?=addslashes(realpath("."));?>");
});
</script>
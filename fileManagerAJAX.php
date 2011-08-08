<?
session_start();
require_once('./data/php/func.php');

authorization();
echoHead();
?>
<body onKeyDown='return bodyKeyDown(event);'>
	
<?echoTopRow();?>
<table style='background-color:#E5E5E5;border:solid 1px #777777;' align='center'><tr>
	<td colspan='3'style='background-color:#508EF5;color:white;font-weight:bold;padding:3px 10px;'>MOISEI4 - commander</td>
</tr><tr>
	<td colspan='3'>
		<table style='width:100%;'><tr>
			<td style='width:150px;'><input type='checkbox' onClick='fileTree.fastMoveToggle(this);'><span onClick='this.previousSibling.click();'> Быстрая навигация</span></td>
			<td style='width:20px;'><a class='optIcon' href='#' onClick='fileTree.optMkdir();return false;'><img alt='cd' title='Создать папку' src='data/images/createDir.png'></a></td>
			<td style='width:20px;'><a class='optIcon' href='#' onClick='fileTree.optMkfile();return false;'><img alt='cf' title='Создать файл' src='data/images/createFile.png'></a></td>
			<td></td>
			<td style='width:60px;text-align:center;'><img id='loadingImg' style='display:none;' src='data/images/load.gif'></td>
		</tr></table>
		<table align='center' style='margin:7px 0px;'><tr>
			<td><a class='optBtn' onClick='fileTree.reload();'>Обновить</a></td>
			<td><a class='optBtn'>Редакторовать</a></td>
			<td><a class='optBtn' onClick='fileTree.optLoad();'>Скачать</a></td>
			<td><a class='optBtn' onClick='fileTree.optRename();'>Переименовать</a></td>
			<td><a class='optBtn' onClick='fileTree.optCopy();'>Копировать</a></td>
			<td><a class='optBtn' onClick='fileTree.optReplace();'>Переместить</a></td>
			<td><a class='optBtn' onClick='fileTree.optDelFile();'>Удалить</a></td>
		</tr></table>
	</td>
</tr><tr>
	<td><input id='addrBoxLeft' type='text' onKeyPress='if(event.keyCode == 13){fileTree.jump(this.value, 1);}'></td>
	<td></td>
	<td><input id='addrBoxRight' type='text' onKeyPress='if(event.keyCode == 13){fileTree.jump(this.value, 2);}'></td>
</tr><tr valign='top'>
	<td class='colBox'><div><table id="leftCol"  border=0 align='left'><thead><tr class='passive' onClick='fileTree.unselect();fileTree.activeCol(1);'><th>Имя</th><th>Размер</th></tr></thead><tbody><tr><td><a id='leftColUp' class='fict' href='#'><img alt='up' align='middle' src='data/images/up.png'>..</a></td><td></td></tr></tbody></table></div></td>
	<td></td>
	<td class='colBox'><div><table id="rightCol" border=0 align='left'><thead><tr class='passive' onClick='fileTree.unselect();fileTree.activeCol(2);'><th>Имя</th><th>Размер</th></tr></thead><tbody><tr><td><a id='rightColUp' class='fict' href='#'><img alt='up' align='middle' src='data/images/up.png'>..</a></td><td></td></tr></tbody></table></div></td>
</tr><tr>
	<td colspan='3'>
		<div id='statusBar' style='margin: 7px;'></div>
		<div style='font-size:10px;padding:0px 10px;background-color:#93C9FF;'>Действия</div>
		<div id='logBox' style='background-color:#FFFFFF;border:solid 1px #777777;border-top-style:none;height:60px;padding:2px 4px;overflow:auto;'></div>
	</td>
</tr></table>
<script type='text/javascript'>
	fileTree.load('<?=addslashes(realpath(".").DIRECTORY_SEPARATOR.getVar($_GET['p']));?>');
</script>

<div align='right'>
230.08&nbsp;кб<br>
170&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;б&nbsp;&nbsp;
</div>
</body>
</html>
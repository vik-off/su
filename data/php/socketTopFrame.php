<?
session_start();
require_once('func.php');

authorization();
echoHead(array('../js/common.js', '../js/socketBrowser.js'), array('../css/common.css', '../css/socketBrowser.css'), true);
?>

<body>
	
<?=echoTopRow('../../');?>

<div>
<table style='width:100%;'><tr>
	<td style='font-size:17px;'>
		<form action="socketBottomFrame.php" target="outFrame" method="post">
			<input type="text" name="addr" value="" />
			<input type="submit" name="" value="Перейти" />
		</form>
		адрес: 
		<input id='addrBox' value='http://' size='70' onKeyPress='if(event.keyCode==13){sendData();}' style='font-size:17px;'>
		<button type='button' onClick='sendData()'>Перейти</button>
	</td>
	<td style='width:350px;text-align:left;'><button onClick='toggle("request");'>Заголовки запроса</button> <button onClick='toggle("response");'>Заголовки ответа</button></td>
</tr></table>
</div>

</body>
</html>

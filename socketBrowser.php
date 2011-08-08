<?
session_start();
require_once('./data/php/func.php');

authorization();
echoHead();
?>

<frameset rows="110,*">
	<frame src="data/php/socketTopFrame.php" name="addrFrame">
	<frame src="data/php/socketBottomFrame.php" name="outFrame">
</frameset>

</html>
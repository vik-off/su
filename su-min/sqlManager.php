<?
session_start();
require_once('./data/php/func.php');

authorization();


if(!isset($_SESSION['su_config']['sql_manager'])){
	$_SESSION['su_config']['sql_manager'] = array(
		'show_navBar' => false,
	);
}
$lConf = $_SESSION['su_config']['sql_manager'];

if($_POST['lConf_edit']){
	foreach($lConf as $k => $v){
		if(isset($_POST[$k]))
			$lConf[$k] = (bool)$_POST[$k];
		else
			$lConf[$k] = false;
	}
	$_SESSION['su_config']['sql_manager'] = $lConf;
}

if(isset($_POST['beforeload_act'])){
	switch($_POST['beforeload_act']){
		
		// сделать дамп базы данных
		case 'make_db_dump':

			include_once('data/php/DB_backup.class.php');
			$dumper = new Mysqldumper($_SESSION['dballowdata']['host'], $_SESSION['dballowdata']['user'], $_SESSION['dballowdata']['password'], $_SESSION['db_name']);
			$dumpstring = &$dumper->createDump();
			if(FALSE !== $dumpstring){
				$today = strtolower(date("d_M_y"));
			    header('Expires: 0');
		        header('Cache-Control: private');
		        header('Pragma: cache');
				header('Content-type: application/download');
				header('Content-Disposition: attachment; filename='.$today.'_db_'.$_SESSION['db_name'].'_backup.sql');
				echo $dumpstring;
				exit();
			}die('Не удалось сделать дамп базы данных');
			break;
		
	}
}

define('ENTER_ERROR', 'невозможно подключиться к базе данных<br><br><a href="?autoenter=yes">автовход</a><br><a href="'.$_SERVER['SCRIPT_NAME'].'">вручную</a>');
define('AUTOENTERFILE', './data/other/mysqlStore.php');

include_once("data/php/DBmanager.php");
$DBmanag = new DBmanager;

$excel_connect = false;

/**** СОЕДИНЕНИЕ С БД ****/
if(is_array($_SESSION['dballowdata'])){
	@mysql_connect($_SESSION['dballowdata']['host'],$_SESSION['dballowdata']['user'],$_SESSION['dballowdata']['password'])or die(ENTER_ERROR);
	$excel_connect='yes';
}
elseif(isset($_POST['enter']) && isset($_POST['db_host']) && isset($_POST['db_user']) && isset($_POST['db_pass'])){
	@mysql_connect($_POST['db_host'],$_POST['db_user'],$_POST['db_pass'])or die(ENTER_ERROR);
	$_SESSION['dballowdata'] = array('host' => $_POST['db_host'],'user' => $_POST['db_user'],'password' => $_POST['db_pass']);
	if($_POST['saveData'] == 'yes'){if(file_exists(AUTOENTERFILE) && is_writable(AUTOENTERFILE)){file_put_contents(AUTOENTERFILE, '<? $mysqlAutoEnterData = \''.base64_encode(serialize($_SESSION['dballowdata'])).'\'; ?>');}}
	$excel_connect = 'yes';
}

if(!$excel_connect){
	
	// автоматическое подключение к БД
	if($_POST['mysql_autoenter']){
		if(!file_exists(AUTOENTERFILE)){
			echo"Файл автоподключения не найден. Подключится к БД можно только <a href='".$_SERVER['SCRIPT_NAME']."'>вручную</a>.";
			exit();
		}
		require_once(AUTOENTERFILE);
		if(!isset($mysqlAutoEnterData)){
			echo"Файл автоподключения поврежден. Подключится к БД можно только <a href='".$_SERVER['SCRIPT_NAME']."'>вручную</a>.";
			exit();
		}
		$connData = unserialize(base64_decode($mysqlAutoEnterData));
		if(!is_array($connData)){
			echo"Файл автоподключения поврежден. Подключится к БД можно только <a href='".$_SERVER['SCRIPT_NAME']."'>вручную</a>.";
			exit();
		}
		
		@mysql_connect($connData['host'], $connData['user'], $connData['password']) or die(ENTER_ERROR);
		$_SESSION['dballowdata'] = $connData;
		$excel_connect = 'yes';
	}
	// подключение к БД вручную
	else{
		echoHead();
		echo"<body>";
		echoTopRow();
		echo"
			<form action='' method='post'><input type='submit' name='mysql_autoenter' value='Автовход'></form><br>
			<form action='' method='post'><table cellpadding=3>
				<tr><td> HOST </td><td> <input type='text' name='db_host'></td></tr>
				<tr><td> USER </td><td> <input type='text' name='db_user'></td></tr>
				<tr><td> PASSWORD </td><td> <input type='password' name='db_pass'></td></tr>
				<tr><td colspan=2><input type='checkbox' name='saveData' value='yes'><span onClick='this.previousSibling.click();' style='cursor:pointer;'> Запомнить данные в случае успешного подключения</span></td></tr>
			</table><br><input type='submit' name='enter' value='Подключиться'></form>
		";
	}
	
}

if(!$excel_connect){exit();}

mysql_query("SET CHARACTER SET UTF8")or die(mysql_error());

/*######## РАБОТА С БД ########*/

// выбор базы данных
if($_GET['db_see']){
	mysql_select_db($_GET['db_see'])or die(mysql_error().ENTER_ERROR);
	$_SESSION['db_name'] = $_GET['db_see'];
}
elseif(isset($_SESSION['db_name'])){
	mysql_select_db($_SESSION['db_name'])or die(mysql_error().ENTER_ERROR);
}

/*######## ДЕЙСТВИЯ ########*/

if(isset($_POST['act'])){
	switch($_POST['act']){
		
	}
}

/*######## ВЫВОД ШАПКИ ########*/

echoHead();
echo"
	<body>
	<div align='center' id='topMessageBox' style='display:none;width:100%;position:fixed;top:0px;'><table style='background-color:#DDDDDD;' border=0><thead></thead><tbody></tbody><tr><td colspan='3' style='font-weight:bold;padding:5px 10px 1px 10px;'>hello world</td></tr><tr><td align='left'><div class='c1'></div><div class='c2'></div><div class='c3'></div><div class='c4'></div></td><td></td><td align='right'><div class='c1'></div><div class='c2'></div><div class='c3'></div><div class='c4'></div></td></tr></tbody></table></div>
";
msgbox();
echoTopRow();
echo "<script type='text/javascript'>addMenuPush(\"Ввести запрос\",\"javascript:queryToggle();\")</script>";


/*######## ОПЦИИ ТАБЛИЦЫ ########*/

$table = isset($_POST['table']) ? $_POST['table'] : false;

if($table){
	switch($_POST['tbl_act']){
		
		// Очистить таблицу
		case 'trunc':
			
			mysql_query('DELETE FROM '.$table)or die(mysql_error());
			docreload('table_see='.$table, "Все записи таблицы <u>".$table."</u> удалены.", 'ok');
			break;
			
		// Переименовать таблицу
		case 'rename':
			
			if(!$_POST['new_name'])
				docreload('table_see='.$table, "Неверное новое имя таблицы.", 'error');
		
			mysql_query("ALTER TABLE ".$table." RENAME ".$_POST['new_name']."")or die(mysql_error());
			docreload('table_see='.$_POST['new_name'], "Таблица <u>".$table."</u> успешно переименована в <u>".$_POST['new_name']."</u>", 'ok');
			break;
		
		// Удалить таблицу
		case 'drop':
			
			mysql_query('DROP TABLE '.$table)or die(mysql_error());
			docreload('', "Таблица <u>".$table."</u> удалена.", 'ok');
			break;
	}
}

// переименовать таблицу
if(isset($_GET['rename_table'])){
	mysql_query("ALTER TABLE ".$_GET['table']." RENAME ".$_GET['new_tbl_name']."")or die(mysql_error());
	docreload('table_see='.$_GET['new_tbl_name'], "Таблица <u>".$_GET['table']."</u> успешно переименована в <u>".$_GET['new_tbl_name']."</u>", 'ok');
}
// сохранение резервной копии (backup)
if($_GET['make_backup'] == 'yes' && $_GET['table']){
	if($bPath = $DBmanag->tblMakeBackup($_GET['table'], $_SESSION['db_name'])){docreload("table_see=".$_GET['table'], "Восстановительная копия таблицы <u>".$_GET['table']."</u> сохранена в файл<div style='font-size:11px;margin-top:5px;font-weight:normal;'>".realpath($bPath)."</div>", "ok");}
	else{docreload("table_see=".$_GET['table'],"Ошибка создания восстановительной копии");}
}
// заполнение таблицы данными из резервной копии
if(isset($_GET['fillTableFromBackup'])){
	//print_r($_GET);
	$tblName=$_GET['table'];
	$bkupFile=urldecode($_GET['backupFile']);
	if($_GET['sameNames']=='no' || $_GET['sameTypes']=='no'){
		echo"<div align='center' style='position:absolute;z-index:1000;left:300;top:300;'><b>";
		if($_GET['sameNames']=='no'){echo "<u>Названия</u>";}
		if($_GET['sameNames']=='no' && $_GET['sameTypes']=='no'){echo" и ";}
		if($_GET['sameTypes']=='no'){echo" <u>типы данных</u>";}
		echo
			" в некоторых полях не совпадают. Все равно продолжить?</b>".
			"<div style='margin-top:10;'><form action='".$_SERVER['SCRIPT_NAME']."' method='get' style='display:inline;'>".
			"<input type='hidden' name='table' value='".$tblName."'>".
			"<input type='hidden' name='backupFile' value='".$bkupFile."'>".
			"<input type='hidden' name='useOwnCols' value='yes'>".
			"<input type='submit' name='fillTableFromBackup' value='Да'></form> ".
			
			"<form action='".$_SERVER['SCRIPT_NAME']."' method='get' style='display:inline;'>".
			"<input type='hidden' name='table_see' value='".$tblName."'>".
			"<input type='submit' name='cancel' value='Нет'></div></div></form>"
		;
	}
	else{
		$path="./".$DBmanag->backupDir."/";
		$ask=mysql_query("SELECT * FROM ".$tblName);
		if(mysql_num_rows==0){
			if(file_exists($path.$bkupFile)){
				if($_GET['useOwnCols']=='yes'){
					$ownCols=true;
					$tblHeadTmp=mysql_list_fields($_SESSION['db_name'],$tblName);
					$num_fields=mysql_num_fields($ask);
					$tblHead=array();
					for($i=0;$i<$num_fields;$i++){$tblHead[]=mysql_field_name($tblHeadTmp,$i);}
					//print_r($tblHead);
				}else{$ownCols=false;}
				$f=fopen($path.$bkupFile,"r");
				fseek($f,43);
				$dataLENtmp=fread($f,12);
				if(preg_match('/^(\d+);( )*$/',$dataLENtmp,$match1)){$dataLEN=$match1[1];}
				else{$error=true;}
				fseek($f,$dataLEN+55);
				$ENDdataLEN=fread($f,12);
				if($dataLENtmp==$ENDdataLEN){
					$addLENtmp=fread($f,12);
					if(preg_match('/^(\d+);( )*$/',$addLENtmp,$match2)){$addLEN=$match2[1];}
					else{$error=true;}
					$addDATA=fread($f,$addLEN);
					$ENDaddLEN=fread($f,12);
					if($ENDaddLEN==$addLENtmp){eval($addDATA);}
					else{$error=true;}
				}else{$error=true;}
				if(!$error){
					fseek($f,55);
					$numFields=count($columnsList);
					$numRows=count($cellsLEN);
					$query="INSERT INTO ".$tblName." (";
					if($ownCols){for($i=0;$i<$num_fields;$i++){if($i>0){$query.=",";}$query.=$tblHead[$i];}}
					else{for($i=0;$i<$numFields;$i++){if($i>0){$query.=",";}$query.=$columnsList[$i][0];}}
					$query.=") VALUES";
					for($i=0;$i<$numRows;$i++){
						if($i>0){$query.=",";}
						$query.="(";
						for($j=0;$j<$numFields;$j++){
							if($j>0){$query.=",";}
							if($cellsLEN[$i][$j]>0){$cellVAL=mysql_real_escape_string(fread($f,$cellsLEN[$i][$j]));}
							else{$cellVAL="";}
							$query.="'".$cellVAL."'";
						}
						$query.=")";
					}
					mysql_query($query)or die(mysql_error());
					foreach($queryDELETE as $row){mysql_query("DELETE FROM ".$tblName." WHERE id='".$row."'")or die(mysql_error());}
					DBclearMsg("Таблица <u>".$tblName."</u> заполнена данными из резервного файла  <u>".$bkupFile."</u> (".$numRows.")строк.","table_see=".$tblName);
					DBreload("table_see=".$tblName,true,6);
				}else{DBerrMsg("Резервная копия повреждена","table_see=".$tblName);}
			}else{DBerrMsg("файл резервного копирования не найден","table_see=".$tblName);}
		}else{DBerrMsg("таблица не пуста","table_see=".$tblName);}
		$table_see=$tblName;
	}
}
// изменить столбец
if(isset($_GET['save_col_data'])){
	if($_GET['col_type']){
		mysql_query("ALTER TABLE ".$_GET['table']." CHANGE ".$_GET['col']." ".$_GET['new_col_name']." ".$_GET['col_type'])or die(mysql_error());
		docreload("table_see=".$_GET['table'], "Столбец <u>".$_GET['col']."</u> успешно переименован в <u>".$_GET['new_col_name']."</u> (".$_GET['col_type'].")", 'ok');
	}else{docreload("edit_col=".$_GET['col']."&table=".$_GET['table'], "необходимо указать тип данных для столбца", "error");}
}
// добавить столбец
if(isset($_GET['save_new_col'])){
	if($_GET['col_type']){
		mysql_query("ALTER TABLE ".$_GET['table']." ADD ".$_GET['new_col_name']." ".$_GET['col_type']." ".$_GET['new_col_position'])or die(mysql_error());
		docreload("table_see=".$_GET['table'], "Столбец <u>".$_GET['new_col_name']."</u> (".$_GET['col_type'].") успешно добавлен в таблицу <u>".$_GET['table']."</u>", 'ok');
	}else{docreload("add_new_col_menu=yes&table=".$_GET['table'], "необходимо указать тип данных для столбца", "error");}
}
// удалить столбец
if(isset($_GET['del_col']) && $_GET['table'] && $_GET['col_name']){
	mysql_query("ALTER TABLE ".$_GET['table']." DROP ".$_GET['col_name'])or die(mysql_error());
	docreload("table_see=".$_GET['table'], "Столбец <u>".$_GET['del_col']."</u> удален из таблицы <u>".$_GET['table']."</u>", 'ok');
}
// выполнить ручной запрос
if(isset($_POST['query_execute']) && $_POST['query']){$DBmanag->handQuery($_POST['query']);}


/*######## ВЫВОД НА ЭКРАН ########*/

// поле ручного запроса на экран
$get_params = "";
foreach($_GET as $k => $v){
	if($k == 'msgbox'){continue;}
	$get_params .= $k."=".$v."&";
}
echo"<div id='queryInputBox' style='position:absolute;top:50px;left:400px;background-color:#EEEEEE;border:solid 1px #CCCCCC;padding:6px 8px;font-weight:bold;display:none;'><form action='".$_SERVER['SCRIPT_NAME']."?".$get_params."' method='POST'>mysql_query(\" <input type='text' name='query' size='50'> \") <input type='submit' name='query_execute' value='do'></form></div>";

echo "
	<div class='body1000Block' style='border: solid 1px #999999; padding: 10px;'>

	<form action='' method='post' style='float: right;'>
		<input type='hidden' name='lConf_edit' value='1'>
		<table>
			<tr><td><input type='checkbox' name='show_navBar' value='1' ".($lConf['show_navBar'] ? 'checked' : '')." onchange='this.form.submit();'></td><td>Раскрывать навигационную панель</td></tr>
		</table>
	</form>
";

// список баз данных на экран
$bd_list_tmp = mysql_list_dbs();
$dbArr = array();
for($i = 0; $i < mysql_num_rows($bd_list_tmp); $i++)
	$dbArr[] = mysql_db_name($bd_list_tmp, $i);

echo
	"<form name='db_form' action='' method='get' class='infoBlock'>".
		"<input type='hidden' name='select_db_list' value=''>".
		"<b>Текущая БД:</b> ".
		"<select name='db_see' style='border:solid 1px #999999;' onChange='document.db_form.select_db_list.value=\"1\";document.db_form.submit();'>".
		(!isset($_SESSION['db_name']) ? "<option value=''> Выберите базу данных... " : "" )
;
foreach($dbArr as $db){echo"<option value='".$db."' ".($db == $_SESSION['db_name'] ? " selected" : "").">".$db;}
echo
		"</select>".
	"</form>".
	(isset($_SESSION['db_name']) ?
	"<form action='' method='post' style='display: inline; margin-left: 10px;'>".
		"<input type='hidden' name='beforeload_act' value='make_db_dump'>".
		"<input type='submit' name='' value='Сделать дамп'>".
	"</form>" : '').
	"<br><br><br>".
	($_GET['select_db_list'] ? "<script>document.db_form.db_see.focus();</script>" : "")
;

// список таблиц
if(isset($_SESSION['db_name'])){
	$ask = mysql_query('SHOW TABLES');
	$tblsNum = mysql_num_rows($ask);
	$tblArr = array();
	for($i = 0; $i < $tblsNum; $i++)
		$tblArr[] = mysql_result($ask, $i, 0);
	
	$curTbl = isset($_GET['table_see']) ? $_GET['table_see'] : (isset($_GET['table']) ? $_GET['table'] : false);

	echo"<form name='tbl_form' action='".$_SERVER['SCRIPT_NAME']."' method='get' class='infoBlock'>".
		"<input type='hidden' name='select_tbl_list' value=''>".
		"<b>Текущая таблица:</b> ".
		"<select name='table_see' style='border:solid 1px #999999;' onChange='document.tbl_form.select_tbl_list.value=\"1\";document.tbl_form.submit();'>".
		($curTbl ? "" : "<option value=''> Выберите таблицу... ")
	;
	foreach($tblArr as $tbl){echo"<option value='".$tbl."'".($curTbl == $tbl ? " selected" : "").">".$tbl;}
	echo
		"</select>".
		"</form><br><br>".
		($_GET['select_tbl_list'] ? "<script>document.tbl_form.table_see.focus();</script>" : "")
	;
}
echo "
	</div>
";

//++++++++ БОКОВАЯ НАВИГАЦИОННАЯ ПАНЕЛЬ +++++++//
echo
	'<a id="navBarOpener" href="#" onclick="NavBar.show(); return false;" style="display: block;">nav</a>'.
	'<div id="navigationBar" style="display: none;">'.
	'<a id="navBarCloser" href="#" onclick="NavBar.hide(); return false;">x</a>'
;
// если выбрана БД, список баз показывать коротко, плюс показывать список таблиц
if(isset($_SESSION['db_name'])){
	echo
		"<form action='' method='get'>".
		"<div class='smallHeader'>Текущая база данных</div><input type='text' value='".$_SESSION['db_name']."' onfocus='this.select();'><br />".
		"<div class='smallHeader'>Все базы данных</div>".
		"<select name='db_see' style='border:solid 1px #999999;' onChange='this.form.submit();' size=8>"
	;
	foreach($dbArr as $db){echo"<option value='".$db."' ".($db == $_SESSION['db_name'] ? " selected" : "").">".$db."</option>";}
	echo
		"</select>".
		"</form><br>".
		"<form action='' method='get'>".
		($curTbl ? "<div class='smallHeader'>Текущая таблица</div><input type='text' value='".$curTbl."' onfocus='this.select();'><br />" : "").
		"<div class='smallHeader'>Все таблицы</div>".
		"<select id='navBarTblList' name='table_see' style='border:solid 1px #999999;' onChange='this.form.submit();' size=10>"
	;
	foreach($tblArr as $tbl){echo"<option value='".$tbl."'".($curTbl == $tbl ? " selected" : "").">".$tbl;}
	echo
		"</select>".
		"</form><br>"
	;
}
// если БД не выбрана, показывать только список баз.
else{
	echo
		"<form action='' method='get'>".
		"<h2>Базы данных</h2>".
		"<select name='db_see' style='border:solid 1px #999999;' onChange='this.form.submit();' size=25>"
	;
	foreach($dbArr as $db){echo"<option value='".$db."'>".$db."</option>";}
	echo
		"</select>".
		"</form>"
	;
}
echo
	'</div>'.
	'<script type="text/javascript">'.
	'NavBar.adjustHeight();'.
	($lConf['show_navBar'] ? 'NavBar.show();' : '').
	'</script>'
;
//++++++++ /БОКОВАЯ НАВИГАЦИОННАЯ ПАНЕЛЬ +++++++//

// таблица на экран
if($_GET['table_see'] || $table_see){
	$table = ($_GET['table_see'] ? $_GET['table_see'] : $table_see);
	
	if($_GET['special_chars']=='convert'){$DBspec_chars = "checked";}else{$DBspec_chars = "";}
	?>
	<div class='body1000Block'>
		<div align='center' style='font-weight:bold;background-color:#EEEEEE;padding:5px 0px; margin:10px 5px 10px;border:solid 1px #BBBBBB;'>
			<span style='font-size:26px; margin-left: 100px;'>
				<?=$table;?>
			</span>
		</div>
		
		<div class='table_actions'>
			
			<form action='' method='GET'>
				<input type='hidden' name='add_new_col_menu' value='yes'>
				<input type='hidden' name='table' value='<?=$table;?>'>
				<input type='submit' name='' value='Добавить столбец'>
			</form>
		
			<form action='' method='POST'>
				<input type='hidden' id='newTableNameBox' name='new_name' value=''>
				<input type='hidden' name='tbl_act' value='rename'>
				<input type='hidden' name='table' value='<?=$table;?>'>
				<input type='button' value='Переименовать' onclick='renameTable("<?=$table;?>");'>
			</form>
		
			<form onsubmit='return confirm("Удалить все записи в таблице?")' action='' method='POST'>
				<input type='hidden' name='tbl_act' value='trunc'>
				<input type='hidden' name='table' value='<?=$table;?>'>
				<input type='submit' name='' value='Очистить'>
			</form>
		
			<form onsubmit='return confirm("Таблица будет полностью удалена. Продолжить?")' action='' method='POST'>
				<input type='hidden' name='tbl_act' value='drop'>
				<input type='hidden' name='table' value='<?=$table;?>'>
				<input type='submit' name='' value='Удалить'>
			</form>
				
		</div>
			
		<form action='' method='get'>
			<input type='checkbox' name='special_chars' value='convert' <?=$DBspec_chars;?> onClick='this.parentNode.submit();'>
			<b onClick='this.previousSibling.click();' style='cursor:pointer;'> htmlspecialchars</b>
			<input type='hidden' name='table_see' value='<?=$table;?>'>
		</form>
		<table><tr align='center'>
			<td><a href='?make_backup=yes&table=<?=$table;?>' style='font-size:11px;' onClick='return confirm("Сделать резервную копию таблицы <?=$table;?>?")'>сделать backup</a></td></tr>
		</table>
	</div>
	<br>
	<?					
	$DBmanag->tableSee($table, $_SESSION['db_name'], $DBspec_chars);
}

// меню 'переименовать таблицу' на экран
if(isset($_GET['tbl_act']) && $_GET['tbl_act']=='rename'){
	echo"<p>Переименовать таблицу <b>".$_GET['table']."</b> в
		<form action='".$_SERVER['SCRIPT_NAME']."' method='get'>
			<input type='text' name='new_tbl_name' value='".$_GET['table']."'>
			<input type='hidden' name='table' value='".$_GET['table']."'>
			<input type='hidden' name='show_all_tables' value='yes'>
			<input type='submit' name='rename_table' value=' Применить '>
		</form>
	";
}
// меню 'удалить стобец' на экран
if(isset($_GET['confirm_del_col']) && $_GET['table']!=''){confirmMsg("<form action='".$_SERVER['SCRIPT_NAME']."' method='get'>Вы действительно хотите удалить столбец <u>".$_GET['confirm_del_col']."</u> и все данные в нем?<input type='hidden' name='col_name' value='".$_GET['confirm_del_col']."'><input type='hidden' name='table' value='".$_GET['table']."'><input type='hidden' name='table_see' value='".$_GET['table']."'><div align='center' style='margin-top:5px;'><input type='submit' name='del_col' value='да'> <input type='submit' name='cancel' value='нет'></div></form>");}

// меню 'изменение столбца' на экран
if(isset($_GET['edit_col'])){
	echo"<div style='margin-top:40px;background-color:#EEEEEE;border:solid 1px #CCCCCC;padding:6px 8px;display:inline-block;'><p>Изменить столбец <b>".$_GET['edit_col']."</b> таблицы <b>".$_GET['table']."</b></p>
		<form action='".$_SERVER['SCRIPT_NAME']."' method='get'>
			<input type='text' name='new_col_name' value='".$_GET['edit_col']."'>
			".$DBmanag->col_types($_GET['colType'])."
			<input type='hidden' name='table' value='".$_GET['table']."'>
			<input type='hidden' name='col' value='".$_GET['edit_col']."'>
			<input type='hidden' name='table_see' value='".$_GET['table']."'>
			<input type='submit' name='save_col_data' value=' Сохранить '>
			<input type='submit' name='cancel_btn' value=' Отмена '>
		</form>
		</div>
	";
}

// меню 'добавление нового столбца' на экран
if(isset($_GET['add_new_col_menu'])){
	echo"<p>Добавить столбец в таблицу <b>".$_GET['table']."</b></p>
		<form action='".$_SERVER['SCRIPT_NAME']."' method='get'>
			<input type='text' name='new_col_name'>
			".$DBmanag->col_types()."
			<select name='new_col_position'>
				<option value=''>в конец
				<option value='FIRST'>в начало
	";			
	if($_SESSION['table_fields_arr']){foreach($_SESSION['table_fields_arr'] as $k=>$v){echo"<option value='AFTER ".$v."'>после ".$v;}}
	echo"
			</select>
			<input type='hidden' name='table' value='".$_GET['table']."'>
			<input type='hidden' name='table_see' value='".$_GET['table']."'>
			<input type='submit' name='save_new_col' value=' Сохранить '>
			<input type='submit' name='cancel_btn' value=' Отмена '>
		</form>
	";
}
// меню 'backup' на экран
if(isset($_GET['confirm_backup']) && isset($_GET['table']) && $_GET['confirm_backup']=='yes' && $_GET['table']!=''){confirmMsg("<form align='center' action='".$_SERVER['SCRIPT_NAME']."' method='get'>Сделать backup таблицы <u>".$_GET['table']."</u>?<input type='hidden' name='table_see' value='".$_GET['table']."'><input type='hidden' name='table' value='".$_GET['table']."'><div style='margin-top:8px;'><input type='submit' name='make_backup' value='Да'> <input type='submit' name='cancel' value='Нет'></div>");}
// список подходящих backup файлов
if(isset($_GET['showBackupsLike'])){
	if($_GET['withFilter']){$DBmanag->getBackupLike($_GET['showBackupsLike'],$_SESSION['db_name'],urldecode($_GET['withFilter']));}
	else{$DBmanag->getBackupLike($_GET['showBackupsLike'],$_SESSION['db_name'],'all');}
}
?>
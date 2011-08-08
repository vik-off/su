<?

class DBmanager{
	var $backupDir;
	var $col_types;
	
	function DBmanager(){
		$this->backupDir='DBbackup';
	}
	function tblMakeBackup($tableName,$dbName){
		$ask=mysql_query("SELECT * FROM $tableName ORDER BY id")or die(mysql_error());
		if(mysql_num_rows($ask)>0){
			
			for($tblData=array();$row=mysql_fetch_assoc($ask);$tblData[$row['id']]=$row);	
			$tblHeadTmp=mysql_list_fields($dbName,$tableName);
			$num_fields=mysql_num_fields($ask);
			mysql_free_result($ask);
			
			$tblHead=array();
			$emptyArr=array();	
			for($i=0;$i<$num_fields;$i++){$fieldNam=mysql_field_name($tblHeadTmp,$i);$tblHead[]=array($fieldNam,mysql_field_type($tblHeadTmp,$i));$emptyArr[$fieldNam]='';}
			$maxVal=1;foreach($tblData as $k=>$v){if($k>$maxVal){$maxVal=$k;}}	
			$rowsToDel=array();
			for($i=1;$i<$maxVal;$i++){if(!$tblData[$i]){$emptyArr['id']=$i;$tblData[$i]=$emptyArr;$rowsToDel[]=$i;}}
			ksort($tblData);			
			$num_rows=count($tblData);
			
			$columnsList='$columnsList='."array(";
			for($i=0;$i<$num_fields;$i++){if($i>0){$columnsList.=",";}$columnsList.='array("'.$tblHead[$i][0].'","'.$tblHead[$i][1].'")';}
			$columnsList.=");";
			
			//$re_parrent=array('/\\\/',"/([^\\\])(')/",'/([^\\\])(")/');
			//$re_replacement=array('$0$0',"$1\\\\$2","$1\\\\$2");
			
			$cellsDATA="";
			$cellsLEN='$cellsLEN='."array(";
			
			for($i=1;$i<=$num_rows;$i++){
				if($i>1){$cellsLEN.=",";}
				for($j=0;$j<$num_fields;$j++){
					if($j==0){$cellsLEN.="array(";}
					else{$cellsLEN.=",";}
					$cellsDATA.=$tblData[$i][$tblHead[$j][0]];
					$cellsLEN.=strlen($tblData[$i][$tblHead[$j][0]]);
					if($j==($num_fields-1)){$cellsLEN.=")";}
				}
			}
			$cellsLEN.=");";
			$dataLEN=strlen($cellsDATA).";";
			
			while(true){if(strlen($dataLEN)==12){break;}elseif(strlen($dataLEN)<12){$dataLEN.=" ";}else{break;}}
						
			$queryDELETE='$queryDELETE='."array(";
			foreach($rowsToDel as $k=>$v){if($k>0){$queryDELETE.=",";}$queryDELETE.=$v;}
			$queryDELETE.=");";
			
			$addLEN=strlen($columnsList.$cellsLEN.$queryDELETE).";";
			
			while(true){if(strlen($addLEN)==12){break;}elseif(strlen($addLEN)<12){$addLEN.=" ";}else{break;}}

			$backupFileName="./".$this->backupDir."/".$tableName."_backup(".date("j-n-Y H-i",(time()-date("Z")+7200)).").mysqlbackup";
			$backupData="### DO NOT CHANGE ANYTHING IN THIS FILE###\n".$dataLEN.$cellsDATA.$dataLEN.$addLEN.$columnsList.$cellsLEN.$queryDELETE.$addLEN;	//strlen: 43+12=55;

			file_put_contents($backupFileName,$backupData);
			return $backupFileName;
		}return false;
	}
	
	function getBackupFiles(){
		$backupsFilesData=array();
		$path="./".$this->backupDir."/";
		$filesArr=scandir($path);
		foreach($filesArr as $curFile){
			if(is_file($path.$curFile) && preg_match('/^(\w+)_backup\((.+)\)\.mysqlbackup/',$curFile,$match0)){
				$f=fopen($path.$curFile,"r");
					fseek($f,43);
					$dataLENtmp=fread($f,12);
					if(preg_match('/^(\d+);( )*$/',$dataLENtmp,$match)){$dataLEN=$match[1];}
					else{$dataLEN=false;}
					
					if($dataLEN){
						fseek($f,$dataLEN+55);
						$DATAendLEN=fread($f,12);
						if($dataLENtmp!=$DATAendLEN){$error=true;}
						
						$addLENtmp=fread($f,12);
						if(preg_match('/^(\d+);( )*$/',$addLENtmp,$match1)){$addLEN=$match1[1];}
						else{$addLEN=false;}
						
						$ADDarrs=fread($f,$addLEN);
						
						$ADDendLEN=fread($f,12);
						fclose($f);
						if($addLENtmp!=$ADDendLEN){$error=true;}
						eval($ADDarrs);
						if(!$error){
							
						}
					}
				if(is_array($columnsList)){$backupsFilesData[]=array($curFile,$match0[2],$match0[1],$columnsList,$cellsLEN);}else{return false;}
			}
		}
		return $backupsFilesData;
	}
	
	function getBackupLike($table,$DBname,$filter){
		$backupArr=$this->getBackupFiles();
		$backupsNum=count($backupArr);
		$ask=mysql_query("SELECT * FROM ".$table)or die(mysql_error());		
		$num_rows=mysql_num_rows($ask);
		if($num_rows==0){
			$num_fields=mysql_num_fields($ask);
			$tblHeadTmp=mysql_list_fields($DBname,$table);
			$tblHead=array();
			
			for($i=0;$i<$num_fields;$i++){$tblHead[]=array(mysql_field_name($tblHeadTmp,$i),mysql_field_type($tblHeadTmp,$i));}
			echo"<hr><div style='margin-top:15;'> Текущая таблица: <a href='?table_see=".$table."'><b>".$table."</b></a></div>";
			
			echo"<table style='margin:10 0;' border=1><tr align='center'>";
			for($i=0;$i<$num_fields;$i++){echo"<th style='padding:5 15;'><b>".$tblHead[$i][0]."</b><hr>".$tblHead[$i][1]."</th>";}
			echo"</tr></table><hr><br><a href='?showBackupsLike=".$table."'>Резервные таблицы:</a>";
			
			for($i=0;$i<$backupsNum;$i++){
				if($filter!='all'){if($backupArr[$i][0]!==$filter){continue;}}
				if(count($backupArr[$i][3])==$num_fields){
					
					if($backupArr[$i][2]==$table){$tName="<span style='color:green;'>".$backupArr[$i][2]."</span>";}else{$tName="<span style='color:red;'>".$backupArr[$i][2]."</span>";}
					echo"<div style='margin-top:5;'>".
						"<a href='?showBackupsLike=".$table."&withFilter=".urlencode($backupArr[$i][0])."'><b>".$tName."</b></a>".
						" <span style='font-size:10px;margin:0 5;'>(".$backupArr[$i][1].")</span>";
					if($filter!='all'){echo"<form action='".$_SERVER['SCRIPT_NAME']."' method='get' style='display:inline;'><input type='submit' name='fillTableFromBackup' value='заполнить'><input type='hidden' name='table' value='".$table."'><input type='hidden' name='backupFile' value='".urlencode($backupArr[$i][0])."'>";}
					echo"</div>";

					echo"<table style='margin:10 0;' border=1><tr align='center'>";
					for($j=0;$j<$num_fields;$j++){
						$colN=$backupArr[$i][3][$j][0];	$sameNames='yes';
						$colT=$backupArr[$i][3][$j][1];	$sameTypes='yes';
						if($colN==$tblHead[$j][0]){$colN="<span style='color:green;'>".$colN."</span>";}else{$sameNames='no';$colN="<span style='color:red;'>".$colN."</span>";}
						if($colT==$tblHead[$j][1]){$colT="<span style='color:green;'>".$colT."</span>";}else{$sameTypes='no';$colT="<span style='color:red;'>".$colT."</span>";}
						echo"<th style='padding:5 15;'>".$colN."<hr>".$colT."</th>";
					}
					echo"</tr><input type='hidden' name='sameNames' value='".$sameNames."'><input type='hidden' name='sameTypes' value='".$sameTypes."'>";
					
					if($filter!='all'){
						$curTbl=false;
						foreach($backupArr as $v){if($v[0]==$filter){$curTbl=$v;break;}}
						if($curTbl!==false){
							$f=fopen("./".$this->backupDir."/".$curTbl[0],"r");
							fseek($f,43);
							$dataLENtmp=fread($f,12);
							settype($dataLENtmp,'integer');
							$cellsDATA=array();
							foreach($curTbl[4] as $num=>$row){for($i=0;$i<$num_fields;$i++){if($row[$i]>0){$cellsDATA[$num][$i]=fread($f,$row[$i]);}}}

							if(($rowsNum=count($cellsDATA))>0){foreach($cellsDATA as $row){echo"<tr align='center'>";for($i=0;$i<$num_fields;$i++){echo"<td>".$row[$i]."</td>";}echo"</tr>";}}
						}
						else{$error=true;}
					}
					echo"</table></form>";
				}
				else{echo"<br>разное число полей (".$backupArr[$i][2].") ".count($backupArr[$i][3])." - ".$num_fields;}
			}
			echo"<hr>";
		}
	}
	
	
	function tableSee($table, $DBname, $spec_chars){
		
		if(!$table || !$DBname)
			return;

		$popup_text='table_see';
		$_SESSION['table_fields_arr']=array();
		
		$ask = mysql_query("SELECT * FROM ".$table)or die(mysql_error());		
		$num_rows = mysql_num_rows($ask);
		$num_fields = mysql_num_fields($ask);
		$tabl_head = mysql_list_fields($DBname,$table);
		$fieldData = array();
		
		for($i = 0; $i < $num_fields; $i++)
			$fieldData[$i] = array(mysql_field_name($tabl_head, $i), mysql_field_type($tabl_head,$i), mysql_field_flags($tabl_head,$i));
			
		for($data = array(); $row = mysql_fetch_assoc($ask); $data[] = $row);	
				
		$output = 
			"<table align='center' border=1 style='border-collapse:collapse; font-size:14; '>".
			"<thead style='position: relative; z-index: -1000;'>".
			"<tr align='center' valign='top'>"
		;			
		for($i = 0; $i < $num_fields; $i++){
			$output .= "
				<th>".$fieldData[$i][0]."<br>
				<hr><div style='font-size:10px;font-weight:normal;'>TYPE [".$fieldData[$i][1]."]<br>FLAG [".str_replace(" ",", ",$fieldData[$i][2])."]</div>
				<a href='?edit_col=".$fieldData[$i][0]."&colType=".$fieldData[$i][1]."&table=".$table."' style='font-size:10px;'>изменить</a>
				<a href='?del_col=yes&col_name=".$fieldData[$i][0]."&table=".$table."' style='font-size:10px;' onClick='return confirm(\"Удалить столбец ".$fieldData[$i][0]."?\")'>удалить</a>
				</th>";
			$_SESSION['table_fields_arr'][]=$fieldData[$i][0];
		}
		$output .= "</tr></thead><tbody>";
		
		foreach($data as $k1 =>$v1){
			$output .= "<tr align='center'>";$i = 0;
			foreach($v1 as $k2=>$v2){
				if($spec_chars == "checked"){$v2 = htmlspecialchars($v2);}
				$output .= "<td title='NAME [".$fieldData[$i][0]."] TYPE [".$fieldData[$i][1]."] FLAG [".str_replace(" ",", ",$fieldData[$i][2])."]'>".$v2."</td>";$i++;
			}
			$output .= "</tr>";
		}
		$output .= "</tbody></table>";
		if($num_rows == 0){$output .= "<div style='margin:40;'><p><b><u>Таблица пуста.</u></b></p><a href='?showBackupsLike=".$table."'>Заполнить таблицу из резервных данных</a>?<div>";}
		
		echo $output;
	}
	function handQuery($query){
		mysql_query(stripslashes($query))or die(mysql_error()."<div onClick='history.go(-1);' style='cursor:hand;'>назад</div>");
		$get_params="";foreach($_GET as $kG=>$vG){$get_params.=$kG."=".$vG."&";}
		echo"<script>location.href='".$_SERVER['SCRIPT_NAME']."?".$get_params."';</script>";
	}
	function col_types($param=""){
			$select=array('int','real','string','blob','date','time','datetime','timestamp');
			switch($param){
				case 'int':			$select['int']="selected";break;
				case 'real':		$select['real']="selected";break;
				case 'string':		$select['varchar']="selected";break;
				case 'blob':		$select['blob']="selected";break;
				case 'date':		$select['date']="selected";break;
				case 'time':		$select['time']="selected";break;
				case 'datetime':	$select['datetime']="selected";break;
				case 'timestamp':	$select['timestamp']="selected";break;
			}
			return"<select name='col_type'>
				<option value=''>
				<optgroup label='целые числа'>
				<option value='TINYINT'>TINYINT (от-128 до 127)
				<option value='SMALLINT'>SMALLINT (от -32 768 до 32 767)
				<option value='MEDIUMINT'>MEDIUMINT (от -8 388 608 до 8 388 607)
				<option value='INT' ".$select['int'].">INT (от -2 147 483 648 до 2 147 483 647)
				<option value='BIGINT'>BIGINT (от -9 223 372 036 854 775 808 до 9 223 372 036 854 775 807)
				</optgroup>
				<optgroup label='дробные числа'>
				<option value='FLOAT'>FLOAT (Число с плавающей точкой небольшой точности)
				<option value='DOUBLE'>DOUBLE (Число с плавающей точкой двойной точности)
				<option value='REAL' ".$select['real'].">REAL (Синоним DOUBLE)
				<option value='DECIMAL'>DECIMAL (Дробное число, хранящееся в виде строки)
				<option value='NUMERIC'>NUMERIC (Синоним DECIMAL)
				</optgroup>
				<optgroup label='символы без учета регистра'>
				<option value='VARCHAR(255)'".$select['varchar'].">VARCHAR (не более 255 символов)
				<option value='TINYTEXT'>TINYTEXT (не более 255 символов)
				<option value='TEXT'>TEXT (не более 65 535 символов)
				<option value='MEDIUMTEXT'>MEDIUMTEXT (не более 16 777 215 символов)
				<option value='LONGTEXT'>LONGTEXT (не более 4 294 967 295 символов)
				</optgroup>
				<optgroup label='символы с учетом регистра'>
				<option value='TINYBLOB'>TINYBLOB (не более 255 символов)
				<option value='BLOB' ".$select['blob'].">BLOB (не более 65 535 символов)
				<option value='MEDIUMBLOB'>MEDIUMBLOB (не более 16 777 215 символов)
				<option value='LONGBLOB'>LONGBLOB (не более 4 294 967 295 символов)
				</optgroup>
				<optgroup label='типы даты и времени'>
				<option value='DATE' ".$select['date'].">DATE (Дата в формате ГГГГ-ММ-ДД)
				<option value='TIME' ".$select['time'].">TIME (Время в формате ЧЧ:ММ:СС)
				<option value='DATETIME' ".$select['datetime'].">DATETIME (Дата и время в формате ГГГГ-ММ-ДД ЧЧ:ММ:СС)
				<option value='TIMESTAMP' ".$select['timestamp'].">TIMESTAMP (ГГГГММДДЧЧММСС)
				</optgroup>
			</select>
		";
	}

}
?>
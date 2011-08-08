<?php

class Mysqldumper{
	
	private $_dbhost;
	private $_dbuser;
	private $_dbpassword;
	private $_dbname;
	private $_dbcharset;

	public function __construct($host, $dbuser, $dbpassword, $dbname, $connection_charset= "utf8"){

		$this->_dbhost = $host;
		$this->_dbuser = $dbuser;
		$this->_dbpassword = $dbpassword;
		$this->_dbname = $dbname;
		$this->_dbcharset = $connection_charset;

		$this->site_name = 'site name';
		$this->full_appname = 'yn_site';
	}

	public function &createDump(){

		$lf = "\n";
		
		mysql_connect($this->_dbhost, $this->_dbuser, $this->_dbpassword)or die(mysql_error());
		mysql_select_db($this->_dbname)or die(mysql_error());
		mysql_query("SET CHARACTER SET ".$this->_dbcharset) or die(mysql_error());
		
		$result = mysql_query("SHOW TABLES")or die(mysql_error());
		$tables = $this->result2Array(0, $result);

		// get 'table create' parts for all tables
		foreach ($tables as $table){
			$result = mysql_query("SHOW CREATE TABLE ".$table);
			$createtable[$table] = $this->result2Array(1, $result);
		}
		// Set header
		$output =  "#".$lf;
		$output .= "# ".addslashes($this->site_name)." Database Dump" . $lf;
		$output .= "# ".$this->full_appname.$lf;
		$output .= "# ".$lf;
		$output .= "# Host: ".$_SERVER['SERVER_NAME'].$lf;
		$output .= "# Generation Time: ".date("M j, Y at H:i").$lf;
		$output .= "# Server version: ".mysql_get_server_info().$lf;
		$output .= "# PHP Version: ".phpversion().$lf;
		$output .= "# Database : ".$this->_dbname.$lf;
		$output .= "#";

		foreach($tables as $tblval){

			$output .= $lf."# --------------------------------------------------------".$lf.$lf;
			$output .= "#".$lf.'# TABLE '.$tblval.''.$lf;
			$output .= "#".$lf.$lf;
			$output .= "DROP TABLE IF EXISTS ".$tblval.";" . $lf;
			$output .= $createtable[$tblval][0].";" . $lf;
			$output .= $lf;
			
			$result = mysql_query("SELECT * FROM ".$tblval."");
			$rows = $this->loadObjectList($result);
			if(count($rows)){
				foreach($rows as $numrow => $row){
					foreach($row as $k => $cell){
						$cell = addslashes($cell);
						$cell = str_replace("\n", '\\r\\n', $cell);
						$cell = str_replace("\r", '', $cell);
						$row[$k] = "'".$cell."'";
					}
					$rows[$numrow] = $lf."\t(".implode(',', $row).")";
				}
				$output .= "INSERT INTO ".$tblval." VALUES ".implode(',', $rows).$lf;
			}
		}
		mysql_close();
		
		return $output;
	}

	function loadObjectList($resource){
		
		for($output = array(); $row = mysql_fetch_row($resource); $output[] = $row);
		mysql_free_result($resource);
		return $output;
	}

	function result2Array($numinarray = 0, $resource){
		
		$output = array();
		while($row = mysql_fetch_row($resource)){
			 $output[] = $row[$numinarray];
		}
		mysql_free_result($resource);
		return $output;
	}
}
?>
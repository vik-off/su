<?

if(!defined('WWW_ROOT'))
	die('access denided (setup file)');

/** ФУНКЦИЯ GETVAR */
function getVar(&$varname, $defaultVal = '', $type = ''){

	if(!isset($varname))
		return $defaultVal;
	
	if(strlen($type))
		settype($varname, $type);
	
	return $varname;
}

function href($href){
	return 'index.php?r='.$href;
}

/** RELOAD */
function reload(){

	$url = 'http://'.$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
	header('location: '.$url);
	exit();
}

/** REDIRECT */
function redirect($href){
	
	header('location: '.href($href));
	exit();
}

// ПОЛУЧИТЬ HTML INPUT СОДЕРЖАЩИЙ FORMCODE
function getFormCodeInput(){

	if(!isset($_SESSION['su']['userFormChecker']))
		$_SESSION['su']['userFormChecker'] = array('current' => 0, 'used' => array());
	
	$_SESSION['su']['userFormChecker']['current']++;
	return '<input type="hidden" name="formCode" value="'.$_SESSION['su']['userFormChecker']['current'].'" />';
}

// ПРОВЕРКА ВАЛИДНОСТИ ФОРМЫ
function checkFormDuplication(){
	
	if(isset($_POST['allowDuplication']))
		return TRUE;
		
	if(!isset($_POST['formCode'])){
		trigger_error('formCode не передан', E_USER_ERROR);
		return FALSE;
	}
	$formcode = (int)$_POST['formCode'];
	
	if(!CHECK_FORM_DUPLICATION)
		return TRUE;
	
	if(!$formcode)
		return FALSE;
		
	if(!isset($_SESSION['userFormChecker']['used']))
		return TRUE;
		
	return !isset($_SESSION['userFormChecker']['used'][$formcode]);
}

// ПОМЕТИТЬ FORMCODE ИСПОЛЬЗОВАННЫМ
function lockFormCode(&$code){

	if(CHECK_FORM_DUPLICATION && !empty($code))
		$_SESSION['userFormChecker']['used'][$code] = 1;
}
	
function sizeFormat($byteSize){
	
	$byteSize=abs($byteSize);
	if($byteSize > 1073741824)
		return number_format($byteSize / 1073741824, 2, ".", " ")."&nbsp;Гб";
	elseif($byteSize > 1048576)
		return number_format($byteSize / 1048576, 2, ".", " ")."&nbsp;Мб";
	else
		return number_format($byteSize / 1024, 2, ".", " ")."&nbsp;кб";
}

function unescape($string){
	 return get_magic_quotes_gpc()
		? stripslashes($string)
		: $string;
}

function strDate($timestamp = null){
	
	if(is_null($timestamp))
		$timestamp = time();
	static $months = array('янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек');
	return date('d ', $timestamp).$months[date('m', $timestamp) - 1].date(' Y H:i:s', $timestamp);
}

	
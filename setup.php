<?

if(!defined('WWW_ROOT'))
	die('access denided (setup file)');

// установить уровень сообщений об ошибках (максимальный)
error_reporting(E_ALL | E_STRICT);
ini_set('display_errors', 1);

require_once('func.php');
require_once('classes/FrontController.class.php');
require_once('classes/Db.class.php');
require_once('classes/Layout.class.php');

// отсеивать дублируемые формы
define('CHECK_FORM_DUPLICATION', 0);

// название сайта
define('CFG_SITE_NAME', 'site-utilit');

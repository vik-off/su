<?

class FrontController extends Controller{
	
	private static $_instance = null;
	
	public $requestMethod = null;
	public $requestParams = array();
	
	public static function get(){
		
		if(is_null(self::$_instance))
			self::$_instance = new FrontController();
		
		return self::$_instance;
	}
	
	public function __construct(){
		
		$this->_checkAuth();
		
		$request = explode('/', getVar($_GET['r']));
		$_rMethod = array_shift($request);
		
		$this->requestMethod = !empty($_rMethod) ? $_rMethod : 'index';
		$this->requestParams = $request;
	}
	
	public function run(){
		
		$this->_checkAction();
		$this->_checkDisplay();
	}
	
	public function ajax(){
		$this->_checkAjax();
	}
	
	private function _checkAuth(){
		
		if(getVar($_POST['action']) == 'login')
			$this->action_login();
		
		if(empty($_SESSION['su']['logged']))
			$this->display_login();
	}
	
	private function _checkAction(){
		
		if(isset($_POST['action']) && checkFormDuplication()){
			
			$action = $_POST['action'];
			$method = $this->getActionMethodName($action);
			
			if(!method_exists($this, $method))
				$this->display_404();
				
			if($this->$method())
				if(!empty($_POST['redirect']))
					redirect($_POST['redirect']);
		}
	}
	
	private function _checkDisplay(){
		
		$method = $this->getDisplayMethodName($this->requestMethod);
		
		if(!method_exists($this, $method))
			$this->display_404($method);
		
		$this->$method($this->requestParams);
	}
	
	private function _checkAjax(){
		
		$method = $this->getAjaxMethodName($this->requestMethod);
		
		if(!method_exists($this, $method))
			$this->display_404();
		
		$this->$method($this->requestParams);
	}
	
	/**
	 * ПОЛУЧИТЬ ИМЯ КЛАССА КОНТРОЛЛЕРА ПО ИДЕНТИФИКАТОРУ
	 * @param string $controllerIdentifier - идентификатор контроллера
	 * @return string|null - имя класса  контроллера или null, если контроллер не найден
	 */
	public static function getControllerClassName($controllerIdentifier){
			
		// если идентификатор контроллера не передан, вернем null
		if(empty($controllerIdentifier))
			return null;
		
		// если идентификатор контроллера содержит недопустимые символы, вернем null
		if(!preg_match('/^[\w\-]$/', $controllerIdentifier))
			return null;
			
		// преобразует строку вида 'any-class-name' в 'AnyClassNameController'
		$controller = str_replace(' ', '', ucwords(str_replace('-', ' ', strtolower($controllerIdentifier)))).'Controller';
		return class_exists($controller) ? $controller : null;
	}
	
	
	/////////////////////
	////// DISPLAY //////
	/////////////////////
	
	public function display_index(){
		
		Layout::get()
			->setContentPhpFile('index.php')
			->render();
	}
	
	public function display_globals(){
		
		Layout::get()
			->setContentPhpFile('globals.php')
			->render();
	}
	
	public function display_phpinfo(){
		
		phpinfo();
		exit;
	}
	
	public function display_file_manager(){
		
		Layout::get()
			->setTitle('Файловый менеджер')
			->setContentPhpFile('file-manager.php')
			->render();
	}
	
	public function display_login(){
		
		Layout::get()->loginPage();
	}
	
	public function display_clear_session(){
		$_SESSION = array();
		redirect('');
	}
	
	public function display_404($method){
		
		if(AJAX_MODE){
			echo 'Страница не найдена ('.$method.')';
		}else{
			Layout::get()
				->setContent('<h1 style="text-align: center;">Страница не найдена</h1> ('.$method.')')
				->render();
		}
		exit;
	}
	
	public function display_fm_openfile(){
		
		$file = getVar($_GET['f']);
		if(!file_exists($file))
			exit('Файл '.$file.' не найден.');
		if(!is_readable($file))
			exit('Невозможно прочитать файл '.$file.'. Нет прав на чтение.');
		
		header('Content-type: text/plain');
		readfile($file);
		exit;
	}
	
	public function display_fm_editfile(){
		
		$filename = getVar($_GET['f']);
		if(!file_exists($filename))
			exit('Файл '.$filename.' не найден.');
		if(!is_readable($filename))
			exit('Невозможно прочитать файл '.$filename.'. Нет прав на чтение.');
			
		$filecontent = file_get_contents($filename);
		include(FS_ROOT.'templates/fm-editfile.php');
	}
	
	public function display_fm_download(){
		
		$file = getVar($_GET['f']);
		if(!file_exists($file))
			exit('Файл '.$file.' не найден.');
		if(!is_readable($file))
			exit('Невозможно прочитать файл '.$file.'. Нет прав на чтение.');
		
		header('Expires: 0');
		header('Cache-Control: private');
		header('Pragma: cache');
		header('Content-type: application/download');
		header('Content-Disposition: attachment; filename='.basename($file));
		readfile($file);
		exit;
	}

	////////////////////
	////// ACTION //////
	////////////////////
	
	public function action_login(){
		
		if (sha1(getVar($_POST['login'])) == '53fb7ec2b04bbeecd8bc0902b217fb0b03165fde' &&
			sha1(getVar($_POST['pass'])) == 'c776f7b86a4701a3e3a94c253901006cf31e6d32'
		){
			$_SESSION['su']['logged'] = 1;
			reload();
		}
	}
	
	public function action_logout(){
		
		$_SESSION['su']['logged'] = 0;
		reload();
	}
	

	////////////////////
	//////  AJAX  //////
	////////////////////
	
	public function ajax_fm_get_tree(){
		
		$data = array('errcode' => 0, 'errmsg' => '', 'curDir' => realpath('.'), 'dirs' => array(), 'files' => array());
		
		$curDir = realpath(unescape(getVar($_GET['dir'])));
		if(substr($curDir, -1) != DIRECTORY_SEPARATOR)
			$curDir .= DIRECTORY_SEPARATOR;
			
		if(!is_dir($curDir)){
			$data['errcode'] = 1;
			$data['errmsg'] = 'Папка "'.$curDir.'" не найдена';
			echo json_encode($data);
			return;
		}
		if(!is_readable($curDir)){
			$data['errcode'] = 2;
			$data['errmsg'] = 'Нет прав на чтение папки';
			echo json_encode($data);
			return;
		}
		
		$data['curDir'] = $curDir;
		
		foreach(scandir($curDir) as $elm){
			if($elm == '.' || $elm == '..')
				continue;
			$fullName = $curDir.'/'.$elm;
			$isDir = is_dir($fullName);
			// $owner = posix_getpwuid(fileowner($fullName));
			$data[$isDir ? 'dirs' : 'files'][] = array(
				'name' => $elm,
				'perms' => substr(sprintf('%o', fileperms($fullName)), -3),
				// 'owner' => $owner['name'],
				'size' => $isDir ? '-' : sizeFormat(filesize($fullName)),
				'emtime' => strDate(filemtime($fullName)),
			);
		}
		
		echo json_encode($data);
		return;
	}
	
}

?>
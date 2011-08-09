<?

class FrontController {
	
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
		
	}
	
	private function _checkAction(){
		
		if(isset($_POST['action']) && checkFormDuplication()){
			
			$action = $_POST['action'];
			$method = self::getActionMethodName($action);
			
			if(!method_exists($this, $method))
				$this->display_404();
				
			if($this->$method())
				if(!empty($_POST['redirect']))
					redirect($_POST['redirect']);
		}
	}
	
	private function _checkDisplay(){
		
		$method = self::getDisplayMethodName($this->requestMethod);
		
		if(!method_exists($this, $method))
			$this->display_404();
		
		$this->$method($this->requestParams);
	}
	
	private function _performAjax(){
		
	}
	
	/**
	 * ПОЛУЧИТЬ ИМЯ КЛАССА КОНТРОЛЛЕРА ПО ИДЕНТИФИКАТОРУ
	 * @param string $controllerIdentifier - идентификатор контроллера
	 * @return string|null - имя класса контроллера или null, если контроллер не найден
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
	
	// ПОЛУЧИТЬ ИМЯ МЕТОДА ОТОБРАЖЕНИЯ ПО ИДЕНТИФИКАТОРУ
	public static function getDisplayMethodName($method){
	
		// преобразует строку вида 'any-Method-name' в 'any_method_name'
		$method = 'display_'.(strlen($method) ? strtolower(str_replace('-', '_', $method)) : 'default');
		return $method;
	}
	
	// ПОЛУЧИТЬ ИМЯ МЕТОДА ДЕЙСТВИЯ ПО ИДЕНТИФИКАТОРУ
	public static function getActionMethodName($method){
	
		// преобразует строку вида 'any-Method-name' в 'any_method_name'
		$method = 'action_'.strtolower(str_replace('-', '_', $method));
		return $method;
	}
	
	// ПОЛУЧИТЬ ИМЯ AJAX МЕТОДА ПО ИДЕНТИФИКАТОРУ
	public static function getAjaxMethodName($method){
	
		// преобразует строку вида 'any-Method-name' в 'any_method_name'
		$method = 'ajax_'.strtolower(str_replace('-', '_', $method));
		return $method;
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
	
	public function display_login(){
		
		Layout::get()
			->render();
	}
	
	public function display_404(){
		
		Layout::get()
			->setContent('<h1 style="text-align: center;">Страница не найдена</h1>')
			->render();
		exit;
	}
	

	////////////////////
	////// ACTION //////
	////////////////////
	
	public function action_login(){
		
	}
	
	public function action_logout(){
		
	}
	
	
}

?>
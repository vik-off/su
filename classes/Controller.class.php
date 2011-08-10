<?

class Controller {
	
	/** ПОЛУЧИТЬ ИМЯ МЕТОДА ДЕЙСТВИЯ ПО ИДЕНТИФИКАТОРУ */
	public function getActionMethodName($method){
	
		// преобразует строку вида 'any-Method-name' в 'any_method_name'
		$method = 'action_'.strtolower(str_replace('-', '_', $method));
		return $method;
	}
	
	/** ПОЛУЧИТЬ ИМЯ МЕТОДА ОТОБРАЖЕНИЯ ПО ИДЕНТИФИКАТОРУ */
	public  function getDisplayMethodName($method){
	
		// преобразует строку вида 'any-Method-name' в 'any_method_name'
		$method = 'display_'.(strlen($method) ? strtolower(str_replace('-', '_', $method)) : 'default');
		return $method;
	}
	
	/** ПОЛУЧИТЬ ИМЯ AJAX МЕТОДА ПО ИДЕНТИФИКАТОРУ */
	public function getAjaxMethodName($method){
	
		// преобразует строку вида 'any-Method-name' в 'any_method_name'
		$method = 'ajax_'.strtolower(str_replace('-', '_', $method));
		return $method;
	}
	
	public function performAction($methodIdentifier, $redirect){
				
		$method = $this->getActionMethodName($methodIdentifier);
			
		if(!method_exists($this, $method))
			throw new Exception('');
		
		if($this->$method($method, $redirect))
			if(!empty($redirect))
				redirect($redirect);
	}
	
	public function peformDispaly($methodIdentifier, $params){
				
		$method = $this->getDisplayMethodName($methodIdentifier);
				
		if(!method_exists($this, $method))
			throw new Exception('');
		
		$this->$method($params);
	}
	
	public function performAjax($method, $params){
				
		$method = $this->getAjaxMethodName($methodIdentifier);
				
		if(!method_exists($this, $method))
			throw new Exception('');
		
		$this->$method($params);
	}

}

?>
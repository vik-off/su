<?
echo '<pre>'; print_r($_POST); die;
if(!isset($_GET['addr']) || $_GET['addr']=="" || $_GET['addr']=="http://"){exit();}

strpos($_GET['addr'],"http://") === false ? $url = "http://".$_GET['addr'] : $url = $_GET['addr'];
$urlArr = parse_url(strip_tags($url));	//sheme=>'http', host=>'google.com.ua', path=>index.php, query=>a=1&b=2;
if(!isset($urlArr['host']) || $urlArr['host'] == ""){echo"пусто"; exit();}

$fc = fsockopen($urlArr['host'], 80)or die("невозможно подключится к серверу!");
$out =
	"GET /".$urlArr['path']." HTTP/1.0\r\n".
	"Host: ".$urlArr['host']."\r\n".
    "User-Agent: Mozilla/5.0 (Windows; U; Windows NT 5.1; ru; rv:1.9.0.6) Gecko/2009011913 Firefox/3.0.6\r\n".
    "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n".
    "Accept-Language: ru,en-us;q=0.7,en;q=0.3\r\n".
    "Accept-Encoding: identity\r\n".
    "Accept-Charset: windows-1251,utf-8;q=0.7,*;q=0.7\r\n".
    "Connection: close\r\n\r\n";

fwrite($fc, $out) or die('Ошибка отправки данных');
$isHead = true;
$heads = "";
$body = "";
while(!feof($fc)){
	$row = fgets($fc);
	if($isHead){if($row == "\n" || $row == "\r\n"){$isHead = false;}else{header($row); $heads .= $row."<br>";}}
	else{$body .= $row;}
}
$body = str_replace("<head>", "<head>\n<base href='http://".$urlArr['host']."/".$urlArr['path']."'>", $body);
$body = str_replace("</body>", "<script>parent.addrFrame.document.getElementById('addrBox').value = '".$url."';</script><div id ='requestHeaders' style='display:none;position:fixed;background-color:#000000;color:#FFFFFF;top:0px;left:0px;padding:10px;font-size:12px;line-height:18px;z-index:10001;'>".nl2br($out)."</div><div id ='responseHeaders' style='display:none;position:fixed;background-color:#000000;color:#FFFFFF;top:0px;right:0px;padding:10px;font-size:12px;line-height:18px;z-index:10000;'>".$heads."</div>\n</body>", $body);
echo $body;

class Proxy{
	
	public function __construct($url){
	
	}
	
	// public function sendHeaders($
}
?>
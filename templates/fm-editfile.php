<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html>
<head>
	<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
	<title>Редактирование файла <?= $filename; ?></title>
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
	<style type="text/css">
		body{
			margin: 0;
			padding: 0;
		}
		h1{
			font-size: 16px;
			margin: 0;
			padding: 0;
		}
		#wrapper{
			display: block;
			position: absolute;
			overflow: hidden;
			width: 100%;
			height: 100%;
			left: 0px;
			top: 0px;
		}
		#table-wrap{
			border-collapse: collapse;
			width: 100%;
			height: 100%;
		}
		#content-input{
			width: 100%;
			height: 20em;
			font-family: monospace;
			background-color: #F5F5F5;
		}
	</style>
</head>
<body>

	<form action="" method="post">
		<div id="wrapper">
			<table id="table-wrap">
			<tr style="height: 30px; vertical-align: middle;">
				<td>
					<div style="float: right; line-height: 30px;">
						<input type="button" value="отмена" onclick="if(confirm('Выйти без сохранения изменений?')){window.close();}" />
						<input type="submit" value="сохранить" />
					</div>
					<h1 style="text-align: center;line-height: 30px;"><?= $filename; ?></h1>
				</td>
			</tr>
			<tr>
				<td id="content-input-parent">
					<textarea id="content-input" spellcheck="false"><?= $filecontent; ?></textarea>
				</td>
			</tr>
			</table>
		</div>
	</form>
	
	<script type="text/javascript">
		$(function(){
			$('#content-input').height($('#content-input-parent').height());
		});
	</script>

</body>
</html>

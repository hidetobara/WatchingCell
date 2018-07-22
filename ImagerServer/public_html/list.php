<?php
ini_set("display_errors", 1); 
error_reporting(E_ALL);

require_once( 'define.php' );

$uri = $_SERVER['REQUEST_URI'];
$cells = explode( '/', $uri );
#var_dump($cells);
$count = count( $cells );
if($count == 4)
{
	$space = $cells[3];
	$paths = glob( DATA_DIR . $space . "/*.jpg" );
	rsort( $paths );
	$list = [];
	foreach($paths as $path)
	{
		$a = pathinfo($path);
		$list[] = $a['basename'];
		if(count($list) > 24) break;
	}
}
else
{
	print "FAIL";
	exit;
}
?>
<html>
<head>
	<title>list of <?= $space ?></title>
</head>
<body>
	<table>
<?php
	foreach($list as $item)
	{
		$url = BASE_URL . 'show/' . $space . '/' . $item;
		printf("<tr><td>%s</td><td><img src='%s' /></td></tr>\n", $item, $url);
	}
?>
	</table>
</body>
</html>

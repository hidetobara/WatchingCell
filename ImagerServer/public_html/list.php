<?php
ini_set("display_errors", 1); 
error_reporting(E_ALL);

require_once( 'define.php' );

$uri = $_SERVER['REQUEST_URI'];
$cells = explode( '?', $uri );
$cells = explode( '/', $cells[0] );
#var_dump($cells);
$count = count( $cells );
if($count == 4)
{
	$interval = 1;
	if(!empty($_GET['interval']) && is_numeric($_GET['interval'])) $interval = (int)$_GET['interval'];
	$space = $cells[3];
	$paths = glob( DATA_DIR . $space . "/*.jpg" );
	rsort( $paths );
	$list = [];
	for($i = 0; $i < 24; $i++)
	{
		if(!isset($paths[$i * $interval])) break;
		$a = pathinfo($paths[$i * $interval]);
		$list[] = $a['basename'];
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

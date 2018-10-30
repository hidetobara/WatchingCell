<?php
require_once( 'define.php' );

$uri = $_SERVER['REQUEST_URI'];
$cells = explode( '/', $uri );
#var_dump($cells);
$count = count( $cells );
$path = DATA_DIR . '/lain.jpg';
if($count == 4)
{
	$paths = glob( DATA_DIR . $cells[3] . "/*.jpg" );
	rsort( $paths );
	$path = $paths[0];
}
else if($count == 5)
{
	$path = DATA_DIR . $cells[3] . "/" . $cells[4];
}
if( !file_exists($path) ){ print "FAIL"; exit; }
#printf($path);exit;
header( 'Content-type: image/jpeg' );
header( 'Content-Length: ' . filesize($path)) ;
readfile( $path );

?>

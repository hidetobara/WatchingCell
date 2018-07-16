<?php
require_once( 'define.php' );

$uri = $_SERVER['REQUEST_URI'];
$cells = explode( '/', $uri );

$count = count( $cells );
$paths = glob( DATA_DIR . $cells[ $count -1 ] . "/*.jpg" );
rsort( $paths );

$path = $paths[0];
if( !file_exists($path) ){ print "FAIL"; exit; }
//printf($path);exit;
header( 'Content-type: image/jpeg' );
header( 'Content-Length: ' . filesize($path)) ;
readfile( $path );

?>

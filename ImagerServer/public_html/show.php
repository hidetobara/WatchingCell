<?php
require_once( 'define.php' );

$uri = $_SERVER['REQUEST_URI'];
$cells = mb_split( '/', $uri );
$count = count( $cells );
$path = DATA_DIR . $cells[ $count -2 ] . '/' . $cells[ $count -1 ];
if( !file_exists($path) ) exit;

header( 'Content-type: image/jpeg' );
header( 'Content-Length: ' . filesize($path)) ;
readfile( $path );
?>

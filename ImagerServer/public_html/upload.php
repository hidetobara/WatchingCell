<?php
require_once( 'define.php' );

$namespace = basename( $_SERVER['REQUEST_URI'], '.php' );
$error = $_FILES['userfile']['error'];
$info = pathinfo( $_FILES['userfile']['name'] );
$filename = $info['basename'];
$ext = $info['extension'];
if( $error || ($ext != 'jpg' && $ext != 'jpeg') )
{
	echo( 'FAIL:' );
	print_r( $_SERVER );
	print_r( $_FILES );
	exit;
}
$from = $_FILES['userfile']['tmp_name'];
$toDir = DATA_DIR . $namespace . '/';
$to = $toDir . $filename;
if( !file_exists($toDir) ) mkdir( $toDir );
//print_r( array($from,$to) );
if( rename( $from, $to ) )
{
	chmod( $to, 0666 );
	echo( 'OK: ' . $namespace . '/' . $filename );
}
else
{
	echo( 'FAIL' );
}
?>

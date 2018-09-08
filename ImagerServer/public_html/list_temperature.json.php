<?php
require_once('define.php');

$sensor = $_GET['sensor'];
if(!is_numeric($sensor))
{
	print("sensor is empty.");
	exit;
}
$dbh = new PDO('mysql:host=localhost;dbname=famtory', DB_USERNAME, DB_PASSWORD);
$sth = $dbh->prepare("SELECT `date`,`temperature` FROM `temperatures` WHERE `sensor_id` = :sensor ORDER BY `id` DESC LIMIT 168");
$sth->bindParam(':sensor', $sensor);
$sth->execute();

$list = [];
foreach($sth as $loop)
{
	$list[] = ['date' => $loop['date'], 'value' => (int)$loop['temperature'] ];
}
$list = array_reverse($list);
print( json_encode($list) );
?>

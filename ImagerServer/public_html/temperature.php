<?php
require_once('define.php');

$sensor = $_GET['sensor'];
$temperature = $_GET['temperature'];
if(!is_numeric($sensor) || !is_numeric($temperature))
{
	print("sensor or temperature is empty.");
	exit;
}
$dbh = new PDO('mysql:host=localhost;dbname=famtory', DB_USERNAME, DB_PASSWORD);
$sth = $dbh->prepare("INSERT INTO temperatures (sensor_id,date,temperature) VALUES(:sensor, :date, :temperature) ON DUPLICATE KEY UPDATE temperature=:temperature");
$sth->bindParam(':sensor', $sensor);
$sth->bindParam(':temperature', $temperature);
$sth->bindParam(':date', date('Y-m-d H:00:00'));
$sth->execute();
print("OK");
?>

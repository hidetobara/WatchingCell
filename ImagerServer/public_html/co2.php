<?php
require_once('define.php');

$sensor = $_GET['sensor'];
$co2 = $_GET['co2'];
if(!is_numeric($sensor) || !is_numeric($co2))
{
	print("sensor or co2 is empty.");
	exit;
}
$dbh = new PDO('mysql:host=localhost;dbname=famtory', DB_USERNAME, DB_PASSWORD);
$sth = $dbh->prepare("INSERT INTO co2s (sensor_id,date,co2) VALUES(:sensor, :date, :co2) ON DUPLICATE KEY UPDATE co2=:co2");
$sth->bindParam(':sensor', $sensor);
$sth->bindParam(':co2', $co2);
$sth->bindParam(':date', date('Y-m-d H:00:00'));
$sth->execute();
print("OK");
?>

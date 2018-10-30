<?php
require_once('define.php');

$sensor = $_GET['sensor'];
$voltage = $_GET['voltage'];
$value = isset($_GET['value']) ? $_GET['value'] : 0;
$value = floor($value * 10) / 10;
if(!is_numeric($sensor) || !is_numeric($voltage))
{
	print("sensor or voltage is empty.");
	exit;
}
$dbh = new PDO('mysql:host=localhost;dbname=famtory', DB_USERNAME, DB_PASSWORD);
$sth = $dbh->prepare("INSERT INTO voltages (sensor_id,date,value,voltage) VALUES(:sensor, :date, :value, :voltage) ON DUPLICATE KEY UPDATE value=:value, voltage=:voltage");
$sth->bindParam(':sensor', $sensor);
$sth->bindParam(':value', $value);
$sth->bindParam(':voltage', $voltage);
$sth->bindParam(':date', date('Y-m-d H:i:00'));
$sth->execute();
print("OK");
?>

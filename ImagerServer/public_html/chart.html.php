<!doctype html>
<html>

<head>
	<title>Temperature and CO2</title>
	<script src="js/Chart.bundle.js"></script>
	<script src="js/jquery-3.3.1.min.js"></script>
	<style>
	canvas{
		-moz-user-select: none;
		-webkit-user-select: none;
		-ms-user-select: none;
	}
	</style>
</head>

<body>
	<div style="width:75%;">
		<canvas id="canvas"></canvas>
	</div>
	<br>
	<script>
		var config = {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						type: 'line',
						label: 'Temperature',
						backgroundColor: 'rgb(255,99,132)',
						borderColor: 'rgb(255,99,132)',
						data: [],
						fill: false,
						yAxisID: 'y-temperature',
					},
					{
						type: 'line',
						label: 'CO2',
						backgroundColor: 'rgb(132,99,255)',
						borderColor: 'rgb(132,99,255)',
						data: [],
						fill: false,
						yAxisID: 'y-co2',
					},
				]
			},
			options: {
				responsive: true,
				title: {
					display: true,
					text: 'Temperature/CO2'
				},
				tooltips: {
					mode: 'index',
					intersect: false,
				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				scales: {
					xAxes:
					[
						{
						display: true,
						scaleLabel: { display: true, labelString: 'Date' }
						}
					],
					yAxes: 
					[
						{
						id: 'y-temperature',
						position: 'left',
						display: true,
						scaleLabel: { display: true, labelString: 'Temp' }
						},
						{
						id: 'y-co2',
						position: 'right',
						scaleLabel: { display: true, labelString: 'CO2' }
						}
					]
				}
			}
		};

		function ChartController (c)
		{
<?php
	$sensor = empty($_GET['sensor']) ? 1 : intval($_GET['sensor']);
?>
			var _sensor = <?= $sensor ?>;
			var _config = c;
			var _co2s = null;
			var _temperatures = null;

			this.initialize = function()
			{
				$.getJSON( "/Imager/list_temperature.json?sensor="+_sensor, function( data ) {
					//console.log(data);
					_temperatures = [];
					for(var i in data)
					{
						var row = data[i];
						_temperatures[row.date] = row.value;
					}
					if(_co2s != null) initializeChart(_temperatures, _co2s);
				});
				$.getJSON( "/Imager/list_co2.json?sensor="+_sensor, function( data ) {
					//console.log(data);
					_co2s = [];
					for(var i in data)
					{
						var row = data[i];
						_co2s[row.date] = row.value;
					}
					if(_temperatures != null) initializeChart(_temperatures, _co2s);
				});
			}
			function initializeChart(temperatures, co2s)
			{
				var list = {};
				for(var i in temperatures) list[i] = 1;
				for(var i in co2s) list[i] = 1;
				var labels = [];
				for(var i in list) labels.push(i);
				labels.sort();
				data0 = [];
				data1 = [];
				for(var i in labels)
				{
					var label = labels[i];
					data0.push( temperatures[label] == null ? 'NaN': temperatures[label] );
					data1.push( co2s[label] == null ? 'NaN': co2s[label] );
				}
				_config.data.labels = labels;
				_config.data.datasets[0].data = data0;
				_config.data.datasets[1].data = data1;
				var ctx = document.getElementById('canvas').getContext('2d');
				window.myLine = new Chart(ctx, _config);
			}

			var _that = this;
			return this;
		};

		var controller = ChartController(config);
		$(controller.initialize);
	</script>
</body>
</html>

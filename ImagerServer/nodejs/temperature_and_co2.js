var Obniz = require("obniz");
var request = require("request");

// Task Kill
setTimeout(function(){ obniz.close(); process.exit(); }, 120*1000);

var obniz = new Obniz("9185-2914");
obniz.onconnect = async function ()
{
	// initialize
	var temperature_sensor = obniz.wired("LM35DZ", {gnd:0, output:1, vcc:2});
	var temperatures = [];
	temperature_sensor.onchange = function(temp){ temperatures.push(temp); };
	var water_sensor = obniz.wired("LM35DZ", {gnd:9, output:10, vcc:11});
	var waters = [];
	water_sensor.onchange = function(temp){ waters.push(temp); }

	var co2_sensor = obniz.uart1;
	var co2s = [];
	co2_sensor.start({tx: 4, rx: 3, baud:9600, bits:8, stop:1, parity:"off", flowcontrol:"off"});
	co2_sensor.send([0xFF, 0x01, 0x79, 0xA0, 0x00, 0x00, 0x00, 0x00, 0xE6]);

	setInterval(async function(){
		var command = [0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79];
		co2_sensor.send(command);
		await obniz.wait(1);
		var res = co2_sensor.readBytes();
		console.log(res);
		if(res.length != 9) return;
		if(res[1] != 134) return;
		co2s.push(res[2] * 256 + res[3]);
	}, 1000);

	// measure
	obniz.display.clear();
	obniz.display.print("started...");
	setTimeout(async function(){
		temperatures.sort();
		waters.sort();
		co2s.sort();
		if(temperatures.length > 3)
		{
			var t = Math.floor( temperatures[ Math.floor(temperatures.length / 2) ] );
			request.get({
				url: "http://49.212.141.20/Imager/temperature.php",
				qs: { sensor: 1000, temperature: t }
				},
				function(err, res, body){ console.log("temperature-body="+body); }
			);
		}
		if(waters.length > 3)
		{
			var w = Math.floor( waters[ Math.floor(waters.length / 2) ] );
			request.get({
				url: "http://49.212.141.20/Imager/temperature.php",
				qs: { sensor: 1001, temperature: w }
				},
				function(err, res, body){ console.log("water-body="+body); }
			);
		}
		if(co2s.length > 0)
		{
			var c = co2s[ Math.floor(co2s.length / 2) ];
			request.get({
				url: "http://49.212.141.20/Imager/co2.php",
				qs: { sensor: 1000, co2: c }
				},
				function(err, res, body){ console.log("co2-body="+body); }
			);
		}
		console.log("temp="+t+",water="+w+",co2="+c);
		obniz.display.print("temp="+t+",water="+w+",co2="+c);
	}, 48*1000);
};

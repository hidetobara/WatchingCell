var Obniz = require("obniz");
var request = require("request");

var obniz = new Obniz("6482-5638");
obniz.onconnect = async function ()
{
	// initialize
	var temperature_sensor = obniz.wired("LM35DZ",	{gnd:0 , output:1, vcc:2});
	var temperatures = [];
	temperature_sensor.onchange = function(temp){
		temperatures.push(temp);
	};
	var co2_sensor = obniz.getFreeUart();
	var co2s = [];
	co2_sensor.start({tx: 4, rx: 3, baud:9600, bits:8, stop:1, parity:"off", flowcontrol:"off"});
		setInterval(async function(){
		var command = [0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79];
		co2_sensor.send(command);
		await obniz.wait(1);
		var res = co2_sensor.readBytes();
		console.log(res);
		if(res.length != 9) return;
		if(res[1] != 134) return;
		co2s.push(res[2] * 256 + res[3]);
		if(co2s.length > 10)
		{
			// end of program
			obniz.close();
			process.exit();
		}
	}, 1000);

	// measure
	obniz.display.clear();
	obniz.display.print("started...");
	setTimeout(async function(){
		temperatures.sort();
		if(temperatures.length > 3)
		{
			var t = Math.floor( temperatures[ Math.floor(temperatures.length / 2) ] );
			request.get({
				url: "http://49.212.141.20/Imager/temperature.php",
				qs: { sensor: 1, temperature: t }
				},
				function(err, res, body){ console.log("body="+body); }
			);
		}
		if(co2s.length > 0)
		{
			var c = co2s[ Math.floor(co2s.length / 2) ];
			request.get({
				url: "http://49.212.141.20/Imager/co2.php",
				qs: { sensor: 1, co2: c }
				},
				function(err, res, body){ console.log("body="+body); }
			);
		}
		console.log("temp="+t+",co2="+c);
		obniz.display.print("temp="+t+",co2="+c);
	}, 7000);
};

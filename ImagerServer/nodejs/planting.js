var Obniz = require("obniz");
var request = require("request");

function Measuring(id, name)
{
	var _name = name;
	var _id = id;
	var _temperatures = [];
	var _co2s = [];
	var _luxs = [];

	this.get_median = function(list)
	{
		if(list.length == 0) return 0;
		if(list.length == 1) return list[0];

		list.sort();
		var o = list[ Math.floor(list.length / 2) ];
		return o;
	}

	this.save_temperature = function(id, t)
	{
		request.get({
			url: "http://49.212.141.20/Imager/temperature.php",
			qs: { sensor: id, temperature: t }
			},
			function(err, res, body){ dump("temperature="+body); }
		);
	}

	this.save_co2 = function(id, c)
	{
		request.get({
			url: "http://49.212.141.20/Imager/co2.php",
			qs: { sensor: id, co2: c }
			},
			function(err, res, body){ dump("co2="+body); }
		);
	}

	this.save_lux = function(id, l)
	{
		request.get({
			url: "http://49.212.141.20/Imager/lux.php",
			qs: { sensor: id, lux: l }
			},
			function(err, res, body){ dump("lux="+body); }
		);
	}

	function print(mes)
	{
		_obniz.display.clear();
		_obniz.display.print(mes);
		console.log(mes);
	}
	function dump(mes)
	{
		console.log(mes);
	}

	var _obniz = new Obniz(""+_name);
	_obniz.display.clear();
	_obniz.display.print("started...");
	_obniz.onconnect = async function ()
	{
		// initialize
		var temperature_sensor = _obniz.wired("LM35DZ",	{gnd:0 , output:1, vcc:2});
		temperature_sensor.onchange = function(temp){
			_temperatures.push(temp);
		};
		var co2_sensor = _obniz.getFreeUart();
		co2_sensor.start({tx: 3, rx: 4, baud:9600, bits:8, stop:1, parity:"off", flowcontrol:"off"});
		co2_sensor.send([0xFF, 0x01, 0x79, 0xA0, 0x00, 0x00, 0x00, 0x00, 0xE6]);
		setInterval(async function(){
			var command = [0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79];
			co2_sensor.send(command);
			await _obniz.wait(33);
			var res = co2_sensor.readBytes();
			console.log(res);
			if(res.length != 9) return;
			if(res[1] != 134) return;
			_co2s.push(res[2] * 256 + res[3]);
		}, 1000);
		_obniz.io9.output(false);
		_obniz.ad10.start();
		_obniz.io11.output(true);
		_obniz.ad11.start();
		setInterval(async function(){
			var vp = _obniz.ad11.value;
			var vn = _obniz.ad10.value;
			dump([vp, vn]);
			_luxs.push(vp - vn);
		}, 1000);
		// saving
		setTimeout(save, 48*1000);
	}

	async function save()
	{
		var t = get_median(_temperatures);
		var c = get_median(_co2s);
		var l = get_median(_luxs);
		save_temperature(_id, t);
		save_co2(_id, c);
//		save_lux(_id, l);
		print("temp="+t+",co2="+c+",lux="+l);
	};

	// Task Kill
	setTimeout(function(){ _obniz.close(); process.exit(); }, 60000);

	var _that = this;
	return this;
};

var instance = Measuring(1, "0167-3051");

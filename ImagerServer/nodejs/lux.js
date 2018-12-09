var Obniz = require("obniz");
var request = require("request");

// Task Kill
setTimeout(function(){ obniz.close(); process.exit(); }, 30000);
// Sensor
var SENSOR_ID = 68608688;
// Obniz
var obniz = new Obniz(""+SENSOR_ID, {auto_connect: false});

// Measuring Class
function Measuring()
{
	var GAINS = {0x00: 16.0*322.0/11.0, 0x01: 16.0*322.0/81.0, 0x02: 16.0*1.0, 0x12: 1.0*1.0}
	var _gain = 0x00; // Need modify gain.
	function getGain(){ return _gain; }
	function getScale() { return GAINS[_gain]; }

	var _luxs = [];
	var _voltages = [];
	var _count = 0;
	var _i2c = null;

	this.save_value_and_voltage = function (sen, val, vol)
	{
		request.get(
			{
				url: "http://49.212.141.20/Imager/voltage.php",
				qs: { sensor: sen, value: val, voltage: vol }
			},
			function(err, res, body){ print("body="+body); }
		);
	}

	this.get_median = function(list)
	{
		if(list.length == 0) return 0;
		if(list.length == 1) return list[0];

		list.sort();
		var o = list[ Math.floor(list.length / 2) ];
		return o;
	}

	function print(mes)
	{
		obniz.display.clear();
		obniz.display.print(mes);
		console.log(mes);
	}

	function compute_lux(int0, int1)
	{
		var ch0 = int0 * getScale();
		var ch1 = int1 * getScale();

		var ratio = ch1 / ch0;
		var lux = 0.0;
		if(ratio >= 0 && ratio <= 0.50) lux = 0.0304 * ch0 - 0.062 * ch0 * Math.pow(ratio, 1.4);
		else if(ratio <= 0.61) lux = 0.0224 * ch0 - 0.031 * ch1;
		else if(ratio <= 0.80) lux = 0.0128 * ch0 - 0.0153 * ch1;
		else if(ratio <= 1.30) lux = 0.00146 * ch0 - 0.00112 * ch1;
		return lux;
	}

	async function interval()
	{
		// lux
		_i2c.write(0x39, [0xAC]);
		var c0 = await _i2c.readWait(0x39, 16);
		var ch0 = c0[1] * 256 + c0[0];
		//console.log("c0="+c0);
		_i2c.write(0x39, [0xAE]);
		var c1 = await _i2c.readWait(0x39, 16);
		var ch1 = c1[1] * 256 + c1[0];
		//console.log("c1="+c1);
		var lux = compute_lux(ch0, ch1);
		_luxs.push(lux);

		// voltage
		var vn = obniz.ad2.value;
		var vp = obniz.ad3.value;
		var v = vp - vn;
		//console.log("vp="+vp+",vn="+vn);
		_voltages.push(v);
		print("lux="+lux+",voltage="+v);

		_count++;
		if(_count > 10 && _count % 4 == 0)
		{
			lux = get_median(_luxs);
			v = get_median(_voltages);
			save_value_and_voltage(SENSOR_ID, lux, v);
		}
	}

	this.run = function()
	{
		print("running... scale=" + getScale());
		// lux
		_i2c = obniz.getFreeI2C();
		_i2c.start({mode:"master", sda:0, scl:1, clock:100000});
		// voltage
		obniz.ad2.start();
		obniz.ad3.start();
		// start tsl
		_i2c.write(0x39, [0x80, 0x03]);
		// modify tsl gain
		_i2c.write(0x39, [0x81, getGain()]);
		setInterval(interval, 2000);
	}

	print("started...");
	var _that = this;
	return this;
}

var instance = Measuring();
obniz.connect();
obniz.onconnect = async function()
{
	instance.run();
};

var Obniz = require("obniz");
var request = require("request");

// Task Kill
setTimeout(function(){ obniz.close(); process.exit(); }, 30000);
// Sensor
var SENSOR_ID = 68608688;
// Obniz
var obniz = new Obniz(""+SENSOR_ID, {auto_connect: false});

function save_value_and_voltage(sen, val, vol)
{
	request.get(
		{
			url: "http://49.212.141.20/Imager/voltage.php",
			qs: { sensor: sen, value: val, voltage: vol }
		},
		function(err, res, body){ print("body="+body); }
	);
}

function get_median(list)
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

function compute_lux(ch0, ch1)
{
  var ratio = ch1 / ch0;
  var lux = 0.0;
  if(ratio >= 0 && ratio <= 0.50) lux = 0.0304 * ch0 - 0.062 * ch0 * ratio**1.4
  else if(ratio <= 0.61) lux = 0.0224 * ch0 - 0.031 * ch1
  else if(ratio <= 0.80) lux = 0.0128 * ch0 - 0.0153 * ch1
  else if(ratio <= 1.30) lux = 0.00146 * ch0 - 0.00112 * ch1
  return lux;
}

print("started...");
obniz.connect();
obniz.onconnect = async function()
{
	print("connected...");
	// lux
	var i2c = obniz.getFreeI2C();
	i2c.start({mode:"master", sda:0, scl:1, clock:100000});
	// voltage
	obniz.ad2.start();
	obniz.ad3.start();
	// start tsl
	i2c.write(0x39, [0x80, 0x03]);
	// modify tsl gain
	i2c.write(0x39, [0x81, 0x02]);	
	//i2c.write(0x39, [0x81, 0x12]); // x16
	
	var luxs = [];
	var voltages = [];
	var count = 0;

	setInterval(async function()
	{
		// lux
		i2c.write(0x39, [0xAC]);
		var c0 = await i2c.readWait(0x39, 16);
		var ch0 = c0[1] * 256 + c0[0];
		//console.log("c0="+c0);
		i2c.write(0x39, [0xAE]);
		var c1 = await i2c.readWait(0x39, 16);
		var ch1 = c1[1] * 256 + c1[0];
		//console.log("c1="+c1);
		var lux = compute_lux(ch0, ch1);
		luxs.push(lux);

		// voltage
		var vn = obniz.ad2.value;
		var vp = obniz.ad3.value;
		var v = vp - vn;
		//console.log("vp="+vp+",vn="+vn);
		voltages.push(v);
		print("lux="+lux+",voltage="+v);

		count++;
		if(count > 10 && count % 4 == 0)
		{
			lux = get_median(luxs);
			v = get_median(voltages);
			save_value_and_voltage(SENSOR_ID, lux, v);
		}
	}, 2000);
};

var Obniz = require("obniz");
var request = require("request");

function Measuring(id, name)
{
	const WARMING = 10;
	var _name = name;
	var _id = id;
	var _obniz;

function print(m){ if(_obniz != null){ _obniz.display.clear(); _obniz.display.print(m); } console.log(m); }
function dump(m){ console.log(m); }
function upload(url, params)
{
  request.get({
    url: url,
    qs: params
  }, function(err, res, body){ dump(url + "=" + body); }
  );
}

function device_LM35DZ(obniz, num_gnd, num_out, num_vcc)
{
  var _device = obniz.wired("LM35DZ",  { gnd:num_gnd , output:num_out, vcc:num_vcc});
  var _list = [];
  _device.onchange = function(temp){ _list.push(temp); };
  function get_median(list){ if(list.length == 0) return 0; list.sort(); return list[ Math.floor(list.length/2) ]; }
  
  this.get_temperature = function(){ return get_median(_list); }
  
  var _that = this;
  return this;
}
  
function device_TEPT4400(obniz, num_out, num_vcc)
{
  obniz["ad"+num_out].start();
  obniz["ad"+num_vcc].start();
  var _list = [];
  setInterval(function(){
    var down = obniz["ad"+num_out].value;
    var up = obniz["ad"+num_vcc].value;
    _list.push(up - down);
  }, 1000);

  function get_median(list){ if(list.length == 0) return 0; list.sort(); return list[ Math.floor(list.length/2) ]; }
  this.get_lux = function()
  {
    var vol = get_median(_list);
    if(vol < 0.0) return 0;
    return Math.floor(11167 * vol) + 188;
  }
  var _that = this;
  return this;
}

function device_MHZ19B(obniz, num_tx, num_rx)
{
  var _uart = obniz.getFreeUart();
  var _co2s = [];
  _uart.start({tx: num_tx, rx: num_rx, baud:9600, bits:8, stop:1, parity:"off", flowcontrol:"off"});
  _uart.send([0xFF, 0x01, 0x79, 0xA0, 0x00, 0x00, 0x00, 0x00, 0xE6]);

  function get_median(list){ if(list.length == 0) return 0; list.sort(); return list[ Math.floor(list.length/2) ]; }
  
  setInterval(async function(){
    var command = [0xFF, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79];
    _uart.send(command);
    await obniz.wait(1);
    var res = _uart.readBytes();
    if(res.length != 9 || res[1] != 134){ console.log(res); return; }
    _co2s.push(res[2] * 256 + res[3]);
  }, 1000);

  this.get_co2 = function(){ return get_median(_co2s); }
  
  var _that = this;
  return this;
}

	_obniz = new Obniz(""+_name);
	var _dev_temperature, _dev_lux, _dev_co2;
	print("started...");
	_obniz.onconnect = async function ()
	{
		// initialize
		print("initialized...");
		_dev_temperature = device_LM35DZ(_obniz, 0, 1, 2);
		_dev_lux = device_TEPT4400(_obniz, 3, 5);
		_dev_co2 = device_MHZ19B(_obniz, 6, 7);
		// saving
		setTimeout(save, 45*1000);
	}

async function save()
{
  var id = _id;
  var t = _dev_temperature.get_temperature();
  var l = _dev_lux.get_lux();
  var c = _dev_co2.get_co2();

  print("saved id="+id +",temp="+t+",co2="+c+",lux="+l);
  upload("http://49.212.141.20/Imager/temperature.php", {sensor: id, temperature: t });
  upload("http://49.212.141.20/Imager/co2.php", {sensor: id, co2: c });
  upload("http://49.212.141.20/Imager/lux.php", {sensor: id, lux: l });
}

	// Task Kill
	setTimeout(function(){ _obniz.close(); process.exit(); }, (WARMING+60)*1000);

	var _that = this;
	return this;
};

var instance = Measuring(3, "6364-0285");

const Obniz = require("obniz");
const request = require("request");
const FormData = require('form-data');
const fs = require('fs');

// Task Kill
setTimeout(function(){ obniz.close(); process.exit(); }, 120*1000);

var obniz = new Obniz("0167-3051");

function device_POWER(o, num_gnd, num_vcc)
{
  var _obniz = o;
  _obniz["io"+num_gnd].output(false);
  _obniz["io"+num_vcc].output(true);
  _obniz.keepWorkingAtOffline(true); 
 
  var _that = this;
  return this;
}

function device_CCS811(o, num_sda, num_scl)
{
  const ADDRESS = 0x5B;
  const START = 0xF4;
  const STATUS = 0x00;
  const REGISTER = 0x01;
  const ALG_RESULT_DATA = 0x02;
  const ERROR = 0xE0;
  const INTERVAL = 2000;

  var _obniz = o;
  var _coxs = [];
  
  // private
  function print(m){ _obniz.display.clear(); _obniz.display.print(m); console.log(m); }
  function toHex(v){ return '0x' + (('00' + v.toString(16).toUpperCase()).substr(-4)); } 
  function get_median(list)
  {
    if(list.length == 0) return 0;
    if(list.length == 1) return list[0];

    list.sort();
    var o = list[ Math.floor(list.length / 2) ];
    return o;
  }
  
  // public
  this.get_cox = function(){ return get_median(_coxs); }
  
  // initialize
  var i2c = _obniz.getFreeI2C();
  i2c.start({mode:"master", sda:num_sda, scl:num_scl, clock:100000});
  i2c.write(ADDRESS, [START]);
  //i2c.write(ADDRESS, [0xFF, 0x11, 0xE5, 0x72, 0x8A]); // reset
  i2c.write(ADDRESS, [REGISTER, 0x40]);

  // auto measuring
  var wait = 5;
  setInterval(async function()
  {
    wait--;
    if(wait > 0) return;

    i2c.write(ADDRESS, [STATUS]);
    var sta = await i2c.readWait(ADDRESS, 1); 
    //print("[ccs811] status=" + toHex(sta[0]));
    if(sta[0] & 0x8)
    {
      i2c.write(ADDRESS, [ALG_RESULT_DATA]);
      var res = await i2c.readWait(ADDRESS, 4);
      var cox = res[0]*256+res[1];
      print("[ccs811] cox=" + cox);
      _coxs.push(cox);
    }
    else
    {
      i2c.write(ADDRESS, [ERROR]);
      var err = await i2c.readWait(ADDRESS,1);
      print("error="+ toHex(err));
    }
  }, INTERVAL);

  var _that = this;
  return this;
}

obniz.onconnect = async function ()
{
	function print(m){ obniz.display.clear(); obniz.display.print(m); console.log(m); }
	function save_co2(id, c)
	{
		request.get({
			url: "http://49.212.141.20/Imager/co2.php",
			qs: { sensor: id, co2: c }
			},
			function(err, res, body){ console.log("co2="+body); }
		);
	}

	// initialize
	print("started...");

	var power = device_POWER(obniz, 0, 1);
	obniz.wait(3*1000);
	var ccs811 = device_CCS811(obniz, 2, 3);
	setTimeout(function()
		{
			var cox = ccs811.get_cox();
			if(cox > 0) save_co2(2, cox);		
		}, 60*1000);
};

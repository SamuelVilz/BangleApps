const Storage = require('Storage');

function getImg(g, col) {
  return {
    width:g.getWidth(),
    height:g.getHeight(),
    bpp:1, transparent:0,
    buffer:g.buffer,
    palette:new Uint16Array([0,col])};
}

Bangle.setLCDMode();
g.clear();

let ImageFile = Storage.open('out','r');
let drawingBG = false;

function drawBG(bounds){
  if(drawingBG){return;}
  drawingBG = true;
  for (let y = 0; y < bounds.y+bounds.height+1; y++) {
    let LineData = ImageFile.readLine();
    if(y<bounds.y+1){continue;}
    if(LineData == null){break;}
    g.drawImage({
      width:240, height:1, bpp:16,
      buffer:E.toArrayBuffer(atob(LineData))
    }, 0,y);
  }
  ImageFile = Storage.open('out','r');
  drawingBG = false;
}

const fullbounds = {x:0,y:0,width:240,height:240};
var handSizeMin = 180;
var handSizeHr = 120;
const minW = 6;
const hourW = 6;
const shadowSize = 4;
const minSSize = minW + shadowSize;
const hourSSize = hourW + shadowSize;
var gmin = Graphics.createArrayBuffer(minW+shadowSize,handSizeMin,1,{msb:true});
var gminimg = getImg(gmin, g.setColor("#364ccf").getColor());
var ghr = Graphics.createArrayBuffer(hourW,handSizeHr,1,{msb:true});
var ghrimg = getImg(ghr, g.setColor("#ee3d48").getColor());
var gminS = Graphics.createArrayBuffer(minSSize,handSizeMin,1,{msb:true});
var gminimgS = getImg(gminS, g.setColor("#000000").getColor());
var ghrS = Graphics.createArrayBuffer(hourSSize,handSizeHr,1,{msb:true});
var ghrimgS = getImg(ghrS, g.setColor("#000000").getColor());

// create hand images
var c;
var o = 8; // overhang
c = gmin.getHeight()/2;
gmin.fillCircle(minW/2,minW/2,minW/2);
gmin.fillCircle(minW/2,c+o,minW/2);
gmin.fillRect(0,minW/2,minW-1,c+o);
c = ghr.getHeight()/2;
ghr.fillCircle(hourW/2,hourW/2,hourW/2);
ghr.fillCircle(hourW/2,c+o,hourW/2);
ghr.fillRect(0,hourW/2,hourW-1,c+o);
c = gminS.getHeight()/2;
gminS.fillCircle(minSSize/2,minSSize/2,minSSize/2);
gminS.fillCircle(minSSize/2,c+o,minSSize/2);
gminS.fillRect(0,minSSize/2,minSSize-1,c+o);
c = ghrS.getHeight()/2;
ghrS.fillCircle(hourSSize/2,hourSSize/2,hourSSize/2);
ghrS.fillCircle(hourSSize/2,c+o,hourSSize/2);
ghrS.fillRect(0,hourSSize/2,hourSSize-1,c+o);

// last positions of hands (in radians)
var lastrmin=0, lastrhr=0;

// draw hands - just the bit of the image that changed
function drawHands(full) {
  if(drawingBG){setTimeout(drawHands(full),50);return;}
  var d = new Date();
  var rmin = d.getMinutes()*Math.PI/30;
  // hack so hour hand only moves every 10 minutes
  var rhr = (d.getHours() + Math.round(d.getMinutes()/10)/6)*Math.PI/6;
  var bounds = {};
  if (!full) { // work out the bounds of the hands
    if (rmin==lastrmin && rhr==lastrhr){return;}
    var x1 = (g.getWidth()/2)-10;
    var y1 = (g.getHeight()/2)-10;
    var x2 = (g.getWidth()/2)+10;
    var y2 = (g.getHeight()/2)+10;
    function addPt(ang, r, ry) {
      var x = (g.getWidth()/2) + Math.sin(ang)*r + Math.cos(ang)*ry;
      var y = (g.getHeight()/2) - Math.cos(ang)*r + Math.sin(ang)*ry;
      if (x<x1)x1=x;
      if (y<y1)y1=y;
      if (x>x2)x2=x;
      if (y>y2)y2=y;
    }
    function addMin(r) {
      addPt(r,handSizeMin,minSSize/2);addPt(r,handSizeMin,-minSSize/2);
      addPt(r,-(o+minSSize/2),minSSize/2);addPt(r,-(o+minSSize/2),-minSSize/2);
    }
    function addHr(r) {
      addPt(r,handSizeHr,hourSSize/2);addPt(r,handSizeHr,-hourSSize/2);
      addPt(r,-(o+hourSSize/2),hourSSize/2);addPt(r,-(o+hourSSize/2),-hourSSize/2);
    }
    if (rmin!=lastrmin) {
      addMin(rmin);addMin(lastrmin);
    }
    if (rhr!=lastrhr) {
      addHr(rhr);addHr(lastrhr);
    }
    bounds = {x:x1,y:y1,width:1+x2-x1,height:1+y2-y1};
  }
  else{
    bounds = fullbounds;
  }
  drawBG(bounds);
  setTimeout(()=>{g.drawImages([
    {image:ghrimgS,x:120,y:120,center:true,rotate:rhr},
    {image:ghrimg,x:120,y:120,center:true,rotate:rhr},
    {image:gminimgS,x:120,y:120,center:true,rotate:rmin},
    {image:gminimg,x:120,y:120,center:true,rotate:rmin},
  ],fullbounds);},1);
  lastrmin = rmin;
  lastrhr = rhr;
}

if (g.drawImages) {
  var secondInterval = setInterval(drawHands,1000);
  // handle display switch on/off
  Bangle.on('lcdPower', (on) => {
    if (secondInterval) {
      clearInterval(secondInterval);
      secondInterval = undefined;
      drawingBG = false;
    }
    if (on) {
      drawHands();
      secondInterval = setInterval(drawHands,1000);
    }
  });

  g.clear();
  setTimeout(()=>{drawHands(true);},500);
} else {
  E.showMessage("Please update\nBangle.js firmware\nto use this clock","analogimgclk");
}

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });

const noteDict = require("Storage").readJSON("notes.json");

let curIndex = 48; // a1

let beepInProgress = false;

function update() {
  g.clear();
  Bangle.drawWidgets();
  g.setColor(1,1,1);
  g.setFont("6x8",1);
  g.setFontAlign(0,0,3);
  g.drawString("LOWER",230,200);
  g.drawString("LAUNCH",230,130);
  g.drawString("HIGHER",230,60);

  g.setFontVector(80);
  g.setFontAlign(0,0,0);
  g.drawString(noteDict[curIndex].note,120,120);

  if(beepInProgress){return;}
  beepInProgress = true;
  Bangle.beep(1000, noteDict[curIndex].freq).then(()=>{beepInProgress = false;});
}

function oneHigher(){
  if(curIndex<noteDict.length-1){
    curIndex++;
    update();
  }
}

function oneLower(){
  if(curIndex>0){
    curIndex--;
    update();
  }
}

Bangle.on('touch', function(button) {
  // button - 1 for left, 2 for right
  if(beepInProgress){return;}
  beepInProgress = true;
  Bangle.beep(2000, noteDict[curIndex].freq).then(()=>{beepInProgress = false;});
});

g.clear();
Bangle.loadWidgets();
setWatch(oneHigher, BTN1, {repeat:true,edge:"rising"});
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
setWatch(oneLower, BTN3, {repeat:true,edge:"rising"});
update();

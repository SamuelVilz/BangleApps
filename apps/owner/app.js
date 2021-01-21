g.clear();
Bangle.loadWidgets();
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

Bangle.drawWidgets();
g.setColor(1,1,1);
g.setFont("6x8",1);
g.setFontAlign(0,0,3);
g.drawString("LAUNCH",230,130);

let fontSize = 20;
g.setFontVector(fontSize);
g.setFontAlign(0,0,0);
let message = ("Hallo :)\n"+
              "Mein Name ist\n"+
              "Samuel Vilz, und\n"+
              "dies ist meine Uhr.\n"+
              "Bitte rufen Sie\n"+
              "mich unter\n"+
              "0176/82600756 an.\n"+
              "Vielen Dank.");
let numberOfLines = 8;
g.drawString(message,120,parseInt(240-numberOfLines*fontSize)/2);
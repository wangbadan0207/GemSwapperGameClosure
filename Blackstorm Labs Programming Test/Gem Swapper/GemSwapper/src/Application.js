//SDK imports
import device;
import ui.StackView as StackView;
import ui.TextView as TextView;

//Game imports
import src.GameScreen as GameScreen;

exports = Class(GC.Application, function () {

  this.initUI = function()
  {
    var gameScreen = new GameScreen();
    
    let xScale = device.width / 576;
    
    //Create a stackview to fit the background
    var rootView = new StackView(
    {
        superview: this,
        x: 0,
        y: 0,
        width: 576,
        height: 1024,
        clip: true,
        scale: xScale
    });
    
    //Push GameScreen
    rootView.push(gameScreen);
    
    gameScreen.build();
  };

  this.launchUI = function()
  {

  };

});

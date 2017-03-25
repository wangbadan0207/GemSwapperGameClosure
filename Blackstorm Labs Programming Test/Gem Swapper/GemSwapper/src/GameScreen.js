import device;
import animate;
import ui.View;
import ui.ImageView;
import ui.TextView;
import ui.resource.Image as Image;
import src.Grid as Grid;

/* Some game constants.
 */
var curScore = 0;
var time = 60;

var timeFunc = null;

//Assets
var headerImg = new Image({scale: true, url: "resources/images/gem_images/gem_images/ui/header.png"});

//The offset from the bottom of the background image, where the darker space is
//This lets us fit everything in nicely
GLOBAL.BGBottomOffset = 174;

/* The GameScreen view is a child of the main application. */
exports = Class(ui.ImageView, function (supr) {
    
    this.gameEnd = false;
    this.lockInput = false;
    
	this.init = function (opts) {
        //Set the background image and center it
		opts = merge(opts, {
			x: 0,
			y: 0,
            centerX: true,
            centerY: true,
            image: "resources/images/gem_images/gem_images/ui/background.png"
		});

		supr(this, 'init', [opts]);
	}
	
	this.build = function()
	{
        //Center the image on the screen; it has an upper-left pivot
        var centeredX = (device.width / 2) - (headerImg.getWidth() / 2);
        
        //Add the score header image at the top of the screen
		var scoreHeader = new ui.ImageView(
        {
            superview: this.view,
			x: centeredX,
			y: 0,
            width: headerImg.getWidth(),
            height: headerImg.getHeight(),
			layout: "box",
            centerX: true,
			image: headerImg
        });
        
        this.addSubview(scoreHeader);
        
        //Create the score text, inserting it into the score header
        this.scoreText = new ui.TextView(
        {
            superview: scoreHeader,
            visible: true,
            x: centeredX,
            y: scoreHeader.style.height / 2.2,
            width: 221,
            height: 61,
            layout: "box",
            size: 48,
            color: '#FFFFFF',
            opacity: 1.0,
            autoSize: false,
            verticalAlign: 'middle',
			horizontalAlign: 'center',
			wrap: false,
            centerX: true
        });
        
        //Time limit
        this.timeText = new ui.TextView(
        {
           superview: this.view,
           visible: true,
           x: 20,
           y: 20,
           width: 300,
           height: 70,
           layout: "box",
           size: 48,
           color: '#000000',
           opacity: 1.0,
           autoSize: false,
           verticalAlign: 'top',
           horizontalAlign: 'left',
           wrap: false
        });
        
        this.timeText.setText(time.toString());
        
        this.addSubview(this.timeText);
        
        //Initialize
        this.addScore(0);
        
        //Create the Gem grid
        this.gemGrid = new Grid();

        //Center the grid accordingly based on how many cells it has
        let centeredGridX = (this.getSuperview().style.width / 2) - (this.gemGrid.gridSizeX / 2);
        this.gemGrid.style.x = centeredGridX;
        
        //Place the grid at the bottom, then rise it by the offset and the grid's height to
        //place the last row just above the end of the darker space in the background image
        this.gemGrid.style.y = (this.getSuperview().style.height - GLOBAL.BGBottomOffset - this.gemGrid.gridSizeY);
        
        this.addSubview(this.gemGrid);
        
        timeFunc = setInterval(updateTime.bind(this), 1000);
	}
    
    this.addScore = function(score)
    {
        curScore += score;
        this.scoreText.setText(curScore.toString());
    }
});

function updateTime()
{
	time -= 1;
	this.timeText.setText(time.toString());
    
    if (time <= 0)
    {
        clearInterval(timeFunc);
        this.timeText.setText("GAME OVER");
        
        //Lock input, drop the gem, and end the game
        this.gemGrid.dropGem();
        this.lockInput = true;
        
        console.log("Game ended");
        this.gameEnd = true;
    }
}
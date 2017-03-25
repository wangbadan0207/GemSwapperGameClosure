import device;
import animate;
import ui.View;
import ui.ImageView;
import ui.TextView;
import ui.resource.Image as Image;
import src.Gem as Gem;
import math.geom.Vec2D as Vec2D;
import animate;

var rowCount = 8;
var colCount = 8;

//Easy reference for the number of available gem images
GLOBAL.gemImageCount = GLOBAL.gemImages.length;

var self = this;

exports = Class(ui.View, function(supr) {
    this.gemGrid = null;
    this.heldGem = null;
    
    this.rows = rowCount;
    this.columns = colCount;
    
    //Define the grid size. Its size depends on how many rows and columns there are and the size of each cell on the grid
    this.gridSizeX = this.rows * GLOBAL.gemCellSize;
    this.gridSizeY = this.columns * GLOBAL.gemCellSize;
    
    this.matchCols = new Array();
    
    this.init = function (opts)
    {
		opts = merge(opts, {
			x: device.width / 8,
			y: device.height / 4,
            width: this.gridSizeX,
            height: this.gridSizeY,
            centerX: true,
            centerY: true
		});

		supr(this, 'init', [opts]);
        
        this.build();
	};
    
    this.build = function()
    {
        this.gemGrid = new Array();
        
        for (var i = 0; i < this.rows; i++)
        {
            this.gemGrid[i] = new Array();
            
            for (var j = 0; j < this.columns; j++)
            {
                var gem = new Gem();
                gem.initialize(this, getRandomGemNum(), i, j);
                gem.setImage(gem.getGemImg());
                
                setUpGemEvents(gem);
                
                this.gemGrid[i][j] = gem;
                this.addSubview(gem);
            }
        }
    };
    
    this.inputLocked = function()
    {
        return this.getSuperview().lockInput;
    }
    
    function getRandomGemNum()
    {
        return parseInt((Math.random() * GLOBAL.gemImageCount), 10);
    }
    
    function setUpGemEvents(gem)
    {
        gem.on('InputStart', gem.onGemInputStart);
    }
    
    this.grabGem = function(gem)
    {
        this.heldGem = gem;
        console.log("Grabbed gem at (row " + gem.gridRow + ", col " + gem.gridCol + ")");
        
        this.heldGem.showSelection();
    }
    
    this.dropGem = function()
    {
        if (this.heldGem == null) return;
        
        var gem = this.heldGem;
        console.log("Dropped gem at (row " + gem.gridRow + ", col " + gem.gridCol + ")");
        
        this.heldGem.hideSelection();
        this.heldGem = null;
    }
    
    this.getAdjacentGemsTo = function(row, col)
    {
        //Handle out of bounds
        if (this.isOffGrid(row, col) == true) return new Array();
        
        let rM1 = row - 1;
        let rP1 = row + 1;
        let cM1 = col - 1;
        let cP1 = col + 1;
        
        var adjacentGems = new Array();
        
        //Above
        if (this.isOnGrid(rM1, col) == true) adjacentGems.push(this.gemGrid[rM1][col]);
        //Below
        if (this.isOnGrid(rP1, col) == true) adjacentGems.push(this.gemGrid[rP1][col]);
        //Left
        if (this.isOnGrid(row, cM1) == true) adjacentGems.push(this.gemGrid[row][cM1]);
        //Right
        if (this.isOnGrid(row, cP1) == true) adjacentGems.push(this.gemGrid[row][cP1]);
        
        //console.log("Found: " + adjacentGems.length + " adjacent gems");
        
        return adjacentGems;
    }
    
    this.isOffGrid = function(row, col)
    {
        return (row < 0 || row >= this.rows || col < 0 || col >= this.columns);
    }
    
    this.isOnGrid = function(row, col)
    {
        return (this.isOffGrid(row, col) == false);
    }
    
    this.swapGems = function(gem1, gem2)
    {
        //Simply swap gem numbers and update their images
        let num1 = gem1.gemNum;
        
        console.log(num1);
        console.log(gem2.gemNum);
        
        gem1.gemNum = gem2.gemNum;
        gem2.gemNum = num1;
        
        gem1.setImage(gem1.getGemImg());
        gem2.setImage(gem2.getGemImg());
        
        //Drop the gem you're holding
        this.dropGem();
        
        //Lock Input
        this.getSuperview().lockInput = true;
        
        //Check for and handle any potential matches
        this.checkHandleMatches();
    }
    
    this.handleMatches = function(allChains)
    {
        var score = 0;
        let multiplier = 2;
        
        for (var i = 0; i < allChains.length; i++)
        {
            var baseScore = 10;
            
            for (var j = 0; j < allChains[i].length; j++)
            {
                if (allChains[i][j].isRemoved == false)
                {
                    allChains[i][j].isRemoved = true;
                    baseScore *= multiplier;
                    
                    let x = allChains[i][j].gridRow;
                    let y = allChains[i][j].gridCol;
                    
                    this.removeSubview(this.gemGrid[x][y]);
                    this.gemGrid[x][y] = null;
                    
                    //Add to the match columns
                    if (this.matchCols.includes(y) == false)
                    {
                        this.matchCols.push(y);
                    }
                }
            }
            
            score += baseScore;
        }
        
        this.getSuperview().addScore(score);
    }
    
    this.checkMatches = function()
    {
        var horiz = this.checkHorizontalMatch();
        var vert = this.checkVerticalMatch();
        
        var allChains = horiz.concat(vert);
        
        return allChains;
    }
    
    this.checkHorizontalMatch = function()
    {
        //All the Horizontal chains found
        var allHorizChains = new Array();
        
        for (var row = 0; row < this.rows; row++)
        {
            //There can't be a start to the chain if less than 3, so check for all matches
            for (var col = 0; col < this.columns - 2; )
            {
                //Get the gemNum of this gem
                let gNum = this.gemGrid[row][col].gemNum;
            
                //Check if there are 2 more matches; if so, start finding all matches
                if (this.gemGrid[row][col + 1].gemNum == gNum && this.gemGrid[row][col + 2].gemNum == gNum)
                {
                    //Horizontal chain of matches
                    var horizChain = new Array();
                    
                    do
                    {
                        //Add each element and increment
                        horizChain.push(this.gemGrid[row][col]);
                        col++;
                    }
                    //End if we reached the end or we run into one without the same gemNum
                    while (col < this.columns && this.gemGrid[row][col].gemNum == gNum);
                
                    if (horizChain.length > 0)
                    {
                        allHorizChains.push(horizChain);
                    }
                    continue;
                }
            
                col++;
            }
        }
        
        return allHorizChains;
    }
    
    this.checkVerticalMatch = function()
    {
        //All the Vertical chains found
        var allVertChains = new Array();
        
        for (var col = 0; col < this.columns; col++)
        {
            //There can't be a start to the chain if less than 3, so check for all matches
            for (var row = 0; row < this.rows - 2; )
            {
                //Get the gemNum of this gem
                let gNum = this.gemGrid[row][col].gemNum;
            
                //Check if there are 2 more matches; if so, start finding all matches
                if (this.gemGrid[row + 1][col].gemNum == gNum && this.gemGrid[row + 2][col].gemNum == gNum)
                {
                    //Vertical chain of matches
                    var vertChain = new Array();
                    
                    do
                    {
                        //Add each element and increment
                        vertChain.push(this.gemGrid[row][col]);
                        row++;
                    }
                    //End if we reached the end or we run into one without the same gemNum
                    while (row < this.rows && this.gemGrid[row][col].gemNum == gNum);
                
                    if (vertChain.length > 0)
                    {
                        allVertChains.push(vertChain);
                    }
                    continue;
                }
            
                row++;
            }
        }
        
        return allVertChains;
    }
    
    this.checkHandleMatches = function()
    {
        //Check for matches
        var allChains = this.checkMatches();
        
        //Handle the matches
        if (allChains.length > 0)
        {
            this.handleMatches(allChains);
            
            if (this.matchCols.length > 0)
            {
                this.deleteAddGems();
            }
            else
            {
                this.clearGiveControl();
            }
        }
        else this.clearGiveControl();
    }

    this.deleteAddGems = function()
    {
        let moveTime = 200;
        var longestMoveTime = 0;
        
        for (var i = 0; i < this.matchCols.length; i++)
        {
            let col = this.matchCols[i];
            var move = 0;
            
            //Start from the bottom
            for (var row = this.rows - 1; row >= 0; row--)
            {
                //Look for any empty spaces and increment how many grid spaces valid gems above should move
                if (this.gemGrid[row][col] == null)
                {
                    move++;
                }
                //Move down
                else
                {
                    //If none should be moved yet, ignore
                    if (move > 0)
                    {
                        //Get the gem at this position
                        var gem = this.gemGrid[row][col];
                        
                        //Move it down
                        gem.gridRow += move;
                        var vec2D = gem.getPosition();
                        
                        //Clear this gem's position and set it in the grid space it should occupy
                        this.gemGrid[row][col] = null;
                        this.gemGrid[gem.gridRow][col] = gem;
                        
                        //Move the gem's position
                        animate(gem).now({y: vec2D.y }, (moveTime * move), animate.easeInCubic);
                    }
                }
            }
            
            //Now that we know how many spaces they moved, we also know how many new gems to create
            //Start from the top
            for (var row = 0; row < move; row++)
            {
                let diff = (move - row) + 1;
                
                var newGem = new Gem();
                newGem.initialize(this, getRandomGemNum(), row, col);
                newGem.setImage(newGem.getGemImg());
                
                setUpGemEvents(newGem);
                
                //Move it to the top of the screen, then make it drop down
                var vec2D = newGem.getPosition();
                newGem.style.y = (-GLOBAL.gemCellSize * diff);
                
                //Make the new gems fade in
                newGem.style.opacity = 0.2;
                
                animate(newGem).now({y: vec2D.y, opacity: 1.0 }, moveTime * move, animate.easeInCubic).then({ opacity: 1.0 }, 1, animate.linear);
                
                this.gemGrid[row][col] = newGem;
                this.addSubview(newGem);
            }
            
            let totalMoveTime = moveTime * move;
            
            if (totalMoveTime > longestMoveTime)
            {
                longestMoveTime = totalMoveTime;
            }
        }
        
        //Wait the longest amount of time, plus a little, then clear the board and check for more matches
        setTimeout( () =>
                    { this.clearGiveControl();
                      this.checkHandleMatches();
                    }, longestMoveTime + moveTime);
    }
    
    this.clearGiveControl = function()
    {
        //Clear the array and give back control
        this.matchCols = new Array();
        
        //If the game isn't over, give control
        if (this.getSuperview().gameEnd == false)
        {
            console.log("Unlocked input");
            this.getSuperview().lockInput = false;
        }
    }
});
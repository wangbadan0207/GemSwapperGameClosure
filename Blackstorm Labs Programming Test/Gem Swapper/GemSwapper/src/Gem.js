import device;
import animate;
import ui.View;
import ui.ImageView;
import ui.TextView;
import ui.resource.Image as Image;
import math.geom.Vec2D as Vec2D;

//Gem images
var moonGem = new Image({scale: true, url: "resources/images/gem_images/gem_images/gems/gem_01.png"});
var thunderGem = new Image({scale: true, url: "resources/images/gem_images/gem_images/gems/gem_02.png"});
var waterGem = new Image({scale: true, url: "resources/images/gem_images/gem_images/gems/gem_03.png"});
var fireGem = new Image({scale: true, url: "resources/images/gem_images/gem_images/gems/gem_04.png"});
var leafGem = new Image({scale: true, url: "resources/images/gem_images/gem_images/gems/gem_05.png"});

var selectedImg = new Image({scale: true, url: "resources/images/gem_images/gem_images/ui/selected.png"});

//Gem image array for easy referencing
GLOBAL.gemImages = [ moonGem, thunderGem, waterGem, fireGem, leafGem ];
GLOBAL.gemCellSize = 66;

var selectedOffset = 5;

exports = Class(ui.ImageView, function(supr) {
    
    this.init = function (opts)
    {
		opts = merge(opts, {
            x: 0,
            y: 0,
			width: GLOBAL.gemCellSize,
			height: GLOBAL.gemCellSize,
            image: "resources/images/gem_images/gem_images/gems/gem_01.png",
            centerX: true,
            centerY: true
		});
        
		supr(this, 'init', [opts]);
	};

    this.isRemoved = false;
    
    this.grid = null;
    
    //The gem number. If 3 gems with the same number are aligned vertically or horizontally, it's a match
    this.gemNum = 0;
    
    this.gridRow = 0;
    this.gridCol = 0;
    
    this.initialize = function(grid, gemnum, row, column)
    {
        this.grid = grid;
        this.gemNum = gemnum;
        this.gridRow = row;
        this.gridCol = column;
        
        this.updatePosition();
        
        this.selectedImg = new ui.ImageView(
        {
            superview: this.view,
			x: 0,
			y: 0,
            width: GLOBAL.gemCellSize + selectedOffset,
            height: GLOBAL.gemCellSize + selectedOffset,
			layout: "box",
            centerX: true,
            visible: false,
			image: selectedImg
        });
        
        this.addSubview(this.selectedImg);
    };
    
    this.getPosition = function()
    {
        return new Vec2D({ x: (this.gridCol * GLOBAL.gemCellSize), y: (this.gridRow * GLOBAL.gemCellSize) });
    }
    
    this.updatePosition = function()
    {
        var vec2D = this.getPosition();
        
        //This position is local, as each Gem is parented to the grid
        this.style.x = vec2D.x;
        this.style.y = vec2D.y;
    }
    
    this.showSelection = function()
    {
        this.selectedImg.style.x = -selectedOffset;
        this.selectedImg.style.y = -selectedOffset;
        
        this.selectedImg.style.visible = true;
    }
    
    this.hideSelection = function()
    {
        this.selectedImg.style.visible = false;
    }
    
    this.getGemImg = function()
    {
        return GLOBAL.gemImages[this.gemNum];
    }
    
    //Returns all adjacent Gems
    this.getAdjacentGems = function()
    {
        return (this.grid.getAdjacentGemsTo(this.gridRow, this.gridCol));
    }
    
    this.getRowColStr = function()
    {
        return ("Row: " + this.gridRow + " Col: " + this.gridCol);
    }
    
    /*
     * Input Events
    */
    this.onGemInputStart = function(event, point)
    {
        if (this.grid.inputLocked() == true) return;
        
        //If no gem is currently grabbed, grab this one
        if (this.grid.heldGem == null)
        {
            this.grid.grabGem(this);
        }
        //Cover all other cases
        else
        {
            var found = false;
            
            //Get adjacent gems to the held one
            var adjacent = this.grid.heldGem.getAdjacentGems();
            
            for (var i = 0; i < adjacent.length; i++)
            {
                //console.log("Type of adjacent: " + typeof(adjacent[i]));
                //console.log("Type of this: " + typeof(this));
                
                //console.log("Adjacent - " + adjacent[i].getRowColStr());
                //console.log("This - " + this.getRowColStr());
                
                if (this == adjacent[i])
                {
                    console.log("Found adjacent gem");
                    found = true;
                    
                    //Swap gems
                    this.grid.swapGems(this.grid.heldGem, this);
                    
                    break;
                }
            }
            
            //Drop the gem if it's not an adjacent one
            if (found == false) this.grid.dropGem();
        }
    }
});
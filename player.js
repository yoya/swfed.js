var SWFPlayer = function(canvas, swfed) {
    var currentFrames = 0;
    var currentTagNum = 0;
    var swfheader = swfed.swfheader;
    var swfmovieheader = swfed.swfmovieheader;
    var swftags = swfed.swftags;
    var frameCount = swfmovieheader.FrameCount;
    new swfcontents = new SWFContents();
    this.play = function(completed) {
        var framesLoaded = swfed.framesLoaded;
        done = false;
        for (var i = 0, n = swftags.length ; i < n ; i++) {
            if (currentFrame >= framedLoaded) {
                if (currentFrame > framedLoaded) {
                    console.error("currentFrame("+currentFrame+") > framedLoaded("+framedLoaded+")");
                }
                break;
            }
            var swftag = swftags[i];
            switch (swftag.tag_code) {
	      case 1: // ShowFrame
                currentFrames++;
	        break;
              case 9: // SetBackGroundColor
	        canvas.setBackgroundColor(swftag.BackgroundColor);
	        break;
         }
      }
    }
}

var SWFContents = function() {
    var ContentTable = {};
    this.addContent = function(swftag) {
        ;
    }

}

var SWFMovieClip = function(name) {
    this.addChild = function(movieclip) {
        ;
    }
    this.ticks = function() {
    }
}

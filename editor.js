// var SWFScheduler = function(url) { ; }

var SWFEditor = function() {
    this.load = function(swf_url) {
	new SWFLoader(swf_url, new SWFParser(this));
    }
    this.input = function(swf_data) {
	new SWFParser(this).input(swf_data);
    }
    this.progress = function(a, b) {
	console.debug("progress:"+a+"/"+b);
    }
    // I hope override this main function.
    this.main = function(swfheader, swftags) {
	console.error("SWFEditor::main < override me!");
    }
    this.dump = function(swfheader, swftags) {
	this.swfheeader = swfheader;
	this.swftags = swftags;
	console.debug(swfheader);
	for (var i = 0, n = swftags.length ; i < n ; i++) {
	    swftag = swftags[i];
	    console.debug('code:'+swftag.code+' length:'+swftag.length+' data:');
	    if (swftag.data) {
		console.debug(swftag.data);
	    }
	}
    }
}

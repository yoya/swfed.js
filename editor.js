// var SWFScheduler = function(url) { ; }

var SWFEditor = function() {
    this.load = function(swf_url, main, progress) {
	this.main = main;
	this.progress = progress;
	new SWFLoader(swf_url, new SWFParser(this));
    }
    this.input = function(swf_data) {
	new SWFParser(this).input(swf_data);
    }
    this.dump = function() {
	var swfheader = this.swfheader;
	var swftags   = this.swftags;
	console.debug(swfheader);
	for (var i = 0, n = swftags.length ; i < n ; i++) {
	    swftag = swftags[i];
	    console.debug('code:'+swftag.code+' length:'+swftag.length);
	    if (swftag.data) {
		console.debug(swftag.data);
	    }
	}
    }
}

// var SWFScheduler = function(url) { ; }

var SWFEditor = function() {
    this.load = function(swf_url, main, progress) {
	this.main = main;
	this.progress = progress;
	var loader = new SWFLoader();
        loader.load(swf_url, new SWFParser(this))
    }
    this.save = function(swf_url, data) {
	var loader = new SWFLoader();
        loader.save(swf_url, data);
    }
    this.input = function(swf_data) {
	new SWFParser(this).input(swf_data);
    }
    this.dump = function() {
	var swfheader = this.swfheader;
	var swfmovieheader = this.swfmovieheader;
	var swftags   = this.swftags;
	console.log(swfheader);
	console.log(swfmovieheader);
	for (var i = 0, n = swftags.length ; i < n ; i++) {
	    swftag = swftags[i];
	    console.log('code:'+swftag.code+' length:'+swftag.length);
	    if (swftag.data) {
		console.log(swftag.data);
	    }
	}
    }
    this.output = function() {
        var builder = new SWFBuilder(this.swfheader, this.swfmovieheader, this.swftags);
        return builder.output();
    }
}

var SWFLoader = function(url, parser){
    var req = new XMLHttpRequest();
    req.parser = parser;
    if (req) {
	req.onreadystatechange = function(hoge) {
	    if (req.readyState > 1) {
		if (req.status == 200) {
		    if (req.readyState < 4) {
			this.parser.input(req.responseText); // read partial
			this.parser.progress(false)
		    } else {
			this.parser.input(req.responseText); // read completed
			this.parser.progress(true) // finish
		    }
		} else {
		    // alert('failed to load file:'+url+' code:'+req.status);
		}
	    }
	}
	req.open('GET', url);
	// http://javascript.g.hatena.ne.jp/edvakf/20100607/1275931930
	req.overrideMimeType('text/plain; charset=x-user-defined');
	req.send(null);
    }
}

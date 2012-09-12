/*
 * 2012/01/03- (c) yoya@awm.jp
 */

var SWFLoader = function(){
    var error_notified = false;
    this.load = function(url, parser) {
        var req = new XMLHttpRequest();
        if (req) {
            req.onreadystatechange = function(hoge) {
                if (req.readyState > 1) {
                    if (req.status == 200) {
                        if (req.readyState < 4) {
                            parser.input(req.responseText, false); // read partial
                            parser.progress(false);
                        } else {
                            parser.input(req.responseText, true); // read completed
                            parser.progress(true); // finish
                        }
                    } else {
                        if (error_notified === false)  {
                            alert('failed to load file:'+url+' code:'+req.status);
                            error_notified = true;
                        }
                    }
                }
            }
            req.open('GET', url);
            // http://javascript.g.hatena.ne.jp/edvakf/20100607/1275931930
            req.overrideMimeType('text/plain; charset=x-user-defined');
            req.send(null);
        }
    }
    this.save = function(url, data, listener) {
        var req = new XMLHttpRequest();
        if (req) {
            req.onreadystatechange = function(hoge) {
                if (req.readyState > 1) {
                    if (req.status == 200) {
                        if (req.readyState < 4) {
                            listener.progress(false);
                        } else {
                            listener.input(req.responseText); // read completed
                            listener.progress(true); // finish
                        }
                    } else {
                        alert('failed to load file:'+url+' code:'+req.status);
                    }
                }
            }
            req.open('POST', url);
            req.setRequestHeader("Content-Type", "multipart/form-data");
            req.setRequestHeader("Content-Length", data.length);
            req.send(data);
        }
    }
}

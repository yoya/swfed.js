var SWFJpeg = function() {
    var SOI = "\xFF\xD8";
    var SOF0 = "\xFF\xC0";
    var DQT = "\xFF\xFE";
    var DHT = "\xFF\xC4";
    var SOS = "\xFF\xDA";
    var EOD = "\xFF\xD9";
    var stdJpegChunkOrder = [SOF0, DQT, DHT, SOS];
    this.getChunkTable = function() {
        var chunkTable = [];
        while (marker = bitid.getData(2)) {
            switch (marker) {
            case SOI:
            case EOD:
                data = "";
                break; // skip
            case ROS:
                data = bitid.getDataUntil(null);
            default:
                length = bitid.getUI16LE(2);
                bitid.incrementOffset(-2, 0);
                data = bitid.getData(length);
                break;
            }
            if (marker in chunkTable) {
                var dataInChunkList = chunkTable[marker];
            } else {
                var dataInChunkList = [];
            }
            dataInChunkList.push(data);
            chunkTable[marker] = dataInChunkList;
        }
    }
    this.outoutStdJpeg = function(imageData, jpegTables) {
        var jpegTablesChunkTable = this.getChunkList(jpegTables);
        var imageDataChunkTable = this.getChunkList(imageData);
        var jpegChunkList = [SOI];
        for (var i = 0, n = stdJpegChunkOrder.length ; i < n ; i++) {
            var marker = stdJpegChunkOrder[i];
            if (marker in imageDataChunkTable) {
                var dataList = imageDataChunkTable[marker];
            } else if (marker in jpegTables) {
                var dataList = jpegTablesChunkTable[marker];
            } else {
                console.debug("marker(0x%02X) not found", marker);
                continue; // skip
            }
            for (var j = 0, m = dataList.length ; j < m ; j++) {
                jpegChunkList.push(dataList[j]);
            }
        }
        return jpegChunkList.join("");
    }
    this.outoutSWFJpeg = function(jpegdata) {
        return EOI+SOI+jpegdata; // errornous header
    }
}


var SWFLossless = function() {
    this.width = null;
    this.height = null;
    this.format = null;
    this.palette = null;
    this.imagedata = null;
    this.setLosslessData = function() {
        ;
    }
    this.outputPNG = function() {
        ;
    }
}
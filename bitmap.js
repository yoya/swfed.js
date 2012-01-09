var SWFJpeg = function() {
    var SOI  = 0xFFD8;
    var SOF0 = 0xFFC0;
    var DQT  = 0xFFFE;
    var DHT  = 0xFFC4;
    var SOS  = 0xFFDA;
    var EOD  = 0xFFD9;
    var stdJpegChunkOrder = [SOF0, DQT, DHT, SOS];
    this.getChunkTable = function(jpegdata) {
        if (jpegdata == null) {
            return null;
        }
        var chunkTable = {};
        bs = new Bitstream();
        bs.input(jpegdata);
        while (marker = bs.getUI16BE()) {
            switch (marker) {
            case SOI:
            case EOD:
                data = "";
                break; // skip
            case SOS:
                bs.incrementOffset(-2, 0);
                data = bs.getDataUntil(null);
                break;
            default:
                length = bs.getUI16BE(2);
                bs.incrementOffset(-4, 0);
                data = bs.getData(length + 2);
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
        console.debug(chunkTable);
        return chunkTable;
    }
    this.outputStdJpeg = function(imageData, jpegTables) {
        var jpegTablesChunkTable = this.getChunkTable(jpegTables);
        var imageDataChunkTable = this.getChunkTable(imageData);
        var jpegChunkList = [SOI];
        for (var i = 0, n = stdJpegChunkOrder.length ; i < n ; i++) {
            var marker = stdJpegChunkOrder[i];
            if (marker in imageDataChunkTable) {
                var dataList = imageDataChunkTable[marker];
            } else if (jpegTablesChunkTable) {
                if (marker in jpegTablesChunkTable) {
                    var dataList = jpegTablesChunkTable[marker];
                }
            } else {
                console.error("marker(0x%02X) not found", marker);
                console.error(marker);
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
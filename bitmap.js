var SWFJpeg = function() {
    var SOI  = 0xFFD8;
    var SOF0 = 0xFFC0;
    var DQT  = 0xFFDB;
    var DHT  = 0xFFC4;
    var SOS  = 0xFFDA;
    var EOI  = 0xFFD9;
    var stdJpegChunkOrder = [SOF0, DQT, DHT, SOS];
    this.dumpChunk = function(jpegdata) {
        console.debug(this.getChunkTable(jpegdata));
    }
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
            case EOI:
                data = bs.fromUI16BE(marker);
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
        return chunkTable;
    }
    this.outputStdJpeg = function(imageData, jpegTables) {
        var jpegTablesChunkTable = this.getChunkTable(jpegTables);
        var imageDataChunkTable = this.getChunkTable(imageData);
        bs = new Bitstream();
        var jpegChunkList = [bs.fromUI16BE(SOI)];
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
    var COLOR_TYPE_RGB = 2;
    var COLOR_TYPE_PALETTE = 3;
    var COLOR_TYPE_RGB_ALPHA =  6;
    this.losslessToPNG = function(tag_code, format, width, height, colortablesize, zlibbitmap) {
        bs = new Bitstream();
        var pngdata = ["\x89PNG\r\n\x1A\n"]; // header
        if (format === 3) { // palette
            colorType = COLOR_TYPE_PALETTE;
        } else if (tag_code === 20) { // 15bit or 24bit color
            colorType = COLOR_TYPE_RGB;
        } else { // 32bit or 24bit color
            colorType = COLOR_TYPE_RGB_ALPHA;
        }
        pngdata.push("IHDR", bs.fromUI32(width), bs.fromUI32(height), "\8", String.fromCharCode(colorType), "\0\0\0");
        if (format === 3) { // palette format
            if (tag_code === 20) {// no transparent
                ;
            } else {
                ;
            }
        } else if (format === 4) {// 15bit color 
            console.error("DefineBitsLossless format 4 is not implemented yet.");
        } else { // 32bit or 24bit color
            ;
        }
        return pngdata.join("");
    }
}
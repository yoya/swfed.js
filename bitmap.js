/*
 * 2012/01/10- (c) yoya@awm.jp
 */

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
    this.losslessToPNG = function(tag_code, format, width, height, colorTableSize, zlibBitmap) {
        bs = new Bitstream();
        var pngChunks = [];
        if (format === 3) { // palette
            var colorType = COLOR_TYPE_PALETTE;
        } else if (tag_code === 20) { // 15bit or 24bit color
            var colorType = COLOR_TYPE_RGB;
        } else { // 32bit or 24bit color
            var colorType = COLOR_TYPE_RGB_ALPHA;
        }
        var headerData = [bs.fromUI32BE(width), bs.fromUI32BE(height), "\x08", String.fromCharCode(colorType), "\0\0\0"].join("");
        pngChunks.push("IHDR" + headerData);
        var bitmapData = zlib_inflate(zlibBitmap);
        var idatData = [];
        if (format === 3) { // palette format
            if (tag_code === 20) {// no transparent
                var colorTableRGB = bitmapData.substr(0, 3 * colorTableSize);
                pngChunks.push("PLTE" + colorTableRGB);
                var colormapPixelDataOffset = 3 * colorTableSize;
            } else {
                var paletteData = [];
                var transData = [];
                for (var i = 0, n = 4 * colorTableSize; i < n ; i += 4) {
                    paletteData.push(bitmapData.substr(i, 3));
                    transData.push(bitmapData.substr(i+3, 1));
                }
                pngChunks.push("PLTE" + paletteData.join(''));
                pngChunks.push("tRNS" + transData.join(''));
                var colormapPixelDataOffset = 4 * colorTableSize;
            }
            var padding_width = (width % 4)?(4 - (width % 4)):0;
            for (var y = 0 ; y < height ; y++) {
                idatData.push("\0", bitmapData.substr(colormapPixelDataOffset, width));
                colormapPixelDataOffset += width + padding_width;
            }
        } else if (format === 4) {// 15bit color 
            var bitmapDataOffset = 1;
            var padding_width = (width % 2)?2:0;
            for (var y = 0 ; y < height ; y++) {
                idatData.push("\0");
                for (var x = 0 ; x < width ; x++) {
                    var rgb15 = bs.toUI16LE(bitmapData.substr(bitmapDataOffset, 2));
                    var r8 = (rgb15 >>> 7) & 0xf8;
                    var g8 = (rgb15 >>> 2) & 0xf8;
                    var b8 = (rgb15 <<  3) & 0xf8;
                    idatData.push(String.fromCharCode(r8),
                                  String.fromCharCode(g8),
                                  String.fromCharCode(b8));
                    bitmapDataOffset += 2;
                }
                bitmapDataOffset += padding_width;
            }
        } else { // 32bit or 24bit color
            if (tag_code === 20) {// no transparent
                var bitmapDataOffset = 1;
                for (var y = 0 ; y < height ; y++) {
                    idatData.push("\0");
                    for (var x = 0 ; x < width ; x++) {
                        idatData.push(bitmapData.substr(bitmapDataOffset, 3));                        
                        bitmapDataOffset += 4;
                    }
                }
            } else {
                var bitmapDataOffset = 0;
                for (var y = 0 ; y < height ; y++) {
                    idatData.push("\0");
                    for (var x = 0 ; x < width ; x++) {
                        idatData.push(bitmapData.substr(bitmapDataOffset+1, 3)); // RGB
                        idatData.push(bitmapData.substr(bitmapDataOffset, 1)); // ALPHA
                        bitmapDataOffset += 4;
                    }
                }
            }
        }
        var idatZlibData = zlib_deflate(idatData.join(""), 0, 0);
        pngChunks.push("IDAT" + idatZlibData);
        var pngChunksWithCRC32 = ["\x89PNG\r\n\x1A\n"]; // header
        for (var i = 0, n = pngChunks.length ; i < n ; i++) {
            var chunk = pngChunks[i];
            pngChunksWithCRC32.push(bs.fromUI32BE(chunk.length - 4));
            pngChunksWithCRC32.push(chunk);
            pngChunksWithCRC32.push(bs.fromUI32BE(crc32(chunk)));
        }
        delete colorType;
        return pngChunksWithCRC32.join("");
    }
}

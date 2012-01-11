var SWFParser = function(editor) {
    this.bs = null;
    this.swfheader = null;
    this.swfmovieheader = null;
    this.swftags = [];
    this.input = function(data, isCompleted) {
        if (typeof isCompleted === 'undefined') {
            isCompleted = true;
        }
	if (data.length < 16) {
	    return ; // skip
	}
	if (this.bs === null) {
	    this.bs = new Bitstream();
	}
	var bs = this.bs;
	bs.input(data);
        if (this.swfheader === null) {
	    this.parseHeader(bs);
	    editor.swfheader = this.swfheader;
        }
        console.debug(this.swfheader.Signature);
        if (this.swfheader.Signature === "CWS") {
        console.debug(isCompleted);
            if (isCompleted) {
                var header_data = data.substr(0, 8);
                var zlib_data = data.substr(10); // Zlib header skip (n=2)
                data2 = zip_inflate(zlib_data);
                bs.input(header_data + data2);
            } else {
                return ; // skip
            }            
        }
        console.debug("--====--");
        if (this.swfmovieheader === null) {
            this.parseMovieHeader(bs);
            editor.swfmovieheader = this.swfmovieheader;
	} 
        this.parseTags(bs);
        editor.swftags = this.swftags;
    }
    this.progress = function(completed) {
	if (completed) {
	    editor.main(this.swfheader, this.swfmovieheader, this.swftags);
	} else {
	    if (editor.progress && this.swfheader) {
		editor.progress(this.bs.byte_offset, this.swfheader.FileLength);
	    }
	}
    }
    this.parseHeader = function(bs) {
	//	console.debug('parseHeader');
	this.swfheader = new SWFHeader(bs);
    }
    this.parseMovieHeader = function(bs) {
	//	console.debug('parseMovieHeader');
	this.swfmovieheader = new SWFMovieHeader(bs);
    }
    this.parseTags = function() {
	//	console.debug('parseTags');
	var bs = this.bs;
	while (true) {
	    bs.byteAlign();
	    var tag_start_offset = bs.getOffset().byte_offset;
	    var data_length = bs.data.length;
	    if (tag_start_offset + 2 > data_length) {
		break;
	    }
	    var tag_and_length = bs.getUI16LE();
	    if (tag_and_length < 0) { // XXX
		console.error('tag_and_length:'+tag_and_length+' < 0');
	    }
	    var tag_code = tag_and_length >> 6;
	    var length = tag_and_length & 0x3f;
	    if (length === 0x3f) {
		if (tag_start_offset + 6 > data_length) {
		    bs.setOffset(tag_start_offset, 0);
		    break;
		}
		length = bs.getUI32LE();
	    }
	    if (tag_start_offset + length > data_length) {
		bs.setOffset(tag_start_offset, 0);
		break;
	    }
	    var tag_data_start_offset = bs.byte_offset;
	    var data = null;
	    switch (tag_code) {
	    case 0: // ShowFrame
                data = new SWFEnd(bs, tag_code);
		break;
	    case 1: // ShowFrame
                data = new SWFShowFrame(bs, tag_code);
		break;
	    case 2: // DefineShape
	    case 22: // DefineShape2
	    case 32: // DefineShape3
		data = new SWFDefineShape(bs, tag_code);
		break;
	    case 4: // PlaceObject
	    case 26: // PlaceObject2
		data = new SWFPlaceObject(bs, tag_code, length);
		break;
	    case 5: // RemoveObject
	    case 28: // RemoveObject2
		data = new SWFRemoveObject(bs, tag_code);
		break;
	    case 6: // DefineBits
	    case 21: // DefineBitsJPEG2
	    case 35: // DefineBitsJPEG3
		data = new SWFDefineBitsJPEG(bs, tag_code, length);
		break;
	    case 8: // JPEGTables
		data = new SWFJPEGTables(bs, tag_code, length);
		break;
	    case 9: // SetBackgroundColor
		data = new SWFSetBackgroundColor(bs, tag_code);
		break;
	    case 20: // DefineBitsLossless
	    case 36: // DefineBitsLossless2
		data = new SWFDefineBitsLossless(bs, tag_code, length);
		break;
	    default:
		data = new SWFUnknownTag(bs, tag_code, length);
		break;
	    }
	    var tag = {tag_code:tag_code, length:length, data:data};
	    this.swftags.push(tag);
	    bs.setOffset(tag_data_start_offset + length, 0);
	    if (tag_code === 0) { // End
		break;
	    }
	}
    }
}

/*
 * 2012/01/03- (c) yoya@awm.jp
 */

var SWFParser = function(editor) {
    this.bs = null;
    this.swfheader = null;
    this.swfmovieheader = null;
    this.swftags = [];
    if (editor) {
        editor.framesLoaded = 0;
    }
    this.framesLoaded = 0;
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
	    this.swfheader = this.parseHeader(bs);
	    editor.swfheader = this.swfheader;
        }
        if (this.swfheader.Signature === "CWS") {
            if (isCompleted) {
                var header_data = data.substr(0, 8);
                var movie_data = zlib_inflate(data, 8);
                bs.input(header_data + movie_data);
            } else {
                return ; // skip
            }            
        }
        if (this.swfmovieheader === null) {
            this.swfmovieheader = this.parseMovieHeader(bs);
            editor.swfmovieheader = this.swfmovieheader;
	} 
        this.swftags = this.parseTags(bs);
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
	return new SWFHeader(bs);
    }
    this.parseMovieHeader = function(bs) {
	//	console.debug('parseMovieHeader');
	return new SWFMovieHeader(bs);
    }
    this.parseTags = function(bs) {
	//	console.debug('parseTags');
        var swftags = [];
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
	    var tag = null;
	    switch (tag_code) {
	    case 0: // ShowFrame
                tag = new SWFEnd(bs, tag_code, length);
		break;
	    case 1: // ShowFrame
                tag = new SWFShowFrame(bs, tag_code, length);
                this.framesLoaded++;
                if (editor) {
                    editor.framesLoaded++;
                }
		break;
	    case 2: // DefineShape
	    case 22: // DefineShape2
	    case 32: // DefineShape3
		tag = new SWFDefineShape(bs, tag_code, length);
		break;
	    case 4: // PlaceObject
	    case 26: // PlaceObject2
		tag = new SWFPlaceObject(bs, tag_code, length);
		break;
	    case 5: // RemoveObject
	    case 28: // RemoveObject2
		tag = new SWFRemoveObject(bs, tag_code, length);
		break;
	    case 6: // DefineBits
	    case 21: // DefineBitsJPEG2
	    case 35: // DefineBitsJPEG3
		tag = new SWFDefineBitsJPEG(bs, tag_code, length);
		break;
	    case 8: // JPEGTables
		tag = new SWFJPEGTables(bs, tag_code, length);
		break;
	    case 9: // SetBackgroundColor
		tag = new SWFSetBackgroundColor(bs, tag_code, length);
		break;
	    case 10: // DefineFont
	    case 48: // DefineFont2
		tag = new SWFDefineFont(bs, tag_code, length);
		break;
	    case 12: // DoAction
		tag = new SWFDoAction(bs, tag_code, length);
		break;
	    case 20: // DefineBitsLossless
	    case 36: // DefineBitsLossless2
		tag = new SWFDefineBitsLossless(bs, tag_code, length);
		break;
	    case 24: // Protect
		tag = new SWFProtect(bs, tag_code, length);
		break;
            case 37: // DefineEditText
		tag = new SWFDefineEditText(bs, tag_code, length);
		break;
	    case 39: // DefineSprite
		tag = new SWFDefineSprite(bs, tag_code, length);
		break;
	    case 43: // FrameLabel
		tag = new SWFFrameLabel(bs, tag_code, length);
		break;
	    case 46: // DefineMorphShape
		tag = new SWFDefineMorphShape(bs, tag_code, length);
		break;
	    default:
		tag = new SWFUnknownTag(bs, tag_code, length);
		break;
	    }
	    swftags.push(tag);
	    bs.setOffset(tag_data_start_offset + length, 0);
	    if (tag_code === 0) { // End
		break;
	    }
	}
        return swftags;
    }
}

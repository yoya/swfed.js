var SWFParser = function(editor) {
    this.bs = null;
    this.swfheader = null;
    this.swftags = [];
    this.editor = editor;
    this.input = function(data, isCompleted) {
	if (data.length < 8) {
	    return ; // skip
	}
	if (this.bs === null) {
	    //	    console.debug('this.bs === null');
	    this.bs = new Bitstream();
	}
	var bs = this.bs;
	bs.input(data);
	//	console.debug('bs.byte_offset:'+bs.byte_offset+' < 8');
	if (bs.byte_offset < 8) {
	    this.parseHeader(bs);
	}
	this.parseTags(bs);
    }
    this.progress = function(completed) {
	if (completed) {
	    this.editor.main(this.swfheader, this.swftags);
	} else {
	    if ('progress' in editor && this.swfheader && 'FileLength' in this.swfheader) {
		editor.progress(this.bs.byte_offset, this.swfheader.FileLength);
	    }
	}
    }
    this.parseHeader = function(bs) {
	//	console.debug('parseHeader');
	this.swfheader = new SWFHeader(bs);
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
	    case 2: // DefineShape
	    case 22: // DefineShape2
	    case 32: // DefineShape3
		data = this.parseTagDefineShape(bs, tag_code);
		break;
	    case 9: // SetBackgroundColor
		data = this.parseTagSetBackgroundColor(bs, tag_code);
		break;
	    case 6: // DefineBits
	    case 21: // DefineBitsJPEG2
		data = this.parseTagDefineBitsJPEG(bs, tag_code, length)
		break;
	    case 777: // rfx (swftools)
		data = bs.getData(length);
	    default:
		;; // nothing to do
	    }
	    var tag = {code:tag_code, length:length, data:data};
	    this.swftags.push(tag);
	    bs.setOffset(tag_data_start_offset + length, 0);
	    if (tag_code === 0) { // End
		break;
	    }
	}
    }
    // 2, ?, ?
    this.parseTagDefineShape = function(bs, tag_code) {
	return new SWFDefineShape(bs, tag_code);
    }
    //
    this.parseTagSetBackgroundColor = function(bs, tag_code) {
	return new SWFSetBackgroundColor(bs);
    }
    // ?, 21, ?
    this.parseTagDefineBitsJPEG = function(bs, tag_code, length) {
	if (tag_code < 35)  {
	    return new SWFDefineBitsJPEG2(bs, length);
	}
    }
    // ?, 26
    this.parseTagPlaceObject = function(bs, tag_code) {
	if (tag_code === 26) {
	    return new SWFPlaceObject2(bs, length);
	}
    }
}

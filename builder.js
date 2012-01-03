var SWFBuilder = function(swfheader, swftags) {
    this.swfheader = swfheader;
    this.swftags = swftags;
    this.output = function() {
	var bs = new Bitstream();
        this.buildHeader(bs);
        this.buildTags(bs);
    }
    this.buildHeader = function(bs) {
	this.swfheader.build(bs);
    }
    this.buildTags = function(bs) {
	for (var i = 0, n = this.swftags.length ; i < n ; i++) {
            bs.byteAlign();
            var swftag = this.swftags[i];
            var tag_code = swftag.tag_code;
            var bs_tag = new Bitstream();
            swftag.build(bs_tag);
            var data = bs_tag.output();
            var length = data.length;
            switch (tag_code) {
              case 6:  // DefineBitsJPEG
              case 21: // DefineBitsJPEG2
              case 35: // DefineBitsJPEG3
              case 20: // DefineBitsLossless
              case 36: // DefineBitsLossless2
              case 19: // SoundStreamBlock
                var longFormat = true;
                break;
              default:
                var longFormat = false;
                break;
            }
            if ((longFormat === false) || (length < 0x3f)) {
                var tagAndLength = (tag_code << 6) | length;
                bs.putUI16LE(tagAndLength);
            } else {
                var tagAndLength = (tag_code << 6) | 0x3f;
                bs.putUI16LE(tagAndLength);
                bs.putUI32LE(length);
            }
            bs.putData(data);
	}
    }
}

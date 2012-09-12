/*
 * 2012/01/03- (c) yoya@awm.jp
 */

var SWFBuilder = function(swfheader, swfmovieheader, swftags) {
    this.swfheader = swfheader;
    this.swfmovieheader = swfmovieheader;
    this.swftags = swftags;
    this.output = function() {
	var bs_header = new Bitstream();
	var bs_movie = new Bitstream();
        this.buildMovieHeader(bs_movie, this.swfmovieheader);
        this.buildTags(bs_movie, this.swftags);
        var movie_data = bs_movie.output();
        this.swfheader.FileLength = 8 + movie_data.length;
        this.buildHeader(bs_header, this.swfheader);
        return bs_header.output()+movie_data;
    }
    this.buildHeader = function(bs, swfheader) {
	swfheader.build(bs);
    }
    this.buildMovieHeader = function(bs, swfmovieheader) {
	swfmovieheader.build(bs);
    }
    this.buildTags = function(bs, swftags) {
	for (var i = 0, n = swftags.length ; i < n ; i++) {
            bs.byteAlign();
            var swftag = swftags[i];
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
            if ((longFormat === false) && (length < 0x3f)) {
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

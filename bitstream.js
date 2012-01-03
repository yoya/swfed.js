var Bitstream = function() {
    this.data = null;
    this.byte_offset = 0;
    this.bit_offset = 0;
    this.input = function(data) {
	this.data = data;
    }
    this.byteAlign = function(n) {
	if (this.bit_offset) {
	    this.byte_offset += ((this.bit_offset+7)/8) | 0;
	    this.bit_offset = 0;
	}
    }
    this.byteCarry = function() {
	if (this.bit_offset > 7) {
	    this.byte_offset += ((this.bit_offset+7)/8) | 0;
	    this.bit_offset &= 0x07;
	} else {
	    while (this.bit_offset < 0) { // XXX
		this.byte_offset --;
		this.bit_offset += 8;
	    }
	}

    }
    this.getData = function(n) {
	this.byteAlign();
	bo = this.byte_offset;
	ret = this.data.substr(bo, n);
	this.byte_offset = bo + n;
	return ret;
    }
    this.getUI8 = function() {
	this.byteAlign();
	return this.data.charCodeAt(this.byte_offset++) & 0xff;
    }
    this.getUI16LE = function() {
	this.byteAlign();
	return (this.data.charCodeAt(this.byte_offset++) & 0xff |
		(this.data.charCodeAt(this.byte_offset++) & 0xff) << 8);
    }
    this.getUI32LE = function() {
	this.byteAlign();
	return (this.data.charCodeAt(this.byte_offset++) & 0xff |
		(this.data.charCodeAt(this.byte_offset++) & 0xff |
		 (this.data.charCodeAt(this.byte_offset++) & 0xff |
		  (this.data.charCodeAt(this.byte_offset++) & 0xff)
		  << 8) << 8) << 8);
    }
    this.getUIBit = function() {
	this.byteCarry();
	return (this.data.charCodeAt(this.byte_offset) >> (7 - this.bit_offset++)) & 0x1;
    }
    this.getUIBits = function(n) {
	var value = 0;
	while (n--) {
	    value <<= 1;
	    value |= this.getUIBit();
	}
	return value;
    }
    this.getSIBits = function(n) {
	var value = this.getUIBits(n);
	var msb = value & (0x1 << (n-1));
	if (msb) {
	    var bitmask = (2 * msb) - 1;
            return  - (value ^ bitmask) - 1;
	}
	return value;
    }
    this.setOffset = function(byte_offset, bit_offset) {
	this.byte_offset = byte_offset;
	this.bit_offset  = bit_offset;
    }
    this.getOffset = function() {
	return { byte_offset:this.byte_offset,
		 bit_offset:this.bit_offset };
    }
    this.incrementOffset = function(byte_incr, bit_incr) {
	this.byte_offset += byte_incr;
	this.bit_offset += bit_incr;
	this.byteCarry();
    }
}

/*
 * 2012/01/03- (c) yoya@awm.jp
 */

var Bitstream = function() {
    this.data = '';
    this.byteOffset = 0;
    this.bitOffset = 0;
    this.workBits = 0;
    this.input = function(data) {
	this.data = data;
    }
    this.output = function() {
        this.byteAlign(); // XXX
        var data = this.data;
        var data_len = data.length;
        if (this.byteOffset === data.length) {
            return data;
        }
        if (this.byteOffset < data.length) {
            console.warn("this.byteOffset"+this.byteOffset+" < data.length("+data.length+")");
            return data.substr(0, this.byteOffset)
        }
        console.error("this.byteOffset"+this.byteOffset+" > data.length("+data.length+")");
        return data;
    }
    this.byteAlign = function() {
	if (this.bitOffset) {
	    this.byteOffset += ((this.bitOffset+7)/8) | 0;
	    this.bitOffset = 0;
            if (this.data.length + 1 === this.byteOffset) {
                this.data += String.fromCharCode(this.workBits);
                this.workBits = 0;
            }
	}
    }
    this.byteCarry = function() {
	if (this.bitOffset > 7) {
	    this.byteOffset += ((this.bitOffset+7)/8) | 0;
	    this.bitOffset &= 0x07;
	} else {
	    while (this.bitOffset < 0) { // XXX
		this.byteOffset --;
		this.bitOffset += 8;
	    }
	}
    }

    /*
     * get function
     */
    this.getData = function(n) {
	this.byteAlign();
	bo = this.byteOffset;
	ret = this.data.substr(bo, n);
	this.byteOffset = bo + n;
	return ret;
    }
    this.getDataUntil = function(delim) {
	this.byteAlign();
	var bo = this.byteOffset;
        if ((delim === null) || (delim === false)) {
            var delimOffset = -1;
        } else {
            var delimOffset = this.data.indexOf(delim, bo);
        }
	if (delimOffset === -1) {
	    var n = this.data.length - bo;
	} else {
	    var n = delimOffset - bo;
	}
	ret = this.data.substr(bo, n);
	this.byteOffset = bo + n;
	if ((delimOffset !== -1) && (delim.length > 0)) {
	    this.byteOffset += delim.length;
	}
	return ret;
    }
    this.getUI8 = function() {
	this.byteAlign();
	return this.data.charCodeAt(this.byteOffset++) & 0xff;
    }
    this.getUI16LE = function() {
	this.byteAlign();
	return (this.data.charCodeAt(this.byteOffset++) & 0xff |
		(this.data.charCodeAt(this.byteOffset++) & 0xff) << 8);
    }
    this.getUI32LE = function() {
	this.byteAlign();
	return (this.data.charCodeAt(this.byteOffset++) & 0xff |
		(this.data.charCodeAt(this.byteOffset++) & 0xff |
		 (this.data.charCodeAt(this.byteOffset++) & 0xff |
		  (this.data.charCodeAt(this.byteOffset++) & 0xff)
		  << 8) << 8) << 8);
    }
    this.getUI16BE = function() {
	this.byteAlign();
	return (((this.data.charCodeAt(this.byteOffset++) & 0xff) << 8) |
                (this.data.charCodeAt(this.byteOffset++) & 0xff));
    }

    this.getUIBit = function() {
	this.byteCarry();
	return (this.data.charCodeAt(this.byteOffset) >> (7 - this.bitOffset++)) & 0x1;
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

    /*
     * put function
     */
    this.putData = function(data, n) {
	this.byteAlign();
        data_len = data.length;
        if (n === null) {
            if (data_len < n) {
                this.data += data.substr(0, n);
            } else {
                while (data_len++ < n) {
                    this.data += "\0";
                }
            }
        } else {
            this.data += data;
            n = data_len;
        }
	this.byteOffset += n;
	return ret;
    }
    this.putUI8 = function(value) {
	this.byteAlign();
        this.data += String.fromCharCode(value & 0xff);
        this.byteOffset++;
    }
    this.putUI16LE = function(value) {
	this.byteAlign();
        var v0 = value & 0xff; value >>= 8;
        var v1 = value & 0xff;
        this.data += String.fromCharCode(v0, v1);
        this.byteOffset += 2;
    }
    this.putUI32LE = function(value) {
	this.byteAlign();
        var v0 = value & 0xff; value >>= 8;
        var v1 = value & 0xff; value >>= 8;
        var v2 = value & 0xff; value >>= 8;
        var v3 = value & 0xff;
        this.data += String.fromCharCode(v0, v1, v2, v3);
        this.byteOffset += 4;
    }
    this.putUIBit = function(bit) {
	this.byteCarry();
        var value = this.data.charCodeAt(this.byteOffset) & 0xff;
        this.workBits |= bit << (7 - this.bitOffset);
        this.bitOffset++;
        if (this.bitOffset === 8) {
            this.byteCarry();
            this.data += String.fromCharCode(this.workBits);
            this.workBits = 0;
        }
    }
    this.putUIBits = function(value, n) {
	while (n--) {
	    this.putUIBit((value >> n) & 1);
	}
    }
    this.putSIBits = function(value, n) {
        if (value < 0) {
            var msb = 1 << (n - 1);
	    var bitmask = (2 * msb) - 1;
            value = (-value  - 1) ^ bitmask;
	}
	this.putUIBits(value, n);
    }

    /*
     * convert
     */

    this.toUI16LE = function(data) {
        return  (data.charCodeAt(0) & 0xff) + ((data.charCodeAt(1) & 0xff) << 8);
    }
    this.toUI16BE = function(data) {
        return ((data.charCodeAt(0) & 0xff) << 8) + (data.charCodeAt(1) & 0xff);
    }

    this.fromUI16LE = function(value) {
        return String.fromCharCode(value & 0xff) + String.fromCharCode(value >> 8);
    }
    this.fromUI16BE = function(value) {
        return String.fromCharCode(value >> 8) + String.fromCharCode(value & 0xff);
    }
    this.fromUI32LE = function(value) {
        return String.fromCharCode(value & 0xff) + String.fromCharCode((value >> 8) & 0xff) + String.fromCharCode((value >> 16) & 0xff) + String.fromCharCode(value >> 24);
    }
    this.fromUI32BE = function(value) {
        return String.fromCharCode(value >> 24) + String.fromCharCode((value >> 16) & 0xff) + String.fromCharCode((value >> 8) & 0xff) + String.fromCharCode(value & 0xff);
    }

    /*
     * set function
     */
    this.setUI16LE = function(value, byteOffset) {
        var data_head = this.data.substr(0, byteOffset);
        var data_tail = this.data.substr(byteOffset + 2);
        this.data = data_head + this.fromUI16LE(value) + data_tail;
    }
    this.setUI32LE = function(value, byteOffset) {
        console.debug("setUI32LE: value="+value+", byteOffset="+byteOffset);
        var data_head = this.data.substr(0, byteOffset);
        var data_tail = this.data.substr(byteOffset + 4);
        console.debug("debug_length:"+this.fromUI32LE(value).length);
        this.data = data_head + this.fromUI32LE(value) + data_tail;
    }

    /*
     * need
     */

    this.need_bits_unsigned = function(n) {
        for (var i = 0 ; n ; i++) {
            n >>= 1;
        }
        return i;
    }
    this.need_bits_signed = function(n) {
        if (n < -1) {
            n = -1 - n;
        }
        if (n >= 0) {
            for (var i = 0 ; n ; i++) {
                n >>= 1;
            }
            ret = 1 + i;
        } else { // n == -1
            ret = 1;
        }
        return ret;
    }
    
    /*
     * seek
     */
    this.setOffset = function(byteOffset, bitOffset) {
	this.byteOffset = byteOffset;
	this.bitOffset  = bitOffset;
    }
    this.getOffset = function() {
	return { byteOffset:this.byteOffset,
		 bitOffset:this.bitOffset };
    }
    this.incrementOffset = function(byteIncr, bitIncr) {
	this.byteOffset += byteIncr;
	this.bitOffset += bitIncr;
	this.byteCarry();
    }
}

var Bitstream = function() {
    this.data = '';
    this.byte_offset = 0;
    this.bit_offset = 0;
    this.work_bits = 0;
    this.input = function(data) {
	this.data = data;
    }
    this.output = function(data) {
        var data = this.data;
        var ret_data_len = (this.bit_offset)?this.byte_offset+1:this.byte_offset;
        if (ret_data_len < data.length) {
            return data.substr(0, ret_data_len);
        } else if (ret_data_len > data.length) {
            ; // XXX
        }
        return data;
    }
    this.byteAlign = function(n) {
	if (this.bit_offset) {
	    this.byte_offset += ((this.bit_offset+7)/8) | 0;
	    this.bit_offset = 0;
            if (this.data.length + 1 === this.byte_offset) {
                this.data += String.fromCharCode(this.work_bits);
                this.work_bits = 0;
            }
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

    /*
     * get function
     */
    this.getData = function(n) {
	this.byteAlign();
	bo = this.byte_offset;
	ret = this.data.substr(bo, n);
	this.byte_offset = bo + n;
	return ret;
    }
    this.getDataUntil = function(delim) {
	this.byteAlign();
	var bo = this.byte_offset;
	var delim_offset = this.data.indexOf(delim, bo);
	if (delim_offset === -1) {
	    var n = this.data.length - bo;
	} else {
	    var n = delim_offset - bo;
	}
	ret = this.data.substr(bo, n);
	this.byte_offset = bo + n;
	if ((delim_offset !== -1) && (delim.length > 0)) {
	    this.byte_offset = delim.length;
	}
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
	this.byte_offset += n;
	return ret;
    }
    this.putUI8 = function(value) {
	this.byteAlign();
        this.data += String.fromCharCode(value & 0xff);
        this.byte_offset++;
    }
    this.putUI16LE = function(value) {
	this.byteAlign();
        var v0 = value & 0xff; value >>= 8;
        var v1 = value & 0xff;
        this.data += String.fromCharCode(v0, v1);
        this.byte_offset += 2;
    }
    this.putUI32LE = function(value) {
	this.byteAlign();
        var v0 = value & 0xff; value >>= 8;
        var v1 = value & 0xff; value >>= 8;
        var v2 = value & 0xff; value >>= 8;
        var v3 = value & 0xff;
        this.data += String.fromCharCode(v0, v1, v2, v3);
        this.byte_offset += 4;
    }
    this.putUIBit = function(bit) {
	this.byteCarry();
        var value = this.data.charCodeAt(this.byte_offset) & 0xff;
        this.work_bits |= bit << (7 - this.bit_offset);
        this.bit_offset++;
        if (this.bit_offset === 8) {
            this.byteCarry();
            this.data += String.fromCharCode(this.work_bits);
            this.work_bits = 0;
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
     * set function
     */
    this.setUI16LE = function(value, byte_offset) {
        this.data[byte_offset++] = value & 0xff; value >>= 8;
        this.data[byte_offset  ] = value;
    }
    this.setUI32LE = function(value, byte_offset) {
        this.data[byte_offset++] = value & 0xff; value >>= 8;
        this.data[byte_offset++] = value & 0xff; value >>= 8;
        this.data[byte_offset++] = value & 0xff; value >>= 8;
        this.data[byte_offset  ] = value & 0xff;
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

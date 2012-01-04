/* Basic Structure */

    // SWF specific
var SWFRECT = function(bs) {
    if (bs) {
	bs.byteAlign();
	var Nbits = bs.getUIBits(5);
        this.Nbits = Nbits;
	this.Xmin = bs.getSIBits(Nbits);
	this.Xmax = bs.getSIBits(Nbits);
	this.Ymin = bs.getSIBits(Nbits);
	this.Ymax = bs.getSIBits(Nbits);
    }
    this.build = function(bs) {
        var XminBits = bs.need_bits_signed(this.Xmin);
        var XmaxBits = bs.need_bits_signed(this.Xmax);
        var YminBits = bs.need_bits_signed(this.Ymin);
        var YmaxBits = bs.need_bits_signed(this.Ymax);
        var Nbits = (XminBits > XmaxBits)?XminBits:XmaxBits;
        Nbits = (Nbits > YminBits)?Nbits:YminBits;
        Nbits = (Nbits > YmaxBits)?Nbits:YmaxBits;
	bs.putUIBits(Nbits, 5);
	bs.putSIBits(this.Xmin, Nbits);
        bs.putSIBits(this.Xmax, Nbits);
	bs.putSIBits(this.Ymin, Nbits);
	bs.putSIBits(this.Ymax, Nbits);
    }
}

var SWFMATRIX = function(bs) {
    if (bs) {
	bs.byteAlign();
	this.HasScale = bs.getUIBit();
	if (this.HasScale) {
	    var nScaleBits = bs.getUIBits(5);
	    this.NScaleBits = nScaleBits;
	    this.ScaleX = bs.getSIBits(nScaleBits);
	    this.ScaleY = bs.getSIBits(nScaleBits);
	} else {
	    this.ScaleX = 0x10000;
	    this.ScaleY = 0x10000;
        }
	this.HasRotate = bs.getUIBit();
	if (this.HasRotate) {
	    var nRotateBits = bs.getUIBits(5);
	    this.NRotateBits = nRotateBits;
	    this.RotateSkew0 = bs.getSIBits(nRotateBits);
	    this.RotateSkew1 = bs.getSIBits(nRotateBits);
	} else {
	    this.RotateSkew0 = 0;
	    this.RotateSkew1 = 0;
        }
	var nTranslateBits = bs.getUIBits(5);
	this.NTranslateBits = nTranslateBits;
	this.TranslateX = bs.getSIBits(nTranslateBits);
	this.TranslateY = bs.getSIBits(nTranslateBits);
        this.build = function(bs) {
            if ((this.ScaleX === 0x10000) && (this.ScaleY === 0x10000)) {
                bs.putUIBit(0); // HasScale
            } else {
                bs.putUIBit(1); // HasScale
                var scaleXBits = bs.need_bits_signed(this.ScaleX);
                var scaleYBits = bs.need_bits_signed(this.ScaleY);
                var nScaleBits = (scaleXBits > scaleYBits)?scaleXBits:scaleYBits;
                bs.putUIBits(nScaleBits, 5);
                bs.putSIBits(this.ScaleX, nScaleBits);
                bs.putSIBits(this.ScaleY, nScaleBits);
            }
            if ((this.RotateSkew0 === 0) && (this.RotateSkew1 === 0)) {
                bs.putUIBit(0);  // HasRotate
            } else {
                bs.putUIBit(1);  // HasRotate
                var rotateSkew0Bits = bs.need_bits_signed(this.RotateSkew0);
                var rotateSkew1Bits = bs.need_bits_signed(this.RotateSkew1);
                var nRotateBits = (rotateSkew0Bits > rotateSkew1Bits)?rotateSkew0Bits:rotateSkew1Bits;
                bs.putUIBits(nRotateBits, 5);
                bs.putSIBits(this.RotateSkew0, nRotateBits);
                bs.putSIBits(this.RotateSkew1, nRotateBits);
            }
            var translateXBits = bs.need_bits_signed(this.TranslateX);
            var translateYBits = bs.need_bits_signed(this.TranslateY);
            var nTranslateBits = (translateXBits > translateYBits)?translateXBits:translateYBits;
            bs.putUIBits(nTranslateBits, 5);
            bs.putSIBits(this.TranslateX, nTranslateBits);
            bs.putSIBits(this.TranslateY, nTranslateBits);
        }
    }
    this.toString = function() {
	text = '{';
	if (this.HasScale) {
	    text += "ScaleX:"+(this.ScaleX/0x10000)+" ScaleY:"+(this.ScaleY/0x10000);
	}
	if (this.HasRotate) {
	    if (this.HasScale) {
		text += " ";
	    }
	    text += "RotateSkew0:"+(this.RotateSkew0/0x10000)+" RotateSkey1:"+(this.RotateSkew1/0x10000);
	}
	if (this.HasScale || this.HasRotate) {
		text += " ";
	}
	return text + "TranslateX:"+(this.TranslateX/0x10000)+" TranslateY:"+(this.TranslateY/0x10000)+'}';
    }
}

var SWFRGB = function(bs) {
    if (bs) {
	this.Red = bs.getUI8();
	this.Green = bs.getUI8();
	this.Blue = bs.getUI8();
    }
    this.build = function(bs) {
	bs.putUI8(this.Red);
	bs.putUI8(this.Green);
	bs.putUI8(this.Blue);
    }
    this.toString = function() {
	return "{Red:"+this.Red+" Green:"+this.Green+" Blue:"+this.Blue+"}";
    }
    this.toStringCSS = function() {
        return 'rgb('+this.Red+','+this.Green+','+this.Blue+')';
    }
}


var SWFRGBA = function(bs) {
    if (bs) {
	this.Red   = bs.getUI8();
	this.Green = bs.getUI8();
	this.Blue  = bs.getUI8();
	this.Alpha = bs.getUI8();
    }
    this.build = function(bs) {
	bs.putUI8(this.Red);
	bs.putUI8(this.Green);
	bs.putUI8(this.Blue);
        bs.putUI8(this.Alpha);
    }
    this.toString = function() {
	return "{Red:"+this.Red+" Green:"+this.Green+" Blue:"+this.Blue+" Alpha:"+this.Alpha+"}";
    }
}

var SWFARGB = function(bs) {
    if (bs) {
	this.Alpha = bs.getUI8();
	this.Red   = bs.getUI8();
	this.Green = bs.getUI8();
	this.Blue  = bs.getUI8();
    }
    this.build = function(bs) {
        bs.putUI8(this.Alpha);
	bs.putUI8(this.Red);
	bs.putUI8(this.Green);
	bs.putUI8(this.Blue);
    }
    this.toString = function() {
	return "{Alpha:"+this.Alpha+" Red:"+this.Red+" Green:"+this.Green+" Blue:"+this.Blue+"}";
    }
}

var SWFGRADRECORD = function(bs, tag_code) {
    this.Ratio = bs.getUI8();
    if (tag_code < 32) { // DefineShape1or2
	this.Color = new SWFRGB(bs);
    } else { // DefineShape3
	this.Color = new SWFRGBA(bs);
    }
    this.build = function(bs) {
        this.Color.build(bs);
    }
}

var SWFGRADIENT = function(bs, tag_code) {
    if (bs) {
	bs.byteAlign();
	this.SpreadMode = bs.getUIBits(2);
	this.InterpolationMode = bs.getUIBits(2);
	var numGradients = bs.getUIBits(4);
	this.NumGradients = numGradients;
	var gradientRecords = [];
	for (i = 0 ; i < numGradients ; i++) {
	    gradientRecords.push(new SWFGRADRECORD(bs));
	}
	this.GradientRecords = gradientRecords;
    }
    this.build = function(bs) {
        bs.byteAlign();
	bs.putUIBitst(his.SpreadMode, 2);
	bs.putUIBits(this.InterpolationMode, 2);
        var gradientRecords = this.GradientRecords;
        var numGradients = gradientRecords.length;
        bs.putUIBits(numGradients, 4);
	for (i = 0 ; i < numGradients ; i++) {
	    gradientRecords[i].build(bs);
	}
    }
}

var SWFFILLSTYLE = function(bs, tag_code) {
    if (bs) {
	this.FillStyleType =  bs.getUI8();
	switch (this.FillStyleType) {
	case 0x00: // solid fill
	    if (tag_code < 32) { // DefineShape1or2
		this.Color = new SWFRGB(bs);
	    } else { // DefineShape3
		this.Color = new SWFRGBA(bs);
	    }
	    break;
	case 0x10: // linear gradient fill
	case 0x12: // radial gradient fill
	    this.GradientMatrix = new SWFMATRIX(bs);
	    this.Gradient = new SWFGRADIENT(bs);
	    break;
	case 0x13: // focal radial gradient fill
	    this.GradientMatrix = new SWFMATRIX(bs);
	    // this.Gradient = new SWFFOCALGRADIENT(bs);
	    break;
	case 0x40: // repeating bitmap fill
	case 0x41: // clipped bitmap fill
	case 0x42: // non-smoothed repeating bitmap
	case 0x43: // non-smoothed clipped bitmap
	    this.BitmapId = bs.getUI16LE();
	    this.BitmapMatrix = new SWFMATRIX(bs);
	    break;
	}
    }
    this.build = function(bs) {
	bs.putUI8(this.FillStyleType);
	switch (this.FillStyleType) {
	case 0x00: // solid fill
            this.Color.build(bs);
	    break;
	case 0x10: // linear gradient fill
	case 0x12: // radial gradient fill
	    this.GradientMatrix.build(bs);
	    this.Gradient.build(bs);
	    break;
	case 0x13: // focal radial gradient fill
	    this.GradientMatrix.build(bs);
	    this.Gradient.build(bs);
	    break;
	case 0x40: // repeating bitmap fill
	case 0x41: // clipped bitmap fill
	case 0x42: // non-smoothed repeating bitmap
	case 0x43: // non-smoothed clipped bitmap
	    bs.putUI16LE(this.BitmapId);
	    this.BitmapMatrix.build(bs);
	    break;
	}
    }
}

var SWFLINESTYLE = function(bs, tag_code) {
    if (bs) {
	this.Width = bs.getUI16LE();
	if (tag_code < 32) { // DefineShape1or2
	    this.Color = new SWFRGB(bs);
	} else { // DefineShape3
	    this.Color = new SWFRGBA(bs);
	}
    }
    this.build = function(bs) {
	bs.putUI16LE(this.Width);
        this.Color.build(bs);
    }
}

var SWFFILLSTYLEARRAY = function(bs, tag_code) {
    if (bs) {
	var fillStyleCount = bs.getUI8();
	if ((tag_code > 2) && (fillStyleCount === 0xff)) {
	    fillStyleCount = bs.getUI16LE();
	}
	this.FillStyleCount = fillStyleCount;
	var fillStyles = [];
	for (var i = 0 ; i < fillStyleCount ; i++) {
	    fillStyles.push(new SWFFILLSTYLE(bs, tag_code));
	}
	this.FillStyles = fillStyles;
    }
    this.build = function(bs, tag_code) {
        fillStyleCount = this.FillStyles.length;
	bs.putUI8(fillStyleCount);
	if ((tag_code > 2) && (fillStyleCount >= 0xff)) {
            bs.putUI8(0xff);
	    bs.putUI16LE(fillStyleCount);
	} else {
            bs.putUI8(fillStyleCount);
        }
	for (var i = 0 ; i < fillStyleCount ; i++) {
	    fillStyles[i].build(bs);
	}
    }
}

var SWFLINESTYLEARRAY = function(bs, tag_code) {
    if (bs) {
	var lineStyleCount = bs.getUI8();
	if ((tag_code > 2) && (lineStyleCount === 0xff)) {
	    lineStyleCount = bs.getUI16LE();
	}
	this.LineStyleCount = lineStyleCount;
	var lineStyles = [];
	for (var i = 0 ; i < lineStyleCount ; i++) {
	    lineStyles.push(new SWFLINESTYLE(bs, tag_code));
	}
	this.LineStyles = lineStyles;
    }
    this.build = function(bs, tag_code) {
        lineStyleCount = this.LineStyles.length;
	bs.putUI8(lineStyleCount);
	if ((tag_code > 2) && (lineStyleCount >= 0xff)) {
            bs.putUI8(0xff);
	    bs.putUI16LE(lineStyleCount);
	} else {
            bs.putUI8(lineStyleCount);
        }
	for (var i = 0 ; i < lineStyleCount ; i++) {
	    lineStyles[i].build(bs);
	}
    }
}

var SWFSHAPERECORDS = function(bs, tag_code, currentNumBits) {
    if (bs) {
	var first5Bits = bs.getUIBits(5);
	this.TypeFlag = (first5Bits >> 4) & 1;
	if (this.TypeFlag) { // Edge records
	    this.StraightFlag = (first5Bits >> 3) & 1;
	    var numBits = ((first5Bits & 0x07) << 1) | bs.getUIBit();
	    this.NumBits = numBits;
	    if (this.StraightFlag) { // StraightEdgeRecord
		this.GeneralLineFlag = bs.getUIBit();
		if (this.GeneralLineFlag) {
		    this.DeltaX = bs.getSIBits(numBits + 2);
		    this.DeltaY = bs.getSIBits(numBits + 2);
		} else {
		    this.VertLineFlag = bs.getUIBit();
		    if (this.VertLineFlag) {
			this.DeltaX = 0;
			this.DeltaY = bs.getSIBits(numBits + 2);
		    } else {
			this.DeltaX = bs.getSIBits(numBits + 2);
			this.DeltaY = 0;
		    }
		}
	    } else { // CurvedEdgeRecord
		this.ControlDeltaX = bs.getUIBits(numBits + 2);
		this.ControlDeltaY = bs.getUIBits(numBits + 2);
		this.AnchorDeltaX = bs.getUIBits(numBits + 2);
		this.AnchorDeltaY = bs.getUIBits(numBits + 2);
	    }
	} else if (first5Bits) { // StypeChangeRecord
	    this.StateNewStyles  = (first5Bits >> 3) & 1;
	    this.StateLineStyle  = (first5Bits >> 2) & 1;
	    this.StateFillStyle1 = (first5Bits >> 1) & 1;
	    this.StateFillStyle0 =  first5Bits       & 1;
	    this.StateMoveTo = bs.getUIBit();
	    if (this.StateMoveTo) {
		moveBits = bs.getUIBits(5);
		this.MoveBits = moveBits;
		this.MoveX = bs.getSIBits(moveBits); // MoveDeltaX
		this.MoveY = bs.getSIBits(moveBits); // MoveDeltaY
	    }
	    if (this.StateFillStyle0) {
		this.FillStyle0 = bs.getUIBits(currentNumBits.FillBits);
	    }
	    if (this.StateFillStyle1) {
		this.FillStyle0 = bs.getUIBits(currentNumBits.FillBits);
	    }
	    ; 
	    if (this.StateLineStyle) {
		this.LineStyle = bs.getUIBits(currentNumBits.LineBits);
	    }
	    ; 
	    if (this.StateNewStyles) {
		this.FillStyles = new SWFFILLSTYLEARRAY(bs, tag_code);
		this.LineStyles = new SWFLINESTYLEARRAY(bs, tag_code);
		var numBits = bs.getUI8();
		currentNumBits.FillBits = this.NumFillBits = numBits >> 4;
		currentNumBits.LineBits = this.NumLineBits = numBits & 0x0f;
	    }
	} else { // EndShapeRecord
	    this.EndOfShape = 0;
	}
    }
    this.build = function(bs, tag_code, currentNumBits) {
        bs.putUIBit(this.TypeFlag);
	if (this.TypeFlag) { // Edge records
            bs.putUIBit(this.StraightFlag);
	    if (this.StraightFlag) { // StraightEdgeRecord
                var deltaXBits = bs.need_bits_signed(this.DeltaX);
                var deltaYBits = bs.need_bits_signed(this.DeltaY);
                var numBits = (deltaXBits > deltaYBits)?deltaXBits:deltaYBits;
                if (numBits < 2) {
                    numBits = 0;
                } else {
                    numBits -= 2;
                }
                bs.putUIBits(numBits, 4);
		if (this.DeltaX && this.DeltaY) {
                    bs.putUIBit(1); // GeneralLineFlag
		    bs.putSIBits(this.DeltaX, numBits + 2);
		    bs.putSIBits(this.DeltaY, numBits + 2);
		} else {
                    bs.putUIBit(0); // GeneralLineFlag
		    if (this.DeltaY) {
                        bs.putUIBit(1); // VertLineFlag
			bs.putSIBits(this.DeltaY, numBits + 2);
		    } else {
                        bs.putUIBit(0); // VertLineFlag
			bs.putSIBits(this.DeltaX, numBits + 2);
		    }
		}
	    } else { // CurvedEdgeRecord
                var controlDeltaXBits = bs.need_bits_signed(this.ControlDeltaX);
                var controlDeltaYBits = bs.need_bits_signed(this.ControlDeltaY);
                var anchorDeltaXBits = bs.need_bits_signed(this.AnchorDeltaX);
                var anchorDeltaYBits = bs.need_bits_signed(this.AnchorDeltaY);
                var numBits = (controlDeltaXBits > controlDeltaYBits)?controlDeltaXBits:controlDeltaYBits;
                numBits = (numBits > anchorDeltaXBits)?numBits:anchorDeltaXBits;
                numBits = (numBits > anchorDeltaYBits)?numBits:anchorDeltaYBits;
                if (numBits < 2) {
                    numBits = 0;
                } else {
                    numBits -= 2;
                }
		bs.putUIBits(this.ControlDeltaX, numBits + 2);
                bs.putUIBits(this.ControlDeltaY, numBits + 2);
		bs.putUIBits(this.AnchorDeltaX,  numBits + 2);
                bs.putUIBits(this.AnchorDeltaY,  numBits + 2);
	    }
	} else if ('StateNewStyles' in this) { // StypeChangeRecord
	    bs.putUIBit(this.StateNewStyles)
	    bs.putUIBit(this.StateLineStyle)
	    bs.putUIBit(this.StateFillStyle1)
	    bs.putUIBit(this.StateFillStyle0);
	    bs.putUIBit(this.StateMoveTo);
	    if (this.StateMoveTo) {
                var moveXBits = bs.need_bits_signed(this.MoveX);
                var moveYBits = bs.need_bits_signed(this.MoveY);
		var moveBits = (moveXBits > moveYBits)?moveXBits:moveYBits;
                bs.putUIBits(moveBits, 5);
		bs.putSIBits(this.MoveX, moveBits); // MoveDeltaX
		bs.putSIBits(this.MoveY, moveBits); // MoveDeltaY
	    }
	    if (this.StateFillStyle0) {
		bs.putUIBits(this.FillStyle0, currentNumBits.FillBits);
	    }
	    if (this.StateFillStyle1) {
		bs.putUIBits(this.FillStyle0, currentNumBits.FillBits);
	    }
	    ; 
	    if (this.StateLineStyle) {
		bs.putUIBits(this.LineStyle, currentNumBits.LineBits);
	    }
	    ; 
	    if (this.StateNewStyles) {
		this.FillStyles.build(bs, tag_code);
		this.LineStyles.build(bs, tag_code);
                currentNumBits.FillBits = bs.need_bits_unsigned(this.FillStyles.FillStyles.length + 1);
                currentNumBits.LineBits = bs.need_bits_unsigned(this.LineStyles.LineStyles.length + 1);
                var numBits = (currentNumBits.FillBits << 4) | currentNumBits.LineBits;
		bs.putUI8(numBits);
	    }
	} else { // EndShapeRecord
            bs.putUIBits(0, 4);
	}
    }
}

var SWFSHAPEWITHSTYLE = function(bs, tag_code) {
    if (bs) {
	this.FillStyles = new SWFFILLSTYLEARRAY(bs, tag_code);
	this.LineStyles = new SWFLINESTYLEARRAY(bs, tag_code);
	var numBits = bs.getUI8();
	this.NumFillBits = numBits >> 4;
	this.NumLineBits = numBits & 0x0f;
	var numBits = {FillBits:this.NumFillBits, LineBits:this.NumLineBits};
	var done = false;
	this.ShapeRecords = [];
	while (done === false) {
	    var shape = new SWFSHAPERECORDS(bs, tag_code, numBits);
	    this.ShapeRecords.push(shape);
	    if ('EndOfShape' in shape) {
		done = true;
	    }
	}
    }
    this.build = function(bs, tag_code) {
	this.FillStyles.build(bs, tag_code);
	this.LineStyles.build(bs, tag_code);
        this.NumFillBits = bs.need_bits_unsigned(this.FillStyles.FillStyles.length + 1);
        this.NumLineBits = bs.need_bits_unsigned(this.LineStyles.LineStyles.length + 1);
	var numBits =  (this.NumFillBits << 4) | this.NumLineBits;
        bs.putUI8(numBits);
	var numBits = {FillBits:this.NumFillBits, LineBits:this.NumLineBits};
        var shapeRecords = this.ShapeRecords;
	for (var i = 0, n = shapeRecords.length ; i < n ; i++){
	    shapeRecords[i].build(bs, tag_code, numBits);
	}
    }
    this.toString = function() {
	return "{FillStyles:"+this.FillStyles+" LineStyles:"+this.LineStyles+" numFillBits:"+this.NumFillBits+" NumLineBits:"+this.NumLineBits+" ShapeRecords:"+this.ShapeRecords+"}";
    }
}

var SWFCXFORM = function(bs) {
    if (bs) {
        bs.byteAlign();
        var first6bits = bs.getUIBits(6);
        this.HasAddTerms = first6bits >> 5;
        this.HasMultiTerms = (first6bits >> 4) & 1;
        var nbits = first6bits & 0x0f;
        this.Nbits = nbits;
        if (this.HasMultiTerms) {
            this.RedMultiTerm = bs.getSIBits(nbits);
            this.GreenMultiTerm = bs.getSIBits(nbits);
            this.BlueMultiTerm = bs.getSIBits(nbits);
        }
        if (this.HasAddTerms) {
            this.RedAddTerm = bs.getSIBits(nbits);
            this.GreenAddTerm = bs.getSIBits(nbits);
            this.BlueAddTerm = bs.getSIBits(nbits);
        }
    }
    this.build = function(bs) {
        bs.byteAlign();
        bs.putUIBit(this.HasAddTerms);
        bs.putUIBit(this.HasMultiTerms);
        var nbits = 0;
        if (this.HasMultiTerms) {
            var redMultiTermBits = bs.need_bits_signed(this.RedMultiTerm);
            var greenMultiTermBits = bs.need_bits_signed(this.GreenMultiTerm);
            var blueMultiTermBits = bs.need_bits_signed(this.BlueMultiTerm);
            nbits = (nbits > redMultiTermBits)?nbits:redMultiTermBits;
            nbits = (nbits > greenMultiTermBits)?nbits:greenMultiTermBits;
            nbits = (nbits > blueMultiTermBits)?nbits:blueMultiTermBits;
        }
        if (this.HasAddTerms) {
            var redAddTermBits = bs.need_bits_signed(this.RedAddTerm);
            var greenAddTermBits = bs.need_bits_signed(this.GreenAddTerm);
            var blueAddTermBits = bs.need_bits_signed(this.BlueAddTerm);
            nbits = (nbits > redAddTermBits)?nbits:redAddTermBits;
            nbits = (nbits > greenAddTermBits)?nbits:greenAddTermBits;
            nbits = (nbits > blueAddTermBits)?nbits:blueAddTermBits;
        }
        bs.putUIBits(nbits, 4);
        if (this.HasMultiTerms) {
            bs.putSIBits(this.RedMultiTerm,   nbits);
            bs.putSIBits(this.GreenMultiTerm, nbits);
            bs.putSIBits(this.BlueMultiTerm,  nbits);
        }
        if (this.HasAddTerms) {
            bs.putSIBits(this.RedAddTerm,   nbits);
            bs.putSIBits(this.GreenAddTerm, nbits);
            bs.putSIBits(this.BlueAddTerm,  nbits);
        }
    }
}
var SWFCXFORMWITHALPHA = function(bs) {
    if (bs) {
        bs.byteAlign();
        var first6bits = bs.getUIBits(6);
        this.HasAddTerms = first6bits >> 5;
        this.HasMultiTerms = (first6bits >> 4) & 1;
        var nbits = first6bits & 0x0f;
        this.Nbits = nbits;
        if (this.HasMultiTerms) {
            this.RedMultiTerm = bs.getSIBits(nbits);
            this.GreenMultiTerm = bs.getSIBits(nbits);
            this.BlueMultiTerm = bs.getSIBits(nbits);
            this.AlphaMultiTerm = bs.getSIBits(nbits);
        }
        if (this.HasAddTerms) {
            this.RedAddTerm = bs.getSIBits(nbits);
            this.GreenAddTerm = bs.getSIBits(nbits);
            this.BlueAddTerm = bs.getSIBits(nbits);
            this.AlphaAddTerm = bs.getSIBits(nbits);
        }
    }
    this.build = function(bs) {
        bs.byteAlign();
        bs.putUIBit(this.HasAddTerms);
        bs.putUIBit(this.HasMultiTerms);
        var nbits = 0;
        if (this.HasMultiTerms) {
            var redMultiTermBits = bs.need_bits_signed(this.RedMultiTerm);
            var greenMultiTermBits = bs.need_bits_signed(this.GreenMultiTerm);
            var blueMultiTermBits = bs.need_bits_signed(this.BlueMultiTerm);
            var alphaMultiTermBits = bs.need_bits_signed(this.AlphaMultiTerm);
            nbits = (nbits > redMultiTermBits)?nbits:redMultiTermBits;
            nbits = (nbits > greenMultiTermBits)?nbits:greenMultiTermBits;
            nbits = (nbits > blueMultiTermBits)?nbits:blueMultiTermBits;
            nbits = (nbits > alphaMultiTermBits)?nbits:alphaMultiTermBits;
        }
        if (this.HasAddTerms) {
            var redAddTermBits = bs.need_bits_signed(this.RedAddTerm);
            var greenAddTermBits = bs.need_bits_signed(this.GreenAddTerm);
            var blueAddTermBits = bs.need_bits_signed(this.BlueAddTerm);
            var alphaAddTermBits = bs.need_bits_signed(this.AlphaAddTerm);
            nbits = (nbits > redAddTermBits)?nbits:redAddTermBits;
            nbits = (nbits > greenAddTermBits)?nbits:greenAddTermBits;
            nbits = (nbits > blueAddTermBits)?nbits:blueAddTermBits;
            nbits = (nbits > alphaAddTermBits)?nbits:alphaAddTermBits;
        }
        bs.putUIBits(nbits, 4);
        if (this.HasMultiTerms) {
            bs.putSIBits(this.RedMultiTerm,   nbits);
            bs.putSIBits(this.GreenMultiTerm, nbits);
            bs.putSIBits(this.BlueMultiTerm,  nbits);
            bs.putSIBits(this.AlphaMultiTerm,  nbits);
        }
        if (this.HasAddTerms) {
            bs.putSIBits(this.RedAddTerm,   nbits);
            bs.putSIBits(this.GreenAddTerm, nbits);
            bs.putSIBits(this.BlueAddTerm,  nbits);
            bs.putSIBits(this.AlphaAddTerm,  nbits);
        }
    }
}

var SWFCLIPEVENTFLAGS = function(bs) {
    if (bs) {
        ;
    }
    this.build = function(bs) {
        ;
    }
}

var SWFCLIPACTIONRECORD = function(bs) {
    if (bs) {
        ;
    }
    this.build = function(bs) {
        ;
    }
}

var SWFCLIPACTIONS = function(bs) {
    if (bs) {
        this.Reserved = bs.getUI16LE(); 
         this.AllEventFlags = new SWFCLIPEVENTFLAGS(bs);
        var clipActionRecords = [];
        while (true) {
            clipActionRecord = new SWFCLIPACTIONRECORD(bs);
            clipActionRecords.push(clipActionRecord);
            if (true) { // condition end of clipactionrecords
                break;
            }
        }
        this.ClipActionRecords = clipActionRecords; 
        this.FrameRate  = bs.getUI16LE(); // XXX getUI32LE if SWFv6 over
    }
    this.build = function(bs) {
        bs.putUI16LE(0); // Reserved
        this.AllEventFlags.build(bs);
        var clipActionRecords = this.ClipActionRecords;
        for (var i = 0, n = clipActionRecords.length ; i < n ; i++) {
            clipActionRecords[i].build(bs);
        }
        bs.putUI16LE(this.FrameRate); // XXX putUI32LE if SWFv6 over
    }
}

/* Header */
var SWFHeader = function(bs) {
    if (bs) {
	this.Signature  = bs.getData(3);
	this.Version    = bs.getUI8();
	this.FileLength = bs.getUI32LE();
    }
    this.build = function(bs) {
	bs.putData(this.Signature, 3);
	bs.putUI8(this.Version);
	bs.putUI32LE(this.FileLength);
    }
}

var SWFMovieHeader = function(bs) {
    if (bs) {
	this.FrameSize  = new SWFRECT(bs);
	this.FrameRate  = bs.getUI16LE();
	this.FrameCount = bs.getUI16LE();
    }
    this.build = function(bs) {
        this.FrameSize.build(bs);
	bs.putUI16LE(this.FrameRate);
	bs.putUI16LE(this.FrameCount);
    }
}

/* Tag */

var SWFEnd = function(bs, tag_code) { // code:0
    if (bs) {
        this.tag_code = tag_code;
    }
    this.build = function(bs) {
        ;
    }
}

var SWFShowFrame = function(bs, tag_code) { // code:1
    if (bs) {
        this.tag_code = tag_code;
    }
    this.build = function(bs) {
        ;
    }
}

var SWFDefineShape = function(bs, tag_code) { // 2
    if (bs) {
        this.tag_code = tag_code;
	this.ShapeId = bs.getUI16LE();
	this.ShapeBounds = new SWFRECT(bs);
	this.Shapes = new SWFSHAPEWITHSTYLE(bs, tag_code);
    }
    this.build = function(bs) {
	bs.putUI16LE(this.ShapeId);
	this.ShapeBounds.build(bs);
	this.Shapes.build(bs, tag_code);
    }

}

var SWFPlaceObject = function(bs, tag_code, length) { // code:4, 26
    if (bs) {
        this.tag_code = tag_code;
        if (tag_code === 4) { // PlaceObject
            var byteOffset = bs.byte_offset;
            this.CharacterId = bs.getUI16LE();
            this.Depth = bs.getUI16LE();
            this.Matrix = new SWFMATRIX(bs);
            bs.byteAlign();
            if (byteOffset + length < bs.byte_offset) {
                this.Colortransform = new SWFCXFORM(bs);
            }
        } else { // PlaceObject2
            var placeFlag = bs.getUI8();
            this.PlaceFlagHasClipActions = placeFlag & 0x80;
            this.PlaceFlagHasClipDepth   = placeFlag & 0x40;
            this.PlaceFlagHasName        = placeFlag & 0x20;
            this.PlaceFlagHasRatio       = placeFlag & 0x10;
            this.PlaceFlagHasColorTransform = placeFlag & 0x08;
            this.PlaceFlagHasMatrix      = placeFlag & 0x04;
            this.PlaceFlagHasCharacter   = placeFlag & 0x02;
            this.PlaceFlagHasMove        = placeFlag & 0x01;
            this.Depth = bs.getUI16LE();
            if (this.PlaceFlagHasCharacter) {
                this.CharacterId = bs.getUI16LE();
            }
            if (this.PlaceFlagHasMatrix) {
                this.Matrix = new SWFMATRIX(bs);
            }
            if (this.PlaceFlagHasColorTransform) {
                this.Colortransform = new SWFCXFORMWITHALPHA(bs);
            }
            if (this.PlaceFlagHasRatio) {
                this.Ratio = bs.getUI16LE();
            }
            if (this.PlaceFlagHasName) {
                this.Name = bs.getDataUntil("\0");
            }
            if (this.PlaceFlagHasClipDepth) {
                this.ClipDepth = bs.getUI16LE();
            }
            if (this.PlaceFlagHasClipActions) {
                this.ClipActions = new SWFCLIPACTIONS(bs);
            }
        }
    }
    this.build = function(bs) {
        if (this.tag_code === 4) { // PlaceObject
            bs.putUI16LE(this.CharacterId);
            bs.putUI16LE(this.Depth);
            this.Matrix.build(bs);
            bs.byteAlign();
            if ('Colortransform' in this) {
                this.Colortransform.build(bs);
            }
        } else { // PlaceObject2
            var placeFlag =
            this.PlaceFlagHasClipActions    << 7 | 
            this.PlaceFlagHasClipDepth      << 6 |
            this.PlaceFlagHasName           << 5 |
            this.PlaceFlagHasRatio          << 4 |
            this.PlaceFlagHasColorTransform << 3 |
            this.PlaceFlagHasMatrix         << 2 |
            this.PlaceFlagHasCharacter      << 1 |
            this.PlaceFlagHasMove;
            bs.putUI8(placeFlag);
            
            bs.putUI16LE(this.Depth);
            if (this.PlaceFlagHasCharacter) {
                bs.putUI16LE(this.CharacterId);
            }
            if (this.PlaceFlagHasMatrix) {
                this.Matrix.build(bs);
            }
            if (this.PlaceFlagHasColorTransform) {
                this.Colortransform.build(bs);
            }
            if (this.PlaceFlagHasRatio) {
                bs.putUI16LE(this.Ratio);
            }
            if (this.PlaceFlagHasName) {
                bs.putData(this.Name+"\0");
            }
            if (this.PlaceFlagHasClipDepth) {
                bs.putUI16LE(this.ClipDepth);
            }
            if (this.PlaceFlagHasClipActions) {
                this.ClipActions.build(bs);
            }
        }
    }
}

var SWFRemoveObject = function(bs, tag_code) { // 5, 28
    if (bs) {
        this.tag_code = tag_code;
        if (tag_code === 5) { // RemoveObject
            this.CharacterId = bs.getUI16LE();
            this.Depth = bs.getUI16LE();
        } else { // RemoveObject2
            this.Depth = bs.getUI16LE();
        }
    }
    this.build = function(bs) {
        if (this.tag_code === 5) { // RemoveObject
            bs.putUI16LE(this.CharacterId);
            bs.putUI16LE(this.Depth);
        } else { // RemoveObject2
            bs.putUI16LE(this.Depth);
        }
    }
}

var SWFDefineBitsJPEG = function(bs, tag_code, length) { // code:6, 21, 35
    if (bs) {
        this.tag_code = tag_code;
	this.CharacterID = bs.getUI16LE();
        var imageDataLen = length - 2;
        if (tag_code === 35) { // DefineBitsJPEG3
            this.AlphaDataOffset = bs.getUI32LE();
            imageDataLen = this.AlphaDataOffset;
        }
	this.ImageData = bs.getData(imageDataLen);
        if (tag_code === 35) { // DefineBitsJPEG3
            this.BitmapAlphaData = bs.getData(length - 2 - imageDataLen);
        }
    }
    this.build = function(bs) {
        bs.putUI16LE(this.CharacterID);
        if (this.tag_code === 35) { // DefineBitsJPEG3
            bs.putUI32LE(this.ImageData.length); // AlphaDataOffset
        }
	bs.putData(this.ImageData);
        if (this.tag_code === 35) { // DefineBitsJPEG3
            bs.putData(this.BitmapAlphaData);
        }
    }
}

var SWFSetBackgroundColor = function(bs, tag_code) { // 9
    if (bs) {
        this.tag_code = tag_code;
	this.BackgroundColor = new SWFRGB(bs);
    }
    this.build = function(bs) {
        this.BackgroundColor.build(bs);
    }
}

var SWFDefineBitsLossless = function(bs, tag_code, length) { // code:20,36
    if (bs) {
        this.tag_code = tag_code;
	this.CharacterID = bs.getUI16LE();
	this.BitmapFormat = bs.getUI8();
	this.BitmapWidth = bs.getUI16LE();
	this.BitmapHeight = bs.getUI16LE();
        var zlibBitmapDataLen = length - 7;
        if (this.BitmapFormat === 3) {
            this.BitmapColorTableSize = bs.getUI8();            
            zlibBitmapDataLen--;
        }
        this.ZlibBitmapData = bs.getData(zlibBitmapDataLen);
    }
    this.build = function(bs) {
	bs.putUI16LE(this.CharacterID);
	bs.putUI8(this.BitmapFormat);
	bs.putUI16LE(this.BitmapWidth);
	bs.putUI16LE(this.BitmapHeight);
        if (this.BitmapFormat === 3) {
            bs.putUI8(this.BitmapColorTableSize);
        }
        bs.putData(this.ZlibBitmapData);
    }
}

var SWFUnknownTag = function(bs, tag_code, length) { // code:20,36
    if (bs) {
        this.tag_code = tag_code;
	this.data = bs.getData(length);
    }
    this.build = function(bs) {
        bs.putData(this.data);
    }
}

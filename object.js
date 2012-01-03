/* Basic Structure */

    // SWF specific
var SWFRECT = function(bs) {
    if (bs) {
	bs.byteAlign();
	var Nbits = bs.getUIBits(5);
	this.Xmin = bs.getSIBits(Nbits);
	this.Xmax = bs.getSIBits(Nbits);
	this.Ymin = bs.getSIBits(Nbits);
	this.Ymax = bs.getSIBits(Nbits);
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
	}
	this.HasRotate = bs.getUIBit();
	if (this.HasRotate) {
	    var nRotateBits = bs.getUIBits(5);
	    this.NRotateBits = nRotateBits;
	    this.RotateSkew0 = bs.getSIBits(nRotateBits);
	    this.RotateSkew1 = bs.getSIBits(nRotateBits);
	}
	var nTranslateBits = bs.getUIBits(5);
	this.NTranslateBits = nTranslateBits;
	this.TranslateX = bs.getSIBits(nTranslateBits);
	this.TranslateY = bs.getSIBits(nTranslateBits);
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
		this.AnchoeDeltaX = bs.getUIBits(numBits + 2);
		this.AnchoeDeltaY = bs.getUIBits(numBits + 2);
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
}

var SWFCLIPEVENTFLAGS = function(bs) {
    if (bs) {
        ;
    }
}

var SWFCLIPACTIONRECORD = function(bs) {
    if (bs) {
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
}

/* Header */
var SWFHeader = function(bs) {
    if (bs) {
	this.Signature  = bs.getData(3);
	this.Version    = bs.getUI8();
	this.FileLength = bs.getUI32LE();
	this.FrameSize  = new SWFRECT(bs);
	this.FrameRate  = bs.getUI16LE();
	this.FrameCount = bs.getUI16LE();
    }
}

/* Tag */

var SWFEnd = function(bs, tag_code) { // code:0
    if (bs) {
        this.tag_code = tag_code;
    }
}

var SWFShowFrame = function(bs, tag_code) { // code:1
    if (bs) {
        this.tag_code = tag_code;
    }
}

var SWFDefineShape = function(bs, tag_code) { // 2
    if (bs) {
        this.tag_code = tag_code;
	this.ShapeId = bs.getUI16LE();
	this.ShapeBounds = new SWFRECT(bs);
	this.Shapes = new SWFSHAPEWITHSTYLE(bs, tag_code);
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
}

var SWFSetBackgroundColor = function(bs, tag_code) { // 9
    if (bs) {
        this.tag_code = tag_code;
	this.BackgroundColor = new SWFRGB(bs);
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
}

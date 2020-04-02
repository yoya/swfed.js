/*
 * 2012/01/03- (c) yoya@awm.jp 
*/

var SWFTagNames = {
    0:"End",
    1:"ShowFrame",
    2:"DefineShape",
    4:"PlaceObject",
    5:"RemoveObject",
    6:"DefineBits",
    7:"DefineButton",
    8:"JEGTables",
    9:"SetBackgroundColor",
    10:"DefineFont",
    11:"DefineText",
    12:"DoAction",
    13:"DefineFontInfo",
    14:"DefineSound",
    15:"StartSound",
    17:"DefineButtonSound",
    18:"SoundStreamHead",
    19:"SoundStreamBlock",
    20:"DefineBitsLossless",
    21:"DefineBitsJPEG2",
    22:"DefineShape2",
    23:"DefineButtonCxform",
    24:"Protect",
    26:"PlaceObject2",
    28:"RemoveObject2",
    32:"DefineShape3",
    33:"DefineText2",
    34:"DefineButton2",
    35:"DefineBitsJPEG3",
    36:"DefineBitsLossless2",
    37:"DefineEditText",
    39:"DefineSprite",
    43:"FrameLabel",
    45:"SoundStreamHead2",
    46:"DefineMorphShape",
    48:"DefineFont2",
    56:"ExportAssets",
    57:"ImportAssets",
    58:"EnableDebugger",
    59:"DoInitAction",
    60:"DefineVideoStream",
    61:"VideoFrame",
    88:"DefineFontName",
};


var SWFTagGetName = function(tag_code) {
    if (tag_code in SWFTagNames) {
        return SWFTagNames[tag_code];
    }
    return "Unknown";
}


/* Basic Structure */

    // SWF specific

// SWFRECT

var SWFRECT = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.Xmin = 0;
        this.Xmax = 0;
        this.Ymin = 0; 
        this.Ymax = 0;
    }
}

SWFRECT.prototype.parse = function(bs) {
    bs.byteAlign();
    var Nbits = bs.getUIBits(5);
    this.Nbits = Nbits;
    this.Xmin = bs.getSIBits(Nbits);
    this.Xmax = bs.getSIBits(Nbits);
    this.Ymin = bs.getSIBits(Nbits);
    this.Ymax = bs.getSIBits(Nbits);
}

SWFRECT.prototype.build = function(bs) {
    bs.byteAlign();
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

SWFRECT.prototype.toString = function() {
    return "{Xmin:"+this.Xmin+", Xmax:"+this.Xmax+", Ymin:"+this.Ymin+", Ymax:"+this.Ymax+"}";
}

// SWFMATRIX

var SWFMATRIX = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.ScaleX = 0x10000;
        this.ScaleY = 0x10000;
        this.RotateSkew0 = 0;
        this.RotateSkew1 = 0;
        this.TranslateX = 0;
        this.TranslateY = 0;
    }
}

SWFMATRIX.prototype.parse = function(bs) {
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
}

SWFMATRIX.prototype.build = function(bs) {
    bs.byteAlign();
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

SWFMATRIX.prototype.toString = function() {
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

// SWFLANGCODE

var SWFLANGCODE = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.LanguageCode = 0;
    }
}

SWFLANGCODE.prototype.parse = function(bs) {
    this.LanguageCode = bs.getUI8();
}

SWFLANGCODE.prototype.build = function(bs) {
    bs.putUI8(this.LanguageCode);
}

SWFLANGCODE.prototype.toString = function() {
    var codetext;
    switch (this.LanguageCode) {
    case 1:
        codetext = "Latin";
        break;
    case 2:
        codetext = "Japanese";
        break;
    case 3:
        codetext = "Korean";
        break;
    case 4:
        codetext = "Simplified Chinese";
        break;
    case 5:
        codetext = "Traditional Chinese";
        break;
    default:
        codetext = "Unknown";
        break;
    }
    return "{LanguageCode:"+this.LanguageCode+"("+codetext+")";
}

// SWFRGB

var SWFRGB = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.Red   = 0;
        this.Green = 0;
        this.Blue  = 0;
    }
}

SWFRGB.prototype.parse = function(bs) {
    this.Red   = bs.getUI8();
    this.Green = bs.getUI8();
    this.Blue  = bs.getUI8();
}

SWFRGB.prototype.build = function(bs) {
    bs.putUI8(this.Red);
    bs.putUI8(this.Green);
    bs.putUI8(this.Blue);
}

SWFRGB.prototype.toString = function() {
    return "{Red:"+this.Red+" Green:"+this.Green+" Blue:"+this.Blue+"}";
}

SWFRGB.prototype.toStringCSS = function() {
    return 'rgb('+this.Red+','+this.Green+','+this.Blue+')';
}

// SWFRGBA

var SWFRGBA = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.Red   = 0;
        this.Green = 0;
        this.Blue  = 0;
        this.Alpha = 0;
    }
}

SWFRGBA.prototype.parse = function(bs) {
    this.Red   = bs.getUI8();
    this.Green = bs.getUI8();
    this.Blue  = bs.getUI8();
    this.Alpha = bs.getUI8();
}

SWFRGBA.prototype.build = function(bs) {
    bs.putUI8(this.Red);
    bs.putUI8(this.Green);
    bs.putUI8(this.Blue);
    bs.putUI8(this.Alpha);
}

SWFRGBA.prototype.toString = function() {
    return "{Red:"+this.Red+" Green:"+this.Green+" Blue:"+this.Blue+" Alpha:"+this.Alpha+"}";
}

// SWFARGB

var SWFARGB = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.Alpha = 0;
        this.Red   = 0;
        this.Green = 0;
        this.Blue  = 0;
    }
}

SWFARGB.prototype.parse = function(bs) {
    this.Alpha = bs.getUI8();
    this.Red   = bs.getUI8();
    this.Green = bs.getUI8();
    this.Blue  = bs.getUI8();
}

SWFARGB.prototype.build = function(bs) {
    bs.putUI8(this.Alpha);
    bs.putUI8(this.Red);
    bs.putUI8(this.Green);
    bs.putUI8(this.Blue);
}

SWFARGB.prototype.toString = function() {
    return "{Alpha:"+this.Alpha+" Red:"+this.Red+" Green:"+this.Green+" Blue:"+this.Blue+"}";
}

// SWFFOCALGRADIENT

var SWFFOCALGRADIENT = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        this.SpreadMode = 0;
        this.InterpolationMode = 0;
        this.NumGradients = 0;
        this.GradientRecords = [];
        this.FocalPoint = 0;
    }
}

SWFFOCALGRADIENT.prototype.parse = function(bs, tag_code) {
    bs.byteAlign();
    this.SpreadMode = bs.getUIBits(2);
    this.InterpolationMode = bs.getUIBits(2);
    var numGradients = bs.getUIBits(4);
    this.NumGradients = numGradients;
    var gradientRecords = [];
    for (i = 0 ; i < numGradients ; i++) {
        gradientRecords.push(new SWFGRADRECORD(bs, tag_code));
    }
    this.GradientRecords = gradientRecords;
    this.FocalPoint = bs.getUI8();
}

SWFFOCALGRADIENT.prototype.build = function(bs) {
    bs.byteAlign();
    bs.putUIBits(this.SpreadMode, 2);
    bs.putUIBits(this.InterpolationMode, 2);
    var gradientRecords = this.GradientRecords;
    var numGradients = gradientRecords.length;
    bs.putUIBits(numGradients, 4);
    for (i = 0 ; i < numGradients ; i++) {
        gradientRecords[i].build(bs);
    }
    bs.putUI8(this.FocalPoint);
}

// SWFGRADRECORD

var SWFGRADRECORD = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        this.Ratio = 0;
        if (tag_code < 32) { // DefineShape1or2
            this.Color = new SWFRGB();
        } else { // DefineShape3
            this.Color = new SWFRGBA();
        }
    }
}

SWFGRADRECORD.prototype.parse = function(bs, tag_code) {
    this.Ratio = bs.getUI8();
    if (tag_code < 32) { // DefineShape1or2
        this.Color = new SWFRGB(bs);
    } else { // DefineShape3
        this.Color = new SWFRGBA(bs);
    }
}

SWFGRADRECORD.prototype.build = function(bs) {
    bs.putUI8(this.Ratio);
    this.Color.build(bs);
}

// SWFGRADIENT

var SWFGRADIENT = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        this.SpreadMode = 0;
        this.InterpolationMode = 0;
        this.NumGradients = 0;
        this.GradientRecords = [];
    }
}

SWFGRADIENT.prototype.parse = function(bs, tag_code) {
    bs.byteAlign();
    this.SpreadMode = bs.getUIBits(2);
    this.InterpolationMode = bs.getUIBits(2);
    var numGradients = bs.getUIBits(4);
    this.NumGradients = numGradients;
    var gradientRecords = [];
    for (i = 0 ; i < numGradients ; i++) {
        gradientRecords.push(new SWFGRADRECORD(bs, tag_code));
    }
    this.GradientRecords = gradientRecords;
}

SWFGRADIENT.prototype.build = function(bs) {
    bs.byteAlign();
    bs.putUIBits(this.SpreadMode, 2);
    bs.putUIBits(this.InterpolationMode, 2);
    var gradientRecords = this.GradientRecords;
    var numGradients = gradientRecords.length;
    bs.putUIBits(numGradients, 4);
    for (i = 0 ; i < numGradients ; i++) {
        gradientRecords[i].build(bs);
    }
}

// SWFFILLSTYLE

var SWFFILLSTYLE = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        this.FillStyleType = 0;
        if (tag_code < 32) { // DefineShape1or2
            this.Color = new SWFRGB();
        } else { // DefineShape3
            this.Color = new SWFRGBA();
        }
    }
}

SWFFILLSTYLE.prototype.parse = function(bs, tag_code) {
    this.FillStyleType = bs.getUI8();
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
        this.Gradient = new SWFGRADIENT(bs, tag_code);
        break;
    case 0x13: // focal radial gradient fill
        this.GradientMatrix = new SWFMATRIX(bs);
        this.Gradient = new SWFFOCALGRADIENT(bs, tag_code);
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

SWFFILLSTYLE.prototype.build = function(bs) {
    bs.putUI8(this.FillStyleType);
    switch (this.FillStyleType) {
    case 0x00: // solid fill
        this.Color.build(bs);
        break;
    case 0x10: // linear gradient fill
    case 0x12: // radial gradient fill
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

// SWFLINESTYLE

var SWFLINESTYLE = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        this.Width = 0;
        if (tag_code < 32) { // DefineShape1or2
            this.Color = new SWFRGB();
        } else { // DefineShape3
            this.Color = new SWFRGBA();
        }
    }
}

SWFLINESTYLE.prototype.parse = function(bs, tag_code) {
    this.Width = bs.getUI16LE();
    if (tag_code < 32) { // DefineShape1or2
        this.Color = new SWFRGB(bs);
    } else { // DefineShape3
        this.Color = new SWFRGBA(bs);
    }
}

SWFLINESTYLE.prototype.build = function(bs) {
    bs.putUI16LE(this.Width);
    this.Color.build(bs);
}

// SWFFILLSTYLEARRAY

var SWFFILLSTYLEARRAY = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        ;
    }
}

SWFFILLSTYLEARRAY.prototype.parse = function(bs, tag_code) {
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

SWFFILLSTYLEARRAY.prototype.build = function(bs, tag_code) {
    fillStyleCount = this.FillStyles.length;
    if ((tag_code < 22) || (fillStyleCount < 0xff)) {
        bs.putUI8(fillStyleCount);
    } else {
        bs.putUI8(0xff);
        bs.putUI16LE(fillStyleCount);
    }
    for (var i = 0 ; i < fillStyleCount ; i++) {
        fillStyles[i].build(bs);
    }
}

// SWFLINESTYLEARRAY

var SWFLINESTYLEARRAY = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        this.LineStyleCount = 0;
        this.LineStyles = [];
    }
}

SWFLINESTYLEARRAY.prototype.parse = function(bs, tag_code) {
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

SWFLINESTYLEARRAY.prototype.build = function(bs, tag_code) {
    lineStyleCount = this.LineStyles.length;
    if ((tag_code < 22) || (lineStyleCount < 0xff)) {
        bs.putUI8(lineStyleCount);
    } else {
        bs.putUI8(0xff);
        bs.putUI16LE(lineStyleCount);
    }
    for (var i = 0 ; i < lineStyleCount ; i++) {
        lineStyles[i].build(bs);
    }
}

// SWFENDSHAPERECORD

var SWFENDSHAPERECORD = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.EndOfShape = 0;
    }
}

SWFENDSHAPERECORD.prototype.parse = function(bs) {
    this.EndOfShape = 0;
}

SWFENDSHAPERECORD.prototype.build = function() {
    bs.putUIBits(0, 6); // TypeFlag:0 + EndOfShape:0(5bits)
}

// SWFSTYLECHANGERECORD

var SWFSTYLECHANGERECORD = function(bs, tag_code, changeFlag, currentNumBits, currentPosition) {
    if (bs) {
        this.parse(bs, tag_code, changeFlag, currentNumBits, currentPosition);
    } else {
        this.StateNewStyles  = 0;
        this.StateLineStyle  = 0;
        this.StateFillStyle1 = 0;
        this.StateFillStyle0 = 0;
        this.StateMoveTo     = 1;
        this.MoveX = 0;
        this.MoveY = 0;
        if (currentPosition) {
            currentPosition.x = this.MoveX;
            currentPosition.y = this.MoveY;
        }
    }
}

SWFSTYLECHANGERECORD.prototype.parse = function(bs, tag_code, changeFlag, currentNumBits, currentPosition) {
    this.StateNewStyles  = (changeFlag >> 4) & 1;
    this.StateLineStyle  = (changeFlag >> 3) & 1;
    this.StateFillStyle1 = (changeFlag >> 2) & 1;
    this.StateFillStyle0 = (changeFlag >> 1) & 1;
    this.StateMoveTo     =  changeFlag       & 1;
    if (this.StateMoveTo) {
        moveBits = bs.getUIBits(5);
        this.MoveBits = moveBits;
        this.MoveX = bs.getSIBits(moveBits); // MoveDeltaX
        this.MoveY = bs.getSIBits(moveBits); // MoveDeltaY
        currentPosition.x = this.MoveX;
        currentPosition.y = this.MoveY;
    }
    if (this.StateFillStyle0) {
        this.FillStyle0 = bs.getUIBits(currentNumBits.FillBits);
    }
    if (this.StateFillStyle1) {
        this.FillStyle1 = bs.getUIBits(currentNumBits.FillBits);
    }
    ; 
    if (this.StateLineStyle) {
        this.LineStyle = bs.getUIBits(currentNumBits.LineBits);
    }
    ; 
    if (this.StateNewStyles) { // XXX tag_code;
        this.FillStyles = new SWFFILLSTYLEARRAY(bs, tag_code);
        this.LineStyles = new SWFLINESTYLEARRAY(bs, tag_code);
        var numBits = bs.getUI8();
        currentNumBits.FillBits = this.NumFillBits = numBits >> 4;
        currentNumBits.LineBits = this.NumLineBits = numBits & 0x0f;
    }
}

SWFSTYLECHANGERECORD.prototype.build = function(bs, tag_code, currentNumBits, currentPosition) {
    bs.putUIBit(0); // TypeFlag:0
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
        currentPosition.x = this.MoveX;
        currentPosition.y = this.MoveY;
    }
    if (this.StateFillStyle0) {
        bs.putUIBits(this.FillStyle0, currentNumBits.FillBits);
    }
    if (this.StateFillStyle1) {
        bs.putUIBits(this.FillStyle1, currentNumBits.FillBits);
    }
    ; 
    if (this.StateLineStyle) {
        bs.putUIBits(this.LineStyle, currentNumBits.LineBits);
    }
    ; 
    if (this.StateNewStyles) {
        this.FillStyles.build(bs, tag_code);
        this.LineStyles.build(bs, tag_code);
        currentNumBits.FillBits = bs.need_bits_unsigned(this.FillStyles.FillStyles.length);
        currentNumBits.LineBits = bs.need_bits_unsigned(this.LineStyles.LineStyles.length);
        var numBits = (currentNumBits.FillBits << 4) | currentNumBits.LineBits;
        bs.putUI8(numBits);
    }
}

// SWFSTRAIGHTEDGERECOR

var SWFSTRAIGHTEDGERECORD = function(bs, numBits, currentPosition) {
    this.TypeFlag = 1;
    this.StraightFlag = 1;
    if (bs) {
        this.parse(bs, numBits, currentPosition);
    } else {
        this.NumBits = numBits;
        this.GeneralLineFlag = 1;
        if (currentPosition) {
            this.X = currentPosition.x + deltaX;
            this.Y = currentPosition.y + deltaY;
            currentPosition.x = this.X;
            currentPosition.y = this.Y;
        } else {
            this.X = 0;
            this.Y = 0;
        }
    }
}

SWFSTRAIGHTEDGERECORD.prototype.parse = function(bs, numBits, currentPosition) {
    var deltaX, deltaY;
    this.NumBits = numBits;
    this.GeneralLineFlag = bs.getUIBit();
    if (this.GeneralLineFlag) {
        deltaX = bs.getSIBits(numBits + 2);
        deltaY = bs.getSIBits(numBits + 2);
    } else {
        this.VertLineFlag = bs.getUIBit();
        if (this.VertLineFlag) {
            deltaX = 0;
            deltaY = bs.getSIBits(numBits + 2);
        } else {
            deltaX = bs.getSIBits(numBits + 2);
            deltaY = 0;
        }
    }
    this.X = currentPosition.x + deltaX;
    this.Y = currentPosition.y + deltaY;
    currentPosition.x = this.X;
    currentPosition.y = this.Y;
}

SWFSTRAIGHTEDGERECORD.prototype.build = function(bs, currentPosition) {
    bs.putUIBits(3, 2); // TypeFlag:1 + StraightFlag:1
    var deltaX = this.X - currentPosition.x;
    var deltaX = this.Y - currentPosition.x;
    var deltaXBits = bs.need_bits_signed(deltaX);
    var deltaYBits = bs.need_bits_signed(deltaY);
    var numBits = (deltaXBits > deltaYBits)?deltaXBits:deltaYBits;
    if (numBits < 2) {
        numBits = 0;
    } else {
        numBits -= 2;
    }
    bs.putUIBits(numBits, 4);
    if (deltaX && deltaY) {
        bs.putUIBit(1); // GeneralLineFlag
        bs.putSIBits(deltaX, numBits + 2);
        bs.putSIBits(deltaY, numBits + 2);
    } else {
        bs.putUIBit(0); // GeneralLineFlag
        if (deltaY) {
            bs.putUIBit(1); // VertLineFlag
            bs.putSIBits(deltaY, numBits + 2);
        } else {
            bs.putUIBit(0); // VertLineFlag
            bs.putSIBits(deltaX, numBits + 2);
        }
    }
    currentPosition.x = this.X;
    currentPosition.y = this.Y;
}

// SWFCURVEDEDGERECORD

var SWFCURVEDEDGERECORD = function(bs, numBits, currentPosition) {
    this.TypeFlag = 1;
    this.StraightFlag = 0;
    if (bs) {
        this.parse(bs, numBits, currentPosition);
    } else {
        if (currentPosition) {
            this.ControlX = currentPosition.x;
            this.ControlY = currentPosition.y;
            this.AnchorX = this.ControlX;
            this.AnchorY = this.ControlY;
            currentPosition.x = this.AnchorX;
            currentPosition.y = this.AnchorY;
        } else {
            this.ControlX = 0;
            this.ControlY = 0;
            this.AnchorX = 0;
            this.AnchorY = 0;
        }
    }
}

SWFCURVEDEDGERECORD.prototype.parse = function(bs, numBits, currentPosition) {
    this.NumBits = numBits;
    var controlDeltaX = bs.getSIBits(numBits + 2);
    var controlDeltaY = bs.getSIBits(numBits + 2);
    var anchorDeltaX = bs.getSIBits(numBits + 2);
    var anchorDeltaY = bs.getSIBits(numBits + 2);
    this.ControlX = currentPosition.x + controlDeltaX;
    this.ControlY = currentPosition.y + controlDeltaY;
    this.AnchorX = this.ControlX + anchorDeltaX;
    this.AnchorY = this.ControlY + anchorDeltaY;
    currentPosition.x = this.AnchorX;
    currentPosition.y = this.AnchorY;
}

SWFCURVEDEDGERECORD.prototype.build = function(bs, currentPosition) {
    bs.putUIBits(2, 2); // TypeFlag:1 + StraightFlag:0
    var controlDeltaX = this.ControlX - currentPosition.x;
    var controlDeltaY = this.ControlY - currentPosition.y;
    var anchorDeltaX = this.AnchorX - this.ControlX;
    var anchorDeltaY = this.AnchorY - this.ControlY;
    var controlDeltaXBits = bs.need_bits_signed(controlDeltaX);
    var controlDeltaYBits = bs.need_bits_signed(controlDeltaY);
    var anchorDeltaXBits = bs.need_bits_signed(anchorDeltaX);
    var anchorDeltaYBits = bs.need_bits_signed(anchorDeltaY);
    var numBits = (controlDeltaXBits > controlDeltaYBits)?controlDeltaXBits:controlDeltaYBits;
    numBits = (numBits > anchorDeltaXBits)?numBits:anchorDeltaXBits;
    numBits = (numBits > anchorDeltaYBits)?numBits:anchorDeltaYBits;
    if (numBits < 2) {
        numBits = 0;
    } else {
        numBits -= 2;
    }
    bs.putUIBits(numBits, 4);
    bs.putSIBits(controlDeltaX, numBits + 2);
    bs.putSIBits(controlDeltaY, numBits + 2);
    bs.putSIBits(anchorDeltaX,  numBits + 2);
    bs.putSIBits(anchorDeltaY,  numBits + 2);
    currentPosition.x = this.AnchorX;
    currentPosition.y = this.AnchorY;
}

// SWFSHAPERECORDS

var SWFSHAPERECORDS = function() { // SHAPEs
    ;
}

SWFSHAPERECORDS.prototype.parseRecords = function(bs, tag_code, currentNumBits) {
    var shapeRecords = [];
    var done = false;
    var currentPosition = {x:0, y:0};
    while (done === false) {
        var first6Bits = bs.getUIBits(6);
        if (first6Bits & 0x20) { // Edge
            var numBits = first6Bits & 0x0f;
            if (first6Bits & 0x10) { // StraigtEdge (11XXXX)
                var shape = new SWFSTRAIGHTEDGERECORD(bs, numBits, currentPosition);
            } else { // CurvedEdge (10XXXX)
                var shape = new SWFCURVEDEDGERECORD(bs, numBits, currentPosition);
            }
        } else if (first6Bits) { // ChangeStyle (0XXXXX)
            var changeFlag = first6Bits;
            var shape = new SWFSTYLECHANGERECORD(bs, tag_code, changeFlag, currentNumBits, currentPosition);
        } else { // EndOfShape (000000)
            var shape = new SWFENDSHAPERECORD(bs);
        }
        shapeRecords.push(shape);
        if (shape instanceof SWFENDSHAPERECORD) {
            done = true;
        }
    }
    return shapeRecords;
}

SWFSHAPERECORDS.prototype.buildRecords = function(shapeRecords, bs, tag_code, currentNumBits) {
    var currentPosition = {x:0, y:0};
    for (var i = 0, n = shapeRecords.length ; i < n ; i++){
        shapeRecords[i].build(bs, tag_code, currentNumBits);
    }
}

// SWFSHAPE

var SWFSHAPE = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        this.NumFillBits = 0;
        this.NumLineBits = 0;
        this.ShapeRecords = [];
    }
}

SWFSHAPE.prototype.parse = function(bs, tag_code) {
    var numBits = bs.getUI8();
    this.NumFillBits = numBits >> 4;
    this.NumLineBits = numBits & 0x0f;
    var currentNumBits = {FillBits:this.NumFillBits, LineBits:this.NumLineBits};
    var shapes = new SWFSHAPERECORDS();
    this.ShapeRecords = shapes.parseRecords(bs, tag_code, currentNumBits);
}

SWFSHAPE.prototype.build = function(bs, tag_code, currentNumBits) {
    var numBits = (currentNumBits.FillBits << 4) | currentNumBits.LineBits;
    bs.putUI8(numBits);
    var shapes = new SWFSHAPERECORDS();
    shapes.buildRecords(this.ShapeRecords, bs, tag_code, currentNumBits);
}

SWFSHAPE.prototype.toString = function() {
    return "{numFillBits:"+this.NumFillBits+" NumLineBits:"+this.NumLineBits+" ShapeRecords:"+this.ShapeRecords+"}";
}

// SWFSHAPEWITHSTYLE

var SWFSHAPEWITHSTYLE = function(bs, tag_code, currentNumBits) {
    if (bs) {
        this.parse(bs, tag_code, currentNumBits);
    } else {
        this.FillStyles = new SWFFILLSTYLEARRAY(null, tag_code);
        this.LineStyles = new SWFLINESTYLEARRAY(null, tag_code);
        this.ShapeRecords = [];
    }
}

SWFSHAPEWITHSTYLE.prototype.parse = function(bs, tag_code, currentNumBits) {
    this.FillStyles = new SWFFILLSTYLEARRAY(bs, tag_code);
    this.LineStyles = new SWFLINESTYLEARRAY(bs, tag_code);
    var numBits = bs.getUI8();
    this.NumFillBits = numBits >> 4;
    this.NumLineBits = numBits & 0x0f;
    var currentNumBits = {FillBits:this.NumFillBits, LineBits:this.NumLineBits};
    var shapes = new SWFSHAPERECORDS();
    this.ShapeRecords = shapes.parseRecords(bs, tag_code, currentNumBits);
}

SWFSHAPEWITHSTYLE.prototype.build = function(bs, tag_code) {
    this.FillStyles.build(bs, tag_code);
    this.LineStyles.build(bs, tag_code);
    this.NumFillBits = bs.need_bits_unsigned(this.FillStyles.FillStyles.length);
    this.NumLineBits = bs.need_bits_unsigned(this.LineStyles.LineStyles.length);
    var numBits = (this.NumFillBits << 4) | this.NumLineBits;
    bs.putUI8(numBits);
    var currentNumBits = {FillBits:this.NumFillBits, LineBits:this.NumLineBits};
    var shapes = new SWFSHAPERECORDS();
    shapes.buildRecords(this.ShapeRecords, bs, tag_code, currentNumBits);
}

SWFSHAPEWITHSTYLE.prototype.toString = function() {
    return "{FillStyles:"+this.FillStyles+" LineStyles:"+this.LineStyles+" numFillBits:"+this.NumFillBits+" NumLineBits:"+this.NumLineBits+" ShapeRecords:"+this.ShapeRecords+"}";
}

// SWFCXFORM

var SWFCXFORM = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.HasAddTerms   = 0;
        this.HasMultiTerms = 0;
    }
}

SWFCXFORM.prototype.parse = function(bs) {
    bs.byteAlign();
    var first6bits = bs.getUIBits(6);
    this.HasAddTerms   =  first6bits >> 5;
    this.HasMultiTerms = (first6bits >> 4) & 1;
    var nbits          =  first6bits & 0x0f;
    this.Nbits = nbits;
    if (this.HasMultiTerms) {
        this.RedMultiTerm   = bs.getSIBits(nbits);
        this.GreenMultiTerm = bs.getSIBits(nbits);
        this.BlueMultiTerm  = bs.getSIBits(nbits);
    }
    if (this.HasAddTerms) {
        this.RedAddTerm   = bs.getSIBits(nbits);
        this.GreenAddTerm = bs.getSIBits(nbits);
        this.BlueAddTerm  = bs.getSIBits(nbits);
    }
}

SWFCXFORM.prototype.build = function(bs) {
    bs.byteAlign();
    bs.putUIBit(this.HasAddTerms);
    bs.putUIBit(this.HasMultiTerms);
    var nbits = 0;
    if (this.HasMultiTerms) {
        var redMultiTermBits   = bs.need_bits_signed(this.RedMultiTerm);
        var greenMultiTermBits = bs.need_bits_signed(this.GreenMultiTerm);
        var blueMultiTermBits  = bs.need_bits_signed(this.BlueMultiTerm);
        nbits = (nbits > redMultiTermBits)  ?nbits:redMultiTermBits;
        nbits = (nbits > greenMultiTermBits)?nbits:greenMultiTermBits;
        nbits = (nbits > blueMultiTermBits) ?nbits:blueMultiTermBits;
    }
    if (this.HasAddTerms) {
        var redAddTermBits   = bs.need_bits_signed(this.RedAddTerm);
        var greenAddTermBits = bs.need_bits_signed(this.GreenAddTerm);
        var blueAddTermBits  = bs.need_bits_signed(this.BlueAddTerm);
        nbits = (nbits > redAddTermBits)  ?nbits:redAddTermBits;
        nbits = (nbits > greenAddTermBits)?nbits:greenAddTermBits;
        nbits = (nbits > blueAddTermBits) ?nbits:blueAddTermBits;
    }
    bs.putUIBits(nbits, 4);
    if (this.HasMultiTerms) {
        bs.putSIBits(this.RedMultiTerm  , nbits);
        bs.putSIBits(this.GreenMultiTerm, nbits);
        bs.putSIBits(this.BlueMultiTerm , nbits);
    }
    if (this.HasAddTerms) {
        bs.putSIBits(this.RedAddTerm  , nbits);
        bs.putSIBits(this.GreenAddTerm, nbits);
        bs.putSIBits(this.BlueAddTerm , nbits);
    }
}

// SWFCXFORMWITHALPHA

var SWFCXFORMWITHALPHA = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.HasAddTerms   = 0;
        this.HasMultiTerms = 0;
    }
}

SWFCXFORMWITHALPHA.prototype.parse = function(bs) {
    bs.byteAlign();
    var first6bits = bs.getUIBits(6);
    this.HasAddTerms   =  first6bits >> 5;
    this.HasMultiTerms = (first6bits >> 4) & 1;
    var nbits =           first6bits & 0x0f;
    this.Nbits = nbits;
    if (this.HasMultiTerms) {
        this.RedMultiTerm   = bs.getSIBits(nbits);
        this.GreenMultiTerm = bs.getSIBits(nbits);
        this.BlueMultiTerm  = bs.getSIBits(nbits);
        this.AlphaMultiTerm = bs.getSIBits(nbits);
    }
    if (this.HasAddTerms) {
        this.RedAddTerm   = bs.getSIBits(nbits);
        this.GreenAddTerm = bs.getSIBits(nbits);
        this.BlueAddTerm  = bs.getSIBits(nbits);
        this.AlphaAddTerm = bs.getSIBits(nbits);
    }
}

SWFCXFORMWITHALPHA.prototype.build = function(bs) {
    bs.byteAlign();
    bs.putUIBit(this.HasAddTerms);
    bs.putUIBit(this.HasMultiTerms);
    var nbits = 0;
    if (this.HasMultiTerms) {
        var redMultiTermBits   = bs.need_bits_signed(this.RedMultiTerm);
        var greenMultiTermBits = bs.need_bits_signed(this.GreenMultiTerm);
        var blueMultiTermBits  = bs.need_bits_signed(this.BlueMultiTerm);
        var alphaMultiTermBits = bs.need_bits_signed(this.AlphaMultiTerm);
        nbits = (nbits > redMultiTermBits)  ?nbits:redMultiTermBits;
        nbits = (nbits > greenMultiTermBits)?nbits:greenMultiTermBits;
        nbits = (nbits > blueMultiTermBits) ?nbits:blueMultiTermBits;
        nbits = (nbits > alphaMultiTermBits)?nbits:alphaMultiTermBits;
    }
    if (this.HasAddTerms) {
        var redAddTermBits   = bs.need_bits_signed(this.RedAddTerm);
        var greenAddTermBits = bs.need_bits_signed(this.GreenAddTerm);
        var blueAddTermBits  = bs.need_bits_signed(this.BlueAddTerm);
        var alphaAddTermBits = bs.need_bits_signed(this.AlphaAddTerm);
        nbits = (nbits > redAddTermBits)  ?nbits:redAddTermBits;
        nbits = (nbits > greenAddTermBits)?nbits:greenAddTermBits;
        nbits = (nbits > blueAddTermBits) ?nbits:blueAddTermBits;
        nbits = (nbits > alphaAddTermBits)?nbits:alphaAddTermBits;
    }
    bs.putUIBits(nbits, 4);
    if (this.HasMultiTerms) {
        bs.putSIBits(this.RedMultiTerm  , nbits);
        bs.putSIBits(this.GreenMultiTerm, nbits);
        bs.putSIBits(this.BlueMultiTerm , nbits);
        bs.putSIBits(this.AlphaMultiTerm, nbits);
    }
    if (this.HasAddTerms) {
        bs.putSIBits(this.RedAddTerm  , nbits);
        bs.putSIBits(this.GreenAddTerm, nbits);
        bs.putSIBits(this.BlueAddTerm , nbits);
        bs.putSIBits(this.AlphaAddTerm, nbits);
    }
}

// SWFCLIPEVENTFLAGS

var SWFCLIPEVENTFLAGS = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFCLIPEVENTFLAGS.prototype.parse = function(bs) {
    ;
}

SWFCLIPEVENTFLAGS.prototype.build = function(bs) {
    ;
}

// SWFCLIPACTIONRECORD

var SWFCLIPACTIONRECORD = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFCLIPACTIONRECORD.prototype.parse = function(bs) {
    ;
}

SWFCLIPACTIONRECORD.prototype.build = function(bs) {
    ;
}

// SWFCLIPACTIONS

var SWFCLIPACTIONS = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.AllEventFlags = 0;
        this.ClipActionRecords = [];
        this.FrameRate = 0;
    }
}

SWFCLIPACTIONS.prototype.parse = function(bs) {
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
    this.FrameRate = bs.getUI16LE(); // XXX getUI32LE if SWFv6 over
}

SWFCLIPACTIONS.prototype.build = function(bs) {
    bs.putUI16LE(0); // Reserved
    this.AllEventFlags.build(bs);
    var clipActionRecords = this.ClipActionRecords;
    for (var i = 0, n = clipActionRecords.length ; i < n ; i++) {
        clipActionRecords[i].build(bs);
    }
    bs.putUI16LE(this.FrameRate); // XXX putUI32LE if SWFv6 over
}

/* Header */
var SWFHeader = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.Signature  = "FWS"
        this.Version    = 0;
        this.FileLength = 0;
    }
}

SWFHeader.prototype.parse = function(bs) {
    this.Signature  = bs.getData(3);
    this.Version    = bs.getUI8();
    this.FileLength = bs.getUI32LE();
}


SWFHeader.prototype.build = function(bs) {
    bs.putData(this.Signature, 3);
    bs.putUI8(this.Version);
    bs.putUI32LE(this.FileLength);
}

// SWFMovieHeader

var SWFMovieHeader = function(bs) {
    if (bs) {
        this.parse(bs);
    } else {
        this.FrameSize  = new SWFRECT();
        this.FrameRate  = 0;
        this.FrameCount = 0;
    }
}

SWFMovieHeader.prototype.parse = function(bs) {
    this.FrameSize  = new SWFRECT(bs);
    this.FrameRate  = bs.getUI16LE();
    this.FrameCount = bs.getUI16LE();
}

SWFMovieHeader.prototype.build = function(bs) {
    this.FrameSize.build(bs);
    bs.putUI16LE(this.FrameRate);
    bs.putUI16LE(this.FrameCount);
}

/* Tag */

// SWFEnd

var SWFEnd = function(bs, tag_code, length) { // code:0
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFEnd.prototype.parse = function(bs) {
    ;
}

SWFEnd.prototype.build = function(bs) {
    ;
}

// SWFShowFrame

var SWFShowFrame = function(bs, tag_code, length) { // code:1
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFShowFrame.prototype.parse = function(bs) {
    ;
}

SWFShowFrame.prototype.build = function(bs) {
    ;
}

// SWFDefineShape

var SWFDefineShape = function(bs, tag_code, length) { // 2,22,32
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFDefineShape.prototype.parse = function(bs) {
    this.ShapeId = bs.getUI16LE();
    this.ShapeBounds = new SWFRECT(bs);
    this.Shapes = new SWFSHAPEWITHSTYLE(bs, this.tag_code);
}

SWFDefineShape.prototype.build = function(bs) {
    bs.putUI16LE(this.ShapeId);
    this.ShapeBounds.build(bs);
    this.Shapes.build(bs, this.tag_code);
}

// SWFPlaceObject

var SWFPlaceObject = function(bs, tag_code, length) { // code:4, 26
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFPlaceObject.prototype.parse = function(bs) {
    if (this.tag_code === 4) { // PlaceObject
        var byteOffset = bs.byteOffset;
        this.CharacterId = bs.getUI16LE();
        this.Depth = bs.getUI16LE();
        this.Matrix = new SWFMATRIX(bs);
        if (byteOffset + this.tag_length < bs.byteOffset) {
            this.Colortransform = new SWFCXFORM(bs);
        }
    } else { // PlaceObject2
        var placeFlag = bs.getUI8();
        this.PlaceFlagHasClipActions = (placeFlag >> 7) & 0x01
        this.PlaceFlagHasClipDepth   = (placeFlag >> 6) & 0x01
        this.PlaceFlagHasName        = (placeFlag >> 5) & 0x01
        this.PlaceFlagHasRatio       = (placeFlag >> 4) & 0x01
        this.PlaceFlagHasColorTransform = (placeFlag >> 3) & 0x01
        this.PlaceFlagHasMatrix      = (placeFlag >> 2) & 0x01
        this.PlaceFlagHasCharacter   = (placeFlag >> 1) & 0x01;
        this.PlaceFlagHasMove        =  placeFlag       & 0x01;
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

SWFPlaceObject.prototype.build = function(bs) {
    if (this.tag_code === 4) { // PlaceObject
        bs.putUI16LE(this.CharacterId);
        bs.putUI16LE(this.Depth);
        this.Matrix.build(bs);
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

// SWFRemoveObject

var SWFRemoveObject = function(bs, tag_code, length) { // 5, 28
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFRemoveObject.prototype.parse = function(bs) {
    if (this.tag_code === 5) { // RemoveObject    if (bs) {
        this.CharacterId = bs.getUI16LE();
        this.Depth = bs.getUI16LE();
    } else { // RemoveObject2
        this.Depth = bs.getUI16LE();
    }
}

SWFRemoveObject.prototype.build = function(bs) {
    if (this.tag_code === 5) { // RemoveObject
        bs.putUI16LE(this.CharacterId);
        bs.putUI16LE(this.Depth);
    } else { // RemoveObject2
        bs.putUI16LE(this.Depth);
    }
}

// SWFDefineBitsJPEG

var SWFDefineBitsJPEG = function(bs, tag_code, length) { // code:6, 21, 35
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        this.ImageData = '';
        if (this.tag_code === 35) { // DefineBitsJPEG3
            this.BitmapAlphaData = '';
        }
    }
}

SWFDefineBitsJPEG.prototype.parse = function(bs) {
    this.CharacterID = bs.getUI16LE();
    var imageDataLen = this.tag_length - 2;
    if (this.tag_code === 35) { // DefineBitsJPEG3
        this.AlphaDataOffset = bs.getUI32LE();
        imageDataLen = this.AlphaDataOffset;
    }
    this.ImageData = bs.getData(imageDataLen);
    if (this.tag_code === 35) { // DefineBitsJPEG3
        this.BitmapAlphaData = bs.getData(this.tag_length - 2 - imageDataLen);
    }
}

SWFDefineBitsJPEG.prototype.build = function(bs) {
    bs.putUI16LE(this.CharacterID);
    if (this.tag_code === 35) { // DefineBitsJPEG3
        bs.putUI32LE(this.ImageData.length); // AlphaDataOffset
    }
    bs.putData(this.ImageData);
    if (this.tag_code === 35) { // DefineBitsJPEG3
        bs.putData(this.BitmapAlphaData);
    }
}

// SWFJPEGTables

var SWFJPEGTables = function(bs, tag_code, length) { // code:8
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        this.JPEGData = '';
    }
}

SWFJPEGTables.prototype.parse = function(bs) {
    this.JPEGData = bs.getData(this.tag_length);
}

SWFJPEGTables.prototype.build = function(bs) {
    bs.putData(this.JPEGData);
}

// SWFSetBackgroundColor

var SWFSetBackgroundColor = function(bs, tag_code, length) { // code:9
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        this.BackgroundColor = new SWFRGB();
    }
}

SWFSetBackgroundColor.prototype.parse = function(bs) {
    this.BackgroundColor = new SWFRGB(bs);
}

SWFSetBackgroundColor.prototype.build = function(bs) {
    this.BackgroundColor.build(bs);
}

// SWFDefineFont

var SWFDefineFont = function(bs, tag_code, length) { // code:10,48
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        if (this.tag_code == 10) { // DefineFont2
            this.NumGlyphs = 0;
            this.GlyphShapeTable = [];
        } else { // DefineFont2
            this.FontFlagsHasLayout   = 0;
            this.FontFlagsShiftJIS    = 0;
            this.FontFlagsSmallText   = 0;
            this.FontFlagsANSI        = 0;
            this.FontFlagsWideOffsets = 0;
            this.FontFlagsWideCodes   = 0;
            this.FontFlagsItalic      = 0;
            this.FontFlagsBold        = 0;
            this.FontName = '';
            this.NumGlyphs = 0;
            this.GlyphShapeTable = [];
        }
    }
}

SWFDefineFont.prototype.parse = function(bs) {
    this.FontID = bs.getUI16LE();
    if (this.tag_code == 10) { // DefineFont
        var numGlyphs = bs.getUI16LE(); // ???
        this.NumGlyphs = numGlyphs; // ???
        var offsetTable = [];
        for (var i = 0 ; i < numGlyphs ; i++) {
            offsetTable.push(bs.getUI16LE());
        }
        this.OffsetTable = offsetTable;
        var glyphShapeTable = [];
        for (var i = 0 ; i < numGlyphs ; i++) {
            glyphShapeTable.push(new SWFSHAPE(bs, this.tag_code));
        }
        this.GlyphShapeTable = glyphShapeTable;
    } else { // 48: DefineFont2
        var fontFlags = bs.getUI8();
        this.FontFlagsHasLayout   = (fontFlags >>> 7) & 1;
        this.FontFlagsShiftJIS    = (fontFlags >>> 6) & 1;
        this.FontFlagsSmallText   = (fontFlags >>> 5) & 1;
        this.FontFlagsANSI        = (fontFlags >>> 4) & 1;
        this.FontFlagsWideOffsets = (fontFlags >>> 3) & 1;
        this.FontFlagsWideCodes   = (fontFlags >>> 2) & 1;
        this.FontFlagsItalic      = (fontFlags >>> 1) & 1;
        this.FontFlagsBold        = (fontFlags      ) & 1;
        this.LanguageCode = new SWFLANGCODE(bs, this.tag_code);
        this.FontNameLen = bs.getUI8();
        if (this.FontNameLen) {
            this.FontName = bs.getData(this.FontNameLen);
        }
        var numGlyphs = bs.getUI16LE();
        this.NumGlyphs = numGlyphs;
        if (numGlyphs === 0) {
            return ; // no glyphs field.
        }
        var offsetTable = [];
        if (this.FontFlagsWideOffsets) {
            for (var i = 0 ; i < numGlyphs ; i++) {
                offsetTable.push(bs.getUI32LE());
            }
            this.OffsetTable = offsetTable;
            this.CodeTableOffset = bs.getUI32LE();
        } else {
            for (var i = 0 ; i < numGlyphs ; i++) {
                offsetTable.push(bs.getUI16LE());
            }
            this.OffsetTable = offsetTable;
            this.CodeTableOffset = bs.getUI16LE();
        }
        var glyphShapeTable = [];
        for (var i = 0 ; i < numGlyphs ; i++) {
            glyphShapeTable.push(new SWFSHAPE(bs, this.tag_code));
        }
        this.GlyphShapeTable = glyphShapeTable;
        var codeTable = [];
        for (var i = 0 ; i < numGlyphs ; i++) {
            codeTable.push(bs.getUI16LE());
        }
        this.CodeTable = codeTable;
        if (this.FontFlagsHasLayout) {
            this.FontAscent  = bs.getUI16LE();
            this.FontDescent = bs.getUI16LE();
            this.FontLeading = bs.getUI16LE();
            var fontAdvanceTable = [];
            for (var i = 0 ; i < numGlyphs ; i++) {
                fontAdvanceTable.push(bs.getUI16LE());
            }
            this.FontAdvanceTable = fontAdvanceTable;
            var fontBoundsTable = [];
            for (var i = 0 ; i < numGlyphs ; i++) {
                fontBoundsTable.push(new SWFRECT(bs));
            }
            this.FontBoundsTable = fontBoundsTable;
        }
    }
}

SWFDefineFont.prototype.build = function(bs) {
    bs.putUI16LE(this.FontID);
    if (this.tag_code == 10) { // DefineFont
        var numGlyphs = offsetTable.length;
        bs.putUI16LE(numGlyphs); // ???
        this.NumGlyphs = numGlyphs;
        for (i = 0 ; i < numGlyphs ; i++) {
            bs.putUI16LE(this.OffsetTable[i]);
        }
        var currentNumBits = {FillBits:0, LineBits:0};
        for (var i = 0 ; i < numGlyphs ; i++) {
            this.GlyphShapeTable[i].build(bs, this.tag_code, currentNumBits);
        }
    } else { // 48: DefineFont2
        bs.putUI8((this.FontFlagsHasLayout   << 7) |
                  (this.FontFlagsShiftJIS    << 6) |
                  (this.FontFlagsSmallText   << 5) |
                  (this.FontFlagsANSI        << 4) |
                  (this.FontFlagsWideOffsets << 3) |
                  (this.FontFlagsWideCodes   << 2) |
                  (this.FontFlagsItalic      << 1) |
                  this.FontFlagsBold);
        this.LanguageCode.build(bs);
        this.FontNameLen = this.FontName.length;
        bs.putUI8(this.FontNameLen);
        if (this.FontNameLen) {
            bs.putData(this.FontName);
        }
        numGlyphs = this.OffsetTable.length;
        this.NumGlyphs = numGlyphs;
        bs.putUI16LE(numGlyphs);
        if (numGlyphs === 0) {
            return ; // no glyphs field.
        }
        var offsetOfOffsetTable = [];
        if (this.FontFlagsWideOffsets) {
            for (var i = 0 ; i < numGlyphs ; i++) {
                offsetOfOffsetTable.push(bs.getOffset().byteOffset);
                bs.putUI32LE(0); // dummy
            }
            bs.putUI32LE(0); // CodeTableOffset dummy
        } else {
            for (var i = 0 ; i < numGlyphs ; i++) {
                offsetOfOffsetTable.push(bs.getOffset().byteOffset);
                bs.putUI16LE(0); // dummy
            }
            var offsetOfCodeTableOffset = bs.getOffset();
            bs.putUI16LE(0); // CodeTableOffset dummy
        }
        var currentNumBits = {FillBits:0, LineBits:0};
        for (var i = 0 ; i < numGlyphs ; i++) {
            this.GlyphShapeTable[i].build(bs, this.tag_code, currentNumBits);
        }
    }
}

// SWFDefineFontName

var SWFDefineFontName = function(bs, tag_code, length) { // code:48
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        this.FontID = 0;
        this.FontName = '';
        this.FontCopyright = '';
    }
}

SWFDefineFontName.prototype.parse = function(bs) {
    this.FontID = bs.getUI16LE();
    this.FontName = bs.getDataUntil("\0"); // STRING
    this.FontCopyright = bs.getDataUntil("\0"); // STRING
}

SWFDefineFontName.prototype.build = function(bs) {
    bs.putUI16LE(this.FontID);
    bs.putData(this.FontName+"\0"); // STRING
    bs.putData(this.FontCopyright+"\0"); // STRING
}

// SWFDoAction

var SWFDoAction = function(bs, tag_code, length) { // code:12
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        this.Actions = [];
    }
}

SWFDoAction.prototype.parse = function(bs) {
    this.Actions = bs.getData(this.tag_length - 1);
    this.ActionEndFlag = bs.getUI8();
}

SWFDoAction.prototype.build = function(bs) {
    bs.putData(this.Actions);
    bs.putUI8(0);
}

// SWFDefineBitsLossless

var SWFDefineBitsLossless = function(bs, tag_code, length) { // code:20,36
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFDefineBitsLossless.prototype.parse = function(bs) {
    this.CharacterID = bs.getUI16LE();
    this.BitmapFormat = bs.getUI8();
    this.BitmapWidth  = bs.getUI16LE();
    this.BitmapHeight = bs.getUI16LE();
    var zlibBitmapDataLen = this.tag_length - 7;
    if (this.BitmapFormat === 3) {
        this.BitmapColorTableSize = bs.getUI8() + 1;
        zlibBitmapDataLen--;
    }
    this.ZlibBitmapData = bs.getData(zlibBitmapDataLen);
}

SWFDefineBitsLossless.prototype.build = function(bs) {
    bs.putUI16LE(this.CharacterID);
    bs.putUI8(this.BitmapFormat);
    bs.putUI16LE(this.BitmapWidth);
    bs.putUI16LE(this.BitmapHeight);
    if (this.BitmapFormat === 3) {
        bs.putUI8(this.BitmapColorTableSize - 1);
    }
    bs.putData(this.ZlibBitmapData);
}

// SWFProtect

var SWFProtect = function(bs, tag_code, length) { // code:24
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFProtect.prototype.parse = function(bs) {
    ;
}

SWFProtect.prototype.build = function(bs) {
    ;
}

// SWFDefineEditText

var SWFDefineEditText = function(bs, tag_code, length) { // code:37
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFDefineEditText.prototype.parse = function(bs) {
    this.CharacterID = bs.getUI16LE();
    this.Bound = new SWFRECT(bs);
    var flag1 = bs.getUI8();
    this.HasText      = (flag1 >>> 7) & 1;
    this.WordWrap     = (flag1 >>> 6) & 1;
    this.Multiline    = (flag1 >>> 5) & 1;
    this.Password     = (flag1 >>> 4) & 1;
    this.ReadOnly     = (flag1 >>> 3) & 1;
    this.HasTextColor = (flag1 >>> 2) & 1;
    this.HasMaxLength = (flag1 >>> 1) & 1;
    this.HasFont      =  flag1        & 1;
    var flag2 = bs.getUI8();
    this.HasFontClass = (flag2 >>> 7) & 1;
    this.AutoSize     = (flag2 >>> 6) & 1;
    this.HasLayout    = (flag2 >>> 5) & 1;
    this.NoSelect     = (flag2 >>> 4) & 1;
    this.Border       = (flag2 >>> 3) & 1;
    this.WasStatic    = (flag2 >>> 2) & 1;
    this.HTML         = (flag2 >>> 1) & 1;
    this.UseOutlines  =  flag2        & 1;
    if (this.HasFont) {
        this.FontID = bs.getUI16LE();
        if (this.HasFontClass) { // can't be true if hasFont is true
            this.FontClass = bs.getDataUntil("\0"); // STRING
        }
        this.FontHeight = bs.getUI16LE();
    }
    if (this.HasTextColor) {
        this.TextColor = new SWFRGBA(bs);
    }
    if (this.HasMaxLength) {
        this.MaxLength = bs.getUI16LE();
    }
    if (this.HasLayout) {
        this.Align = bs.getUI8();
        this.LeftMargin  = bs.getUI16LE();
        this.RightMargin = bs.getUI16LE();
        this.Indent = bs.getUI16LE();
        this.Leading = bs.getUI16LE();
    }
    this.VariableName = bs.getDataUntil("\0"); // STRING
    if (this.HasText) {
        this.InitialText = bs.getDataUntil("\0"); // STRING
    }
}

SWFDefineEditText.prototype.build = function(bs) {
    bs.putUI16LE(this.CharacterID);
    this.Bound.build(bs);
        // flag check
    this.HasFont      = (this.FontID)?1:0;
    this.HasFontClass = (this.FontClass)?1:0;
    this.HasTextColor = (this.TextColor)?1:0;
    this.HasMaxLength = (this.MaxLength)?1:0;
    this.HasLayout    = (this.Align)?1:0;
    this.HasText      = (this.InitialText)?1:0;
    bs.putUI8(this.HasText      << 7 |
              this.WordWrap     << 6 |
              this.Multiline    << 3 |
              this.Password     << 4 |
              this.ReadOnly     << 3 |
              this.HasTextColor << 2 |
              this.HasMaxLength << 1 |
              this.HasFont);
    bs.putUI8(this.HasFontClass << 7 |
              this.AutoSize     << 6 |
              this.HasLayout    << 5 |
              this.NoSelect     << 4 |
              this.Border       << 3 |
              this.WasStatic    << 2 |
              this.HTML         << 1 |
              this.UseOutlines);
    if (this.HasFont) {
        bs.putUI16LE(this.FontID);
        if (this.HasFontClass) { // can't be true if hasFont is true
            bs.putData(this.FontClass+"\0"); // STRING
        }
        bs.putUI16LE(this.FontHeight);
    }
    if (this.HasTextColor) {
        this.TextColor.build(bs);
    }
    if (this.HasMaxLength) {
        bs.putUI16LE(this.MaxLength);
    }
    if (this.HasLayout) {
        bs.putUI8(this.Align);
        bs.putUI16LE(this.LeftMargin);
        bs.putUI16LE(this.RightMargin);
        bs.putUI16LE(this.Indent);
        bs.putUI16LE(this.Leading);
    }
    bs.putData(this.VariableName+"\0"); // STRING
    if (this.HasText) {
        bs.putDat(this.InitialText+"\0"); // STRING
    }
}

// SWFDefineSprite

var SWFDefineSprite = function(bs, tag_code, length) { // code:39
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        this.SpriteID = 0;
        this.FrameCount = 0;
        this.ControlTags = [];
    }
}

SWFDefineSprite.prototype.parse = function(bs) {
    var parser = new SWFParser(null);
    this.SpriteID = bs.getUI16LE();
    this.FrameCount = bs.getUI16LE();
    this.ControlTags = parser.parseTags(bs);
}

SWFDefineSprite.prototype.build = function(bs) {
    var builder = new SWFBuilder(null);
    bs.putUI16LE(this.SpriteID);
    bs.putUI16LE(this.FrameCount);
    builder.buildTags(bs, this.ControlTags);
}

// SWFFrameLabel

var SWFFrameLabel = function(bs, tag_code, length) { // code:43
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs)
    } else {
        this.Name = '';
    }
}

SWFFrameLabel.prototype.parse = function(bs) {
    this.Name = bs.getDataUntil("\0");
}

SWFFrameLabel.prototype.build = function(bs) {
    bs.putData(this.Name);
    bs.putUI8(0);
}

// SWFDefineMorphShape

var SWFDefineMorphShape = function(bs, tag_code, length) { // 46
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs);
    } else {
        ;
    }
}

SWFDefineMorphShape.prototype.parse = function(bs) {
    this.CharacterId = bs.getUI16LE();
    this.StartBounds = new SWFRECT(bs);
    this.EndBounds = new SWFRECT(bs);
    var offsetOfOffset = bs.getOffset();
    this.Offset = bs.getUI32LE();
    this.MorphFillStyles = new SWFMORPHFILLSTYLEARRAY(bs, this.tag_code);
    this.MorphLineStyles = new SWFMORPHLINESTYLEARRAY(bs, this.tag_code);
    this.StartEdges = new SWFSHAPE(bs, this.tag_code);
    var offsetOfEndEdges = bs.getOffset();
    if (offsetOfEndEdges.byteOffset != offsetOfOffset.byteOffset + this.Offset + 4) {
        console.warn("DefineMorphShape CharacterId("+ this.CharacterId+"): offsetOfEndEdges.byteOffset("+offsetOfEndEdges.byteOffset+") != offsetOfOffset.byteOffset("+offsetOfOffset.byteOffset+") + this.Offset("+this.Offset+") + 4");
        bs.setOffset(offsetOfOffset.byteOffset + this.Offset + 4, 0);
    }
    this.EndEdges = new SWFSHAPE(bs, this.tag_code);
}

SWFDefineMorphShape.prototype.build = function(bs) {
    bs.putUI16LE(this.CharacterId);
    this.StartBounds.build(bs);
    this.EndBounds.build(bs);
    var offsetOfOffset = bs.getOffset();
    bs.byteAlign();
    var offsetOfOffsetField = bs.getOffset();
    bs.putUI32LE(0); // Offset dummy
    this.MorphFillStyles.build(bs, tag_code);
    this.MorphLineStyles.build(bs, tag_code);
    var currentNumBits = {};
    currentNumBits.FillBits = bs.need_bits_unsigned(this.MorphFillStyles.FillStyles.length);
    currentNumBits.LineBits = bs.need_bits_unsigned(this.MorphLineStyles.LineStyles.length);
    this.StartEdges.build(bs, tag_code, currentNumBits);
    var offsetOfEndEges = bs.getOffset();
    this.Offset = offsetOfEndEges.byteOffset - offsetOfOffset.byteOffset - 4;
    bs.setUI32LE(this.Offset, offsetOfOffsetField.byteOffset);
    var currentNumBits = {FillBits:0, LineBits:0};
    this.EndEdges.build(bs, tag_code, currentNumBits);
}

// SWFMORPHFILLSTYLE

var SWFMORPHFILLSTYLE = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        ;
    }
}

SWFMORPHFILLSTYLE.prototype.parse = function(bs, tag_code) {
    this.FillStyleType = bs.getUI8();
    switch (this.FillStyleType) {
    case 0x00: // solid fill
        this.StartColor = new SWFRGBA(bs);
        this.EndColor = new SWFRGBA(bs);
        break;
    case 0x10: // linear gradient fill
    case 0x12: // radial gradient fill
        this.StartGradientMatrix = new SWFMATRIX(bs);
        this.EndGradientMatrix = new SWFMATRIX(bs);
        this.Gradient = new SWFMORPHGRADIENT(bs, tag_code);
        break;
    case 0x13: // focal radial gradient fill
        this.StartGradientMatrix = new SWFMATRIX(bs);
        this.EndGradientMatrix = new SWFMATRIX(bs);
        this.Gradient = new SWFFOCALGRADIENT(bs, tag_code);
        break;
    case 0x40: // repeating bitmap fill
    case 0x41: // clipped bitmap fill
    case 0x42: // non-smoothed repeating bitmap
    case 0x43: // non-smoothed clipped bitmap
        this.BitmapId = bs.getUI16LE();
        this.StartBitmapMatrix = new SWFMATRIX(bs);
        this.EndBitmapMatrix = new SWFMATRIX(bs);
        break;
    }
}

SWFMORPHFILLSTYLE.prototype.build = function(bs) {
    bs.putUI8(this.FillStyleType);
    switch (this.FillStyleType) {
    case 0x00: // solid fill
        this.StartColor.build(bs);
        this.EndColor.build(bs);
        break;
    case 0x10: // linear gradient fill
    case 0x12: // radial gradient fill
    case 0x13: // focal radial gradient fill
        this.StartGradientMatrix.build(bs);
        this.EndGradientMatrix.build(bs);
        this.Gradient.build(bs);
        break;
    case 0x40: // repeating bitmap fill
    case 0x41: // clipped bitmap fill
    case 0x42: // non-smoothed repeating bitmap
    case 0x43: // non-smoothed clipped bitmap
        bs.putUI16LE(this.BitmapId);
        this.StartBitmapMatrix.build(bs);
        this.EndBitmapMatrix.build(bs);
        break;
    }
}

// SWFMORPHGRADIENT

var SWFMORPHGRADIENT = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        ;
    }
}

SWFMORPHGRADIENT.prototype.parse = function(bs, tag_code) {
    var numGradients = bs.getUI8();
    this.NumGradients = numGradients;
    var gradientRecords = [];
    for (i = 0 ; i < numGradients ; i++) {
        gradientRecords.push(new SWFMORPHGRADRECORD(bs, tag_code));
    }
    this.GradientRecords = gradientRecords;
}

SWFMORPHGRADIENT.prototype.build = function(bs) {
    var gradientRecords = this.GradientRecords;
    var numGradients = gradientRecords.length;
    bs.putUI8(numGradients);
    for (i = 0 ; i < numGradients ; i++) {
        gradientRecords[i].build(bs);
    }
}

// SWFMORPHGRADRECORD

var SWFMORPHGRADRECORD = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        ;
    }
}

SWFMORPHGRADRECORD.prototype.parse = function(bs, tag_code) {
    this.StartRatio = bs.getUI8();
    this.StartColor = new SWFRGBA(bs);
    this.EndRatio = bs.getUI8();
    this.EndColor = new SWFRGBA(bs);
}

SWFMORPHGRADRECORD.prototype.build = function(bs) {
    bs.putUI8(this.StartRatio);
    this.StartColor.build(bs);
    bs.putUI8(this.EndRatio);
    this.EndColor.build(bs);
}

// SWFMORPHLINESTYLE

var SWFMORPHLINESTYLE = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        ;
    }
}

SWFMORPHLINESTYLE.prototype.parse = function(bs, tag_code) {
    this.StartWidth = bs.getUI16LE();
    this.EndWidth   = bs.getUI16LE();
    this.StartColor = new SWFRGBA(bs);
    this.EndColor   = new SWFRGBA(bs);
}

SWFMORPHLINESTYLE.prototype.build = function(bs) {
    bs.putUI16LE(this.StartWidth);
    bs.putUI16LE(this.EndWidth);
    this.StartColor.build(bs);
    this.EndColor.build(bs);
}

// SWFMORPHFILLSTYLEARRAY

var SWFMORPHFILLSTYLEARRAY = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        ;
    }
}

SWFMORPHFILLSTYLEARRAY.prototype.parse = function(bs, tag_code) {
    var fillStyleCount = bs.getUI8();
    if (fillStyleCount === 0xff) {
        fillStyleCount = bs.getUI16LE();
    }
    this.FillStyleCount = fillStyleCount;
    var fillStyles = [];
    for (var i = 0 ; i < fillStyleCount ; i++) {
        fillStyles.push(new SWFMORPHFILLSTYLE(bs, tag_code));
    }
    this.FillStyles = fillStyles;
}

SWFMORPHFILLSTYLEARRAY.prototype.build = function(bs, tag_code) {
    fillStyleCount = this.FillStyles.length;
    if (fillStyleCount < 0xff) {
        bs.putUI8(fillStyleCount);
    } else {
        bs.putUI8(0xff);
        bs.putUI16LE(fillStyleCount);
    }
    for (var i = 0 ; i < fillStyleCount ; i++) {
        fillStyles[i].build(bs);
    }
}

// SWFMORPHLINESTYLEARRAY

var SWFMORPHLINESTYLEARRAY = function(bs, tag_code) {
    if (bs) {
        this.parse(bs, tag_code);
    } else {
        ;
    }
}

SWFMORPHLINESTYLEARRAY.prototype.parse = function(bs, tag_code) {
    var lineStyleCount = bs.getUI8();
    if (lineStyleCount === 0xff) {
        lineStyleCount = bs.getUI16LE();
    }
    this.LineStyleCount = lineStyleCount;
    var lineStyles = [];
    for (var i = 0 ; i < lineStyleCount ; i++) {
        lineStyles.push(new SWFMORPHLINESTYLE(bs, tag_code));
    }
    this.LineStyles = lineStyles;
}

SWFMORPHLINESTYLEARRAY.prototype.build = function(bs, tag_code) {
    lineStyleCount = this.LineStyles.length;
    if (lineStyleCount < 0xff) {
        bs.putUI8(lineStyleCount);
    } else {
        bs.putUI8(0xff);
        bs.putUI16LE(lineStyleCount);
    }
    for (var i = 0 ; i < lineStyleCount ; i++) {
        lineStyles[i].build(bs);
    }
}

// SWFUnknownTag

var SWFUnknownTag = function(bs, tag_code, length) { // code:etc
    this.tag_code = tag_code;
    this.tag_length = length;
    if (bs) {
        this.parse(bs, tag_code, length);
    } else {
        ;
    }
}

SWFUnknownTag.prototype.parse = function(bs) {
    this.data = bs.getData(this.tag_length);
}

SWFUnknownTag.prototype.build = function(bs) {
    bs.putData(this.data);
}

var SWFCanvas = function (canvas_id) {
    var canvas = document.getElementById(canvas_id);
    this.canvas = canvas;
    var ctx = canvas.getContext('2d');
    this.setBackgroundColor = function(rgb) {
	console.debug('SWFCanvas::setBackgroundColor('+rgb+')');
	canvas.style.backgroundColor = rgb.toStringCSS();
    }
    // http://www.html5.jp/canvas/how5.html
    this.drawRadialGradient = function(x, y, w, colorStops) {
        ctx.beginPath();
        var grad  = ctx.createRadialGradient(x, y, 0, x, y, w);
        if (colorStops) {
            for (var i = 0, n = colorStops.length; i < n ; i++) {
                var ratio = colorStops[i][0], color = colorStops[i][1];
                grad.addColorStop(ratio, color);
            }
        }
        ctx.fillStyle = grad;
        ctx.rect(x-w, y-w, x+w, y+w);
        ctx.fill();
    }
    this.drawLinearGradient = function(x1, y1, x2, y2, x3, y3, colorStops) {
        ctx.beginPath();
        var grad  = ctx.createLinearGradient(x1, y1, x3, y3);
        if (colorStops) {
            for (var i = 0, n = colorStops.length; i < n ; i++) {
                var ratio = colorStops[i][0], color = colorStops[i][1];
                grad.addColorStop(ratio, color);
            }
        }
        ctx.fillStyle = grad;
        ctx.rect(x1, y1, x2, y2);
        ctx.fill();
    }
    // ex) drawFill([[10, 10],[100, 10], [100, 100], [10, 100]], 'yellow', 3);
    this.drawFill = function(edges, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(edges[0][0], edges[0][1]);
        for (var i = 1, n = edges.length ; i < n ; i++) {
            console.debug(edges[i][0]+"-"+edges[i][1])
            ctx.lineTo(edges[i][0], edges[i][1]);
        }
        ctx.closePath();
        ctx.fill();
    }
    // https://developer.mozilla.org/ja/Canvas_tutorial/Applying_styles_and_colors
    // ex) drawLines([[10, 10],[100, 10], [100, 100], [10, 100]], 'yellow', 3);
    this.drawLines = function(edges, color, width) {
        ctx.lineWidth = width?width:0;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(edges[0][0], edges[0][1]);
        for (var i = 1, n = edges.length ; i < n ; i++) {
            console.debug(edges[i][0]+"-"+edges[i][1])
            ctx.lineTo(edges[i][0], edges[i][1]);
        }
        ctx.closePath();
        ctx.stroke();
    }
}
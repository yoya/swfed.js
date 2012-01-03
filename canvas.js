var SWFCanvas = function (canvas_id) {
    var canvas = document.getElementById(canvas_id);
    var ctx = canvas.getContext('2d');
  /* 四角を描く */  ctx.beginPath();  ctx.moveTo(20, 20);  ctx.lineTo(120, 20);  ctx.lineTo(120, 120);  ctx.lineTo(20, 120);  ctx.closePath();  ctx.stroke();
    this.setBackgroundColor = function(rgb) {
	console.debug(rgb);
	canvas.style.backgroundColor = 'rgb('+rgb.Red+','+rgb.Green+','+rgb.Blue+')';
    }
}
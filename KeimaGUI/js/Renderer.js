var Renderer;
(function (Renderer) {
    var container;
    var canvas;
    var context;
    function initialize() {
        container == document.querySelector(".container");
        canvas = document.querySelector(".board");
        canvas.width = 1920;
        canvas.height = 1920;
        context = canvas.getContext('2d');
    }
    Renderer.initialize = initialize;
    function drawLine(fillStyle, lineWidth, x1, y1, x2, y2) {
        context.save();
        {
            context.lineWidth = lineWidth;
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        }
        context.restore();
    }
    Renderer.drawLine = drawLine;
    function fillRect(fillStyle, x, y, width, height) {
        context.fillStyle = fillStyle;
        context.fillRect(x, y, width, height);
    }
    Renderer.fillRect = fillRect;
    function drawImage(image, offsetX, offsetY) {
        context.drawImage(image, offsetX, offsetY);
    }
    Renderer.drawImage = drawImage;
    function drawImageScaled(image, offsetX, offsetY, width, height) {
        context.drawImage(image, offsetX, offsetY, width, height);
    }
    Renderer.drawImageScaled = drawImageScaled;
    function drawTransparentImage(image, alpha, offsetX, offsetY, width, height) {
        context.save();
        {
            context.globalAlpha = alpha;
            context.drawImage(image, offsetX, offsetY, width, height);
        }
        context.restore();
    }
    Renderer.drawTransparentImage = drawTransparentImage;
    function drawText(text, font, fillStyle, align, baseline, x, y) {
        context.save();
        {
            /* フォントスタイルを定義 */
            context.font = font;
            context.fillStyle = fillStyle;
            context.textAlign = align;
            context.textBaseline = baseline;
            context.fillText(text, x, y);
        }
        context.restore();
    }
    Renderer.drawText = drawText;
    function drawCircle(x, y, radius) {
        context.save();
        {
            context.lineWidth = 8;
            context.beginPath();
            //context.fillStyle = 'gray';
            context.strokeStyle = 'gray';
            context.arc(x, y, radius, 0, Math.PI * 2, false);
            //context.fill();
            context.stroke();
        }
        context.restore();
    }
    Renderer.drawCircle = drawCircle;
    function fillCircle(x, y, radius) {
        context.save();
        {
            context.lineWidth = 8;
            context.beginPath();
            context.fillStyle = 'black';
            //context.strokeStyle = 'gray';
            context.arc(x, y, radius, 0, Math.PI * 2, false);
            context.fill();
            //context.stroke();
        }
        context.restore();
    }
    Renderer.fillCircle = fillCircle;
})(Renderer || (Renderer = {}));
//# sourceMappingURL=Renderer.js.map
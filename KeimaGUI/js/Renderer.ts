namespace Renderer {
    let container: HTMLDivElement;
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D;

    export function initialize() {
        container == <HTMLDivElement>document.querySelector(".container");
        canvas = <HTMLCanvasElement>document.querySelector(".board");
        canvas.width = 1920;
        canvas.height = 1920;
        context = canvas.getContext('2d');
    }

    export function drawLine(fillStyle: string, lineWidth: number, x1: number, y1: number, x2: number, y2: number) {
        context.save(); {
            context.lineWidth = lineWidth;
            context.beginPath();
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        } context.restore();
    }

    export function fillRect(fillStyle: string, x: number, y: number, width: number, height: number) {
        context.fillStyle = fillStyle;
        context.fillRect(x, y, width, height);
    }

    export function drawImage(image: HTMLImageElement, offsetX: number, offsetY: number) {
        context.drawImage(image, offsetX, offsetY);
    }

    export function drawImageScaled(image: HTMLImageElement, offsetX: number, offsetY: number, width: number, height: number) {
        context.drawImage(image, offsetX, offsetY, width, height);
    }

    export function drawTransparentImage(image: HTMLImageElement, alpha: number, offsetX: number, offsetY: number, width: number, height: number) {
        context.save(); {
            context.globalAlpha = alpha;
            context.drawImage(image, offsetX, offsetY, width, height);
        } context.restore();
    }

    export function drawText(text: string, font: string, fillStyle: string, align: string, baseline: string, x: number, y: number) {
        context.save(); {
            /* フォントスタイルを定義 */
            context.font = font;
            context.fillStyle = fillStyle;

            context.textAlign = align;
            context.textBaseline = baseline;
            context.fillText(text, x, y);
        } context.restore();
    }

    export function drawCircle(x: number, y: number, radius: number) {
        context.save(); {
            context.lineWidth = 8;
            context.beginPath();
            //context.fillStyle = 'gray';
            context.strokeStyle = 'gray';
            context.arc(x, y, radius, 0, Math.PI * 2, false);
            //context.fill();
            context.stroke();
        } context.restore();
    }

    export function fillCircle(x: number, y: number, radius: number) {
        context.save(); {
            context.lineWidth = 8;
            context.beginPath();
            context.fillStyle = 'black';
            //context.strokeStyle = 'gray';
            context.arc(x, y, radius, 0, Math.PI * 2, false);
            context.fill();
            //context.stroke();
        } context.restore();
    }
}
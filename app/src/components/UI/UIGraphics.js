/**
 * Created by Cesumilo on 05/02/2017.
 */

module.exports = {

    getCanvasCoordinates: function(canvas, x, y) {
        var rect = canvas.getBoundingClientRect();
        return { x: x - rect.left, y: y - rect.top };
    },

    euclidianDist: function(x1, y1, x2, y2) {
        return (Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)));
    },

    drawCircle: function(ctx, centerX, centerY, radius) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(255, 95, 76, " + 0.5 + ")";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#8C0E00';
        ctx.closePath();
        ctx.stroke();
    },

    drawLine: function(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#8C0E00';
        ctx.closePath();
        ctx.stroke();
    },

    drawBezierCurve: function(ctx, x1, y1, x2, y2, x3, y3, x4, y4) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#333";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
        ctx.closePath();
        ctx.stroke();
    },

    drawRoundedRect: function(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke === "undefined" ) {
            stroke = true;
        }
        if (typeof radius === "undefined") {
            radius = 5;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke) {
            ctx.stroke();
        }
        if (fill) {
            ctx.fill();
        }
    }
};
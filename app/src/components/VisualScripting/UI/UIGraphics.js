/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import $ from 'jquery';

module.exports = {

    /**
     * Compute the string height in terms of the font and the string.
     * @param {string} str Contains the string which will be used to compute his height.
     * @param {object} font Contains the font which will be used to print the string in str.
     * @returns {{ascent: number, height: number, descent: number}}
     */
    getTextHeight: function(str, font) {

        var text = $('<span>' + str + '</span>').css({ fontFamily: font });
        var block = $('<div style="display: inline-block; width: 1px; height: 0px;"></div>');

        var div = $('<div></div>');
        div.append(text, block);

        var body = $('body');
        body.append(div);

        try {

            var result = {};

            block.css({ verticalAlign: 'baseline' });
            result.ascent = block.offset().top - text.offset().top;

            block.css({ verticalAlign: 'bottom' });
            result.height = block.offset().top - text.offset().top;

            result.descent = result.height - result.ascent;

        } finally {
            div.remove();
        }

        return result;
    },

    /**
     * Compute the coordinate inside the canvas with the current coordinate of the object in terms of his canvas
     * (as the computer screen for the mouse).
     * @param {object} canvas Contains the current canvas to compute the new coordinates.
     * @param {number} x Contains the current coordinate x of the object inside his canvas.
     * @param {number} y Contains the current coordinate y of the object inside his canvas.
     * @returns {{x: number, y: number}}
     */
    getCanvasCoordinates: function(canvas, x, y) {
        var rect = canvas.getBoundingClientRect();
        return { x: x - rect.left, y: y - rect.top };
    },

    /**
     * Compute the euclidian distance between two pair of coordinates.
     * @param {number} x1 Contains the x coordinate of the first object.
     * @param {number} y1 Contains the y coordinate of the first object.
     * @param {number} x2 Contains the x coordinate of the second object.
     * @param {number} y2 Contains the y coordinate of the second object.
     * @returns {number}
     */
    euclidianDist: function(x1, y1, x2, y2) {
        return (Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
    },

    /**
     * Draw a circle in the given context.
     * @param {object} ctx Contains the current context which will be used to draw a circle.
     * @param {number} centerX Contains the x coordinate of the center of the circle.
     * @param {number} centerY Contains the y coordinate of the center of the circle.
     * @param {number} radius Contains the radius of the circle.
     */
    drawCircle: function(ctx, centerX, centerY, radius) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.closePath();
        ctx.stroke();
    },

    /**
     * Draw a line in the given context.
     * @param {object} ctx Contains the current context which will be used to draw a line.
     * @param {number} x1 Contains the x coordinate of the first point.
     * @param {number} y1 Contains the y coordinate of the first point.
     * @param {number} x2 Contains the x coordinate of the second point.
     * @param {number} y2 Contains the y coordinate of the second point.
     */
    drawLine: function(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 1;
        ctx.closePath();
        ctx.stroke();
    },

    /**
     * Draw a bezier curve in the given context.
     * @param {object} ctx Contains the current context which will be used to draw a bezier curve.
     * @param {number} x1 Contains the x coordinate of the first point.
     * @param {number} y1 Contains the y coordinate of the first point.
     * @param {number} x2 Contains the x coordinate of the second point.
     * @param {number} y2 Contains the y coordinate of the second point.
     * @param {number} x3 Contains the x coordinate of the third point.
     * @param {number} y3 Contains the y coordinate of the third point.
     * @param {number} x4 Contains the x coordinate of the fourth point.
     * @param {number} y4 Contains the y coordinate of the fourth point.
     */
    drawBezierCurve: function(ctx, x1, y1, x2, y2, x3, y3, x4, y4) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
        ctx.stroke();
    },

    /**
     * Draw rounded rect only on the upper side in the given context.
     * @param {object} ctx Contains the current context which will be used to draw a bezier curve.
     * @param {number} x Contains the x coordinate of the rounded rect.
     * @param {number} y Contains the y coordinate of the rounded rect.
     * @param {number} width Contains the width of the rounded rect.
     * @param {number} height Contains the height of the rounded rect.
     * @param {number} radius Contains the radius of the rounded rect.
     * @param {boolean} fill Define if the rounded rect has to be filled.
     * @param {boolean} stroke Define if the rounded rect has to have stroke.
     */
    drawUpperRoundedRect: function(ctx, x, y, width, height, radius, fill, stroke) {
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
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();

        if (stroke) {
            ctx.stroke();
        }
        if (fill) {
            ctx.fill();
        }
    },

    /**
     * Draw rounded rect in the given context.
     * @param {object} ctx Contains the current context which will be used to draw a bezier curve.
     * @param {number} x Contains the x coordinate of the rounded rect.
     * @param {number} y Contains the y coordinate of the rounded rect.
     * @param {number} width Contains the width of the rounded rect.
     * @param {number} height Contains the height of the rounded rect.
     * @param {number} radius Contains the radius of the rounded rect.
     * @param {boolean} fill Define if the rounded rect has to be filled.
     * @param {boolean} stroke Define if the rounded rect has to have stroke.
     */
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
/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

var UIGraphics = require('./UIGraphics');
var UIStyles = require('./UIStyles');
var UIEvents = require('./UIEvents');

export class UIBlockLink {

    constructor() {
        this._objFrom = null;
        this._objTo = null;
        this._from = { x: 0, y: 0 };
        this._to = { x: 0, y: 0 };
        this._curvesPoints = [ { x: 0, y: 0 }, { x: 0, y: 0 } ];
        this._curvesOffset = UIStyles.UIBlockLinkDefaultCurveOffset;
        this._circleRadius = UIStyles.UIBlockLinkDefaultCircleRadius;
        this._ctx = null;
        this._canvas = null;
        this._trackCurvePointOne = false;
        this._trackCurvePointTwo = false;
        this._trackMouse = false;

        this._mouseMoveId = UIEvents.addEventListener("mouseMove", (delta) => this.mouseMoveHandler(delta));
        this._mouseClickId = UIEvents.addEventListener("mouseClick", (e) => this.mouseClickHandler(e));
        this._mouseBeginClickAndDropId = UIEvents.addEventListener("mouseBeginClickAndDrop", (e) => this.mouseBeginClickAndDrop(e));
        this._mouseEndClickAndDropId = UIEvents.addEventListener("mouseEndClickAndDrop", (e) => this.mouseEndClickAndDrop(e));
        this._mouseFollowId = UIEvents.addEventListener("mouseFollow", (delta) => this.mouseMoveHandler(delta));
    }

    setContext(ctx) {
        this._ctx = ctx;
    }

    setCanvas(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
    }

    attachFrom(x, y, obj) {
        this._from = { x: x, y: y };
        this._curvesPoints[0].x = x;
        this._curvesPoints[0].y = y - this._curvesOffset;
        this._curvesPoints[1].x = x;
        this._curvesPoints[1].y = y + this._curvesOffset;
        this._objFrom = obj;
        this._trackMouse = true;
    }

    attachTo(x, y, obj) {
        this._to = { x: x, y: y };
        this._curvesPoints[1].x = x;
        this._curvesPoints[1].y = y + this._curvesOffset;

        if (obj != null) {
            this._objTo = obj;
            UIEvents.removeEventListener("mouseFollow", this._mouseFollowId);
            this._trackMouse = false;
        }
    }

    eventUpdateFrom(delta) {
        this._from = {
            x: this._from.x + delta.x,
            y: this._from.y + delta.y
        };
        this._curvesPoints[0] = {
            x: this._curvesPoints[0].x + delta.x,
            y: this._curvesPoints[0].y + delta.y
        };
    }

    eventUpdateTo(delta) {
        this._to = {
            x: this._to.x + delta.x,
            y: this._to.y + delta.y
        };
        this._curvesPoints[1] = {
            x: this._curvesPoints[1].x + delta.x,
            y: this._curvesPoints[1].y + delta.y
        };
    }

    eventUpdateCurvePointOne(delta) {
        this._curvesPoints[0] = {
            x: this._curvesPoints[0].x + delta.x,
            y: this._curvesPoints[0].y + delta.y
        };
    }

    eventUpdateCurvePointTwo(delta) {
        this._curvesPoints[1] = {
            x: this._curvesPoints[1].x + delta.x,
            y: this._curvesPoints[1].y + delta.y
        };
    }

    mouseBeginClickAndDrop(e) {
        var pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);

        if (UIGraphics.euclidianDist(this._curvesPoints[0].x, this._curvesPoints[0].y, pos.x, pos.y) < this._circleRadius) {
            this._trackCurvePointOne = true;
        } else if (UIGraphics.euclidianDist(pos.x, pos.y, this._curvesPoints[1].x, this._curvesPoints[1].y) < this._circleRadius) {
            this._trackCurvePointTwo = true;
        }
    }

    mouseEndClickAndDrop(e) {
        this._trackCurvePointOne = false;
        this._trackCurvePointTwo = false;
    }

    mouseMoveHandler(delta) {
        if (this._trackMouse) {
            this.eventUpdateTo(delta);
        }

        if (this._trackCurvePointOne) {
            this.eventUpdateCurvePointOne(delta);
        }

        if (this._trackCurvePointTwo) {
            this.eventUpdateCurvePointTwo(delta);
        }
    }

    draw() {
        this._ctx.fillStyle = UIStyles.UIBlockLinkCircleFillColor;
        this._ctx.strokeStyle = UIStyles.UIBlockLinkCircleStrokeColor;
        UIGraphics.drawCircle(this._ctx, this._from.x, this._from.y, this._circleRadius);
        UIGraphics.drawCircle(this._ctx, this._curvesPoints[0].x, this._curvesPoints[0].y, this._circleRadius);

        this._ctx.strokeStyle = UIStyles.UIBlockLinkLineStrokeColor;
        UIGraphics.drawLine(this._ctx, this._from.x, this._from.y, this._curvesPoints[0].x, this._curvesPoints[0].y);

        this._ctx.fillStyle = UIStyles.UIBlockLinkCircleFillColor;
        this._ctx.strokeStyle = UIStyles.UIBlockLinkCircleStrokeColor;
        UIGraphics.drawCircle(this._ctx, this._to.x, this._to.y, this._circleRadius);
        UIGraphics.drawCircle(this._ctx, this._curvesPoints[1].x, this._curvesPoints[1].y, this._circleRadius);

        this._ctx.strokeStyle = UIStyles.UIBlockLinkLineStrokeColor;
        UIGraphics.drawLine(this._ctx, this._to.x, this._to.y, this._curvesPoints[1].x, this._curvesPoints[1].y);

        this._ctx.strokeStyle = UIStyles.UIBlockLinkBezierCurveStrokeColor;
        UIGraphics.drawBezierCurve(this._ctx,
            this._from.x, this._from.y,
            this._curvesPoints[0].x, this._curvesPoints[0].y,
            this._curvesPoints[1].x, this._curvesPoints[1].y,
            this._to.x, this._to.y);
    }

    // Private attributes
};
/**
 * Created by Cesumilo on 06/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

import { UIDrawable } from '../UIDrawable';

let UIGraphics = require('./../UIGraphics');
let UIStyles = require('./../UIStyles');
let UIEvents = require('./../UIEvents');

export class UIBlockLink extends UIDrawable {

    constructor(color=UIStyles.UIBlockLineDefaultColor) {
        super("link");

        this._id = 0;
        this._strokeStyle = color;

        this._objFrom = null;
        this._objTo = null;
        this._from = { x: 0, y: 0 };
        this._to = { x: 0, y: 0 };

        this._curvesPoints = [ { x: 0, y: 0 }, { x: 0, y: 0 } ];
        this._curvesOffset = UIStyles.UIBlockLinkDefaultCurveOffset;
        this._circleRadius = UIStyles.UIBlockLinkDefaultCircleRadius;

        this._trackCurvePointOne = false;
        this._trackCurvePointTwo = false;
        this._trackMouse = false;
        this._showEditCurve = true;

        this.addHandlers(UIEvents.events.MOUSE_MOVE,
            UIEvents.addEventListener(UIEvents.events.MOUSE_MOVE, (delta) => this.update(delta)));
        this.addHandlers(UIEvents.events.BEGIN_CLICK_AND_DROP,
            UIEvents.addEventListener(UIEvents.events.BEGIN_CLICK_AND_DROP, (e) => this.mouseBeginClickAndDrop(e)));
        this.addHandlers(UIEvents.events.END_CLICK_AND_DROP,
            UIEvents.addEventListener(UIEvents.events.END_CLICK_AND_DROP, (e) => this.mouseEndClickAndDrop(e)));
        this.addHandlers(UIEvents.events.FOLLOW_MOUSE,
            UIEvents.addEventListener(UIEvents.events.FOLLOW_MOUSE, (delta) => this.update(delta)));
    }

    setId(id) {
        this._id = id;
    }

    getId() {
        return this._id;
    }

    setContext(ctx) {
        this._ctx = ctx;
    }

    setStrokeStyle(color) {
        this._strokeStyle = color;
    }

    toggleEditMode() {
        this._showEditCurve = !this._showEditCurve;
    }

    isInEditMode() {
        return this._showEditCurve;
    }

    setColor(color) {
        this._strokeStyle = color;
    }

    getObjectFrom() {
        return this._objFrom;
    }

    getObjectTo() {
        return this._objTo;
    }

    attachFrom(x, y, obj) {
        this._from = { x: x, y: y };
        this._curvesPoints[0].x = x + this._curvesOffset;
        this._curvesPoints[0].y = y;
        this._curvesPoints[1].x = x - this._curvesOffset;
        this._curvesPoints[1].y = y;
        this._objFrom = obj;
        this._trackMouse = true;
        this._showEditCurve = true;
    }

    attachTo(x, y, obj) {
        this._to = { x: x, y: y };
        this._curvesPoints[1].x = x - this._curvesOffset;
        this._curvesPoints[1].y = y;

        if (obj != null) {
            this._objTo = obj;
            UIEvents.removeEventListener(UIEvents.events.FOLLOW_MOUSE, this._listeners[UIEvents.events.FOLLOW_MOUSE]);
            delete this._listeners[UIEvents.events.FOLLOW_MOUSE];
            this._trackMouse = false;
            this._showEditCurve = false;
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
        const pos = UIGraphics.getCanvasCoordinates(this._canvas, e.clientX, e.clientY);

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

    update(delta) {
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
        if (this._showEditCurve) {
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
        }

        if (this._strokeStyle == null) {
            this._ctx.strokeStyle = UIStyles.UIBlockLinkBezierCurveStrokeColor;
        } else {
            this._ctx.strokeStyle = this._strokeStyle;
        }

        UIGraphics.drawBezierCurve(this._ctx,
            this._from.x, this._from.y,
            this._curvesPoints[0].x, this._curvesPoints[0].y,
            this._curvesPoints[1].x, this._curvesPoints[1].y,
            this._to.x, this._to.y);
    }
}
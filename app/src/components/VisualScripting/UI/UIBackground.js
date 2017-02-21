/**
 * Created by Cesumilo on 20/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

export class UIBackground {

    constructor() {
        this._canvas = null;
        this._ctx = null;
    }

    setCanvas(canvas) {
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
    }

    draw() {
        const img = document.getElementById("vscripting-gui-background");
        const pat = this._ctx.createPattern(img, "repeat");
        this._ctx.rect(0, 0, this._canvas.width, this._canvas.height);
        this._ctx.fillStyle = pat;
        this._ctx.fill();
    }
}
/**
 * Created by Cesumilo on 10/02/2017.
 * This work is licensed under the Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-nd/4.0/.
 */

module.exports = {
    _ref: null,
    _states : {
        extraContents: []
    },
    events: {
        MOUSE_CLICK: "mouseClick",
        MOUSE_MOVE: "mouseMove",
        BEGIN_CLICK_AND_DROP: "mouseBeginClickAndDrop",
        END_CLICK_AND_DROP: "mouseEndClickAndDrop",
        FOLLOW_MOUSE: "mouseFollow",
        CONTEXT_MENU_MODE: "contextMenuMode"
    },
    states: {
        CUSTOM_CONTEXT_MENU: "custom-context-menu",
        EXTRA_CONTENTS: "extraContents"
    },

    setVisualScriptingUI: function(ref) {
        this._ref = ref;
    },

    getVisualScriptingUI: function() {
        return this._ref;
    },

    addEventListener: function(name, callback) {
        this._ref.addEventListener(name, callback);
    },

    removeEventListener: function(name, id) {
        return this._ref.removeEventListener(name, id);
    },

    addState(name, obj) {
        this._states[name] = obj;
    },

    getState(name) {
        return this._states[name];
    },

    removeState(name) {
        delete this._states[name];
    },

    getButton(name) {
        switch(name) {
            case "mouseRightButton":
                return 2;
            default:
                return -1;
        }
    }
};
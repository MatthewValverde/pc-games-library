import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';

class InputMouseTouch extends ScriptType {

    initialize = function () {
        this.down = false;
        this.app.input = this;
    
        if (this.app.mouse) {
            this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.handleMouseDown, this);
            this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.handleMouseMove, this);
            this.app.mouse.on(pc.EVENT_MOUSEUP, this.handleMouseUp, this);
        }
        if (this.app.touch) {
            this.app.touch.on(pc.EVENT_TOUCHSTART, this.handleTouchDown, this);
            this.app.touch.on(pc.EVENT_TOUCHMOVE, this.handleTouchMove, this);
            this.app.touch.on(pc.EVENT_TOUCHEND, this.handleTouchUp, this);
        }
    };
    
    handleMouseDown = function (event) {
        this.onDown(event.x, event.y);
    };
    
    handleTouchDown = function (event) {
        this.onDown(event.touches[0].x, event.touches[0].y);
    };
    
    handleMouseMove = function (event) {
        if (event.buttons[pc.MOUSEBUTTON_LEFT]) {
            this.onMove(event.x, event.y);
        }
    };
    
    handleTouchMove = function (event) {
        this.onMove(event.touches[0].x, event.touches[0].y);
    };
    
    handleMouseUp = function (event) {
        this.onUp(event.x, event.y);
    };
    
    handleTouchUp = function (event) {
        this.onUp();
    };
    
    onDown = function (x, y) {
        if(this.app.input){
            this.app.input.onDown(x, y);
        }
        this.down = true;
    
    };
    
    onMove = function (x, y) {
        if(this.app.input){
            this.app.input.updateMove(x, y);
        }
    };
    
    onUp = function (x, y) {
        if(this.app.input){
            this.app.input.onUp(x, y);
        }
        this.down = false;
    };
}
registerScript(InputMouseTouch, 'inputMouseTouch');

export {InputMouseTouch};
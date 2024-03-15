import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class ButtonSetState extends ScriptType {

    initialize = function() {
        this.entity.button.on('click', () => {
            this.app.controller.forceSetState(this.toState);
        });        
    };
};

registerScript(ButtonSetState, 'buttonSetState'); 

export {ButtonSetState};
import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class ButtonFireEvent extends ScriptType {

    initialize = function () {
        this.entity.button.on('click', () => this.app.fire(this.eventToFire));
    };
};

registerScript(ButtonFireEvent, 'buttonFireEvent'); 

ButtonFireEvent.attributes.add('eventToFire', { type: 'string' });

export {ButtonFireEvent};
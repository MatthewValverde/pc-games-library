import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class DeleteAfterTime extends ScriptType {

    initialize = function(){
        setTimeout(() => {
            this.entity.destroy();
        }, this.delay * 1000);
    };
};

registerScript(DeleteAfterTime, 'deleteAfterTime'); 

DeleteAfterTime.attributes.add('delay', {type: 'number'});

export {DeleteAfterTime};
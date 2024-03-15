import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class SetUiColor extends ScriptType {
    //this.app['color_'+ key]

    initialize = function(){
        this.app.on('setColor_' + this.colorKey, this.setColor, this);
        if(this.app['color_'+ this.colorKey]){
            this.setColor();
        }
    };

    setColor = function(){
        this.entity.element.color = this.app['color_' + this.colorKey];
    };
};




registerScript(SetUiColor, 'setUiColor'); 

export {SetUiColor};
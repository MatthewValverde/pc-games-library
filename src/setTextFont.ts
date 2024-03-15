import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class SetTextFont extends ScriptType {

    initialize = function() {
        this.app.on('initializationComplete', this.setFont, this);
    };

    setFont = function(){
        if(this.app['customFont'+this.fontId] !== undefined){
            this.entity.element.fontAsset = this.app['customFont'+this.fontId];
        }
    }
};

registerScript(SetTextFont, 'setTextFont'); 

SetTextFont.attributes.add('fontId', {type: 'number', default: 1});

export {SetTextFont};
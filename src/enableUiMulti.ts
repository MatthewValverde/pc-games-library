import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';

class EnableUiMulti extends ScriptType {

// initialize code called once per entity
    initialize = function() {
        this.app.on('stateSet', this.checkEnable, this);
        this.app.on('menuSet', this.checkEnable, this);
    };

    checkEnable = function(menu){
        var enabledState = false;
        for (let i = 0; i < this.enabledStates.length; i++){
            if(this.app.stateName === this.enabledStates[i]){
                enabledState = true;
            }
        }
        var enabledMenu = false;
        for (let i = 0; i < this.enabledMenus.length; i++){
            if(this.app.menuName === this.enabledMenus[i]){
                enabledMenu = true;
            }
        }
        if(enabledState === true && enabledMenu === true){
            this.entity.enabled = true;
            //this.app.logger.log('enable', this.entity.name);
        }
        else{
            this.entity.enabled = false;
            //this.app.logger.log('disable', this.entity.name);
        }
    };

}

registerScript(EnableUiMulti, 'enableUiMulti');

export {EnableUiMulti};
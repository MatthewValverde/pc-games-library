

import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class ButtonSetMenu extends ScriptType {

    initialize = function () {
        this.entity.button.on('click', () => {
            this.app.menuName = this.toMenu;
            this.app.fire('menuSet');
            this.app.logger.log('set menu', this.toMenu);
        });
    };
};

registerScript(ButtonSetMenu, 'buttonSetMenu'); 

export {ButtonSetMenu};
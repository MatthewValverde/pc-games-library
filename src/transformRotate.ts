import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class TransformRotate extends ScriptType {

    initialize = function(){
        var eAng = this.entity.getLocalEulerAngles()
        this.rotX = eAng.x;
        this.rotY = eAng.y;
        this.rotZ = eAng.z;
    }

    update = function(dt){
        this.rotX += dt * this.rotSpeed.x;
        this.rotY += dt * this.rotSpeed.y;
        this.rotZ += dt * this.rotSpeed.z;
        for (let i = 0; i < this.rotObjs.length; ++i) {
            this.rotObjs[i].setLocalEulerAngles(this.rotX, this.rotY, this.rotZ);
        }
    };
    
};

registerScript(TransformRotate, 'transformRotate'); 

TransformRotate.attributes.add('rotObjs', {type: 'entity', array: true});
TransformRotate.attributes.add('rotSpeed', {type: 'vec3', default: [0,1,0]});

export {TransformRotate};
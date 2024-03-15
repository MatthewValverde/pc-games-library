import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';



class SetMaterialColor extends ScriptType {
    //this.app['color_'+ key]
    
    initialize = function(){
        this.app.on('setColor_' + this.colorKey, this.setColor, this);
        this.material = undefined;
        if(this.app['color_'+ this.colorKey]){
            this.setColor();
        }
    };

    setColor = function(){
        if(!this.material){
            this.setTargetMaterial();
        }
        if(this.setDiffuse === true){
            this.material.diffuse.set(this.app['color_'+ this.colorKey].r, this.app['color_'+ this.colorKey].g, this.app['color_'+ this.colorKey].b);
        }
        if(this.setEmissive === true){
            this.material.emissive.set(this.app['color_'+ this.colorKey].r, this.app['color_'+ this.colorKey].g, this.app['color_'+ this.colorKey].b);
        }
        this.material.update();
    };

    setTargetMaterial = function(){
        if(this.entity.render){
            this.material = this.entity.render.meshInstances[0].material;
            
        }
        if(this.entity.model){
            this.material = this.entity.model.meshInstances[0].material;
        }   
    };
};

registerScript(SetMaterialColor, 'setMaterialColor');

SetMaterialColor.attributes.add('setDiffuse', {type: 'boolean', default: true});
SetMaterialColor.attributes.add('setEmissive', {type: 'boolean', default: false});

export {SetMaterialColor};
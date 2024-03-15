import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';

class SetMaterialTexture extends ScriptType {
    //this.app['texture_'+ key]
    
    initialize = function(){
        this.app.on('setTexture_' + this.textureKey, this.setTexture, this);
        this.material = undefined;
        this.setTargetMaterial();
        if(this.app['texture_'+ this.textureKey]){
            this.setColor();
        }
    };

    setTexture = function(texture){
        if(this.material === undefined){
            this.setTargetMaterial();
        }
        this.material.diffuseMap = texture;
        if(this.setOpacity === true){
            this.material.opacityMap = texture;
            this.material.opacity = 1;
        }
        if(this.setEmissive === true){
            this.material.emissiveMap = texture;
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

registerScript(SetMaterialTexture, 'setMaterialTexture');

SetMaterialTexture.attributes.add('setOpacity', {type: 'boolean', default: false});
SetMaterialTexture.attributes.add('setEmissive', {type: 'boolean', default: false});

export {SetMaterialTexture};
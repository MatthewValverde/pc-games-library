import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';

class SetUiTexture extends ScriptType {
    initialize = function(){
        this.width = this.entity.element.width;
        this.height = this.entity.element.height;
        this.app.on('setTexture_' + this.textureKey, this.setTexture, this);
        if(this.app['texture_' + this.textureKey]){
            this.setTexture();
        }
    };

    setTexture = function(){
        if(this.disableEntityOnSet){
            this.disableEntityOnSet.enabled = false;
        }
        this.entity.element.texture = this.app['texture_' + this.textureKey];
        if(this.fitImageToArea === true){
            this.fit();
        }
        this.entity.element.opacity = 1;
    };    
    
    fit = function() {
        var aspect = this.app['texture_' + this.textureKey].width / this.app['texture_' + this.textureKey].height;
        var targetAspect = this.width / this.height;
        
        var width = 0;
        var height = 0;
        
        if (aspect > targetAspect) {
            width = this.width;
            height = this.width / aspect;
        }
        else {
            height = this.height;
            width = this.height * aspect;
        }
        
        this.entity.element.width = width;
        this.entity.element.height = height;
        
    };    
};

registerScript(SetUiTexture, 'setUiTexture');

SetUiTexture.attributes.add('disableEntityOnSet', {type: 'entity'});
SetUiTexture.attributes.add('fitImageToArea', {type: 'boolean', default: true});

export {SetUiTexture};
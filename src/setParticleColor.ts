import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';

class SetParticleColor extends ScriptType {
    initialize = function(){
        this.app.on('configLoaded', this.setColors, this);
    };

    setColors = function(){
        for (let i = 0; i < this.colorKey.length && i < this.entity.particlesystem.colorGraph.curves[0].keys.length; i++) {
            if(this.app['color_' + this.colorKey[i]] !== undefined && this.app['color_' + this.colorKey[i]] !== null){
                this.entity.particlesystem.colorGraph.curves[0].keys[i][1] = this.app['color_' + this.colorKey[i]].r;
                this.entity.particlesystem.colorGraph.curves[1].keys[i][1] = this.app['color_' + this.colorKey[i]].g;
                this.entity.particlesystem.colorGraph.curves[2].keys[i][1] = this.app['color_' + this.colorKey[i]].b;
            }
        }
        this.entity.particlesystem.rebuild();
    };

};



registerScript(SetParticleColor, 'setParticleColor');

export {SetParticleColor};
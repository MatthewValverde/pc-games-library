import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class TransformPingPong extends ScriptType {

    initialize = function() {
        this.start('x');
        this.start('y');
        this.start('z');
    };

    start = function(char){
        this[char + 'To'] = 0;
        this.pingPongScale[char] !== 0 && this.startTween(char);
    }
    
    startTween = function(axis){
        var minTime = this.pingPongMinTime[axis];
        var maxTime = this.pingPongMaxTime[axis];
        var time = minTime === maxTime ? minTime : pc.math.random(minTime, maxTime);
        var objPos = this.entity.getLocalPosition()
        var toPos = objPos[axis] <= 0 ? this.pingPongScale[axis] : -this.pingPongScale[axis];

        var tween = {num:  objPos[axis]};
        this['tween' + axis] && this['tween' + axis].stop();

        var tweenType = pc[this.tweenType];
        this['tween' + axis] = this.entity.tween(tween)
            .to({num: toPos}, time, tweenType)
            .on('update', () => {
                this[axis + 'To'] = tween.num;
            })
            .on('complete', () => {
                this.startTween(axis);
            })
        .start();
    };

    update = function(dt){
        this.entity.setLocalPosition(new pc.Vec3(this.xTo, this.yTo, this.zTo)); 
    };
    
};

registerScript(TransformPingPong, 'transformPingPong'); 

TransformPingPong.attributes.add('tweenType', {type: 'string', default: 'SineInOut'})
TransformPingPong.attributes.add('pingPongScale', {type: 'vec3'});
TransformPingPong.attributes.add('pingPongMinTime', {type: 'vec3'});
TransformPingPong.attributes.add('pingPongMaxTime', {type: 'vec3'});

export {TransformPingPong};
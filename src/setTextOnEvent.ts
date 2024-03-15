import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class SetTextOnEvent extends ScriptType {

    initialize = function() {
        for (let i = 0; i < this.onFireEvents.length; i++) {
            this.app.on(this.onFireEvents[i], this.setText, this);
        }
        this.ele = this.entity.element;
        this.app.on('startGame', this.reset, this);
    };

    reset = function(){
        this.app[this.onFireEvents[0] + 'Prev'] = 0; 
    };

    setText = function(text){
        if(this.lerpNumber === true){
            this.setLerpNumber(text);
        }
        else{
            if(this.digitalClockFormat === true){
                this.ele.text = this.toDigitalClock(text);
            }
            else if(this.ordinalSuffixFormat === true){
                this.ele.text = this.toOrdinalSuffix(text);
            }
            else{
                this.ele.text = this.preText + text;
            }
        }
    };

    setLerpNumber = function(text){
        if(!this.app[this.onFireEvents[0] + 'Prev']){
            this.app[this.onFireEvents[0] + 'Prev'] = 0;
        }
        const tweenNum = { x: this.app[this.onFireEvents[0] + 'Prev']};
        if(this.animTween){
            this.animTween.stop();
        }
        this.animTween = this.entity.tween(tweenNum)
        .to({ x: text }, 1, pc['Linear'])
        .on('update', () => {
                this.ele.text =  this.preText + Math.round(tweenNum.x);
            })
        .start();
    };

    toDigitalClock = time => {
        const _time = (typeof time === 'number' && time >= 0) ? time : 0;

        const minutes = Math.floor(_time / 60);
        const seconds = Math.floor(_time % 60);

        const minutesText = minutes >= 10 ? `${minutes}` : `0${minutes}`;
        const secondsText = seconds >= 10 ? `${seconds}` : `0${seconds}`;

        return `${minutesText}:${secondsText}`;
    };

    toOrdinalSuffix = number =>{
        var tenth = number % 10;
        var hundredth = number % 100;
        if(tenth == 1 && hundredth != 11){
            return number + 'st';
        }
        if(tenth == 2 && hundredth != 12){
            return number + 'nd';
        }
        if(tenth == 3 && hundredth != 13){
            return number + 'rd';
        }
        return number + 'th';
    };
}
registerScript(SetTextOnEvent, 'setTextOnEvent'); 

SetTextOnEvent.attributes.add('onFireEvents', {type: 'string', array: true});
SetTextOnEvent.attributes.add('preText', {type: 'string'});
SetTextOnEvent.attributes.add('digitalClockFormat', {type: 'boolean', default: false});
SetTextOnEvent.attributes.add('ordinalSuffixFormat', {type: 'boolean', default: false});
SetTextOnEvent.attributes.add('lerpNumber', {type: 'boolean', default: false});

export {SetTextOnEvent};
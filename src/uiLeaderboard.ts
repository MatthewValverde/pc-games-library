/* jshint esversion: 6 */
import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class UiLeaderboard extends ScriptType {

    initialize = function initialize() { 
        this.app.on('updateLeader', this.updateLeader, this);
        this.app.on('clearLeaderboard', this.clear, this);
    };

    clear = function(){
        for (let i = 0; i < this.names; i++) {
            this.names[i].element.text = '';
            this.scores[i].element.text = '';
        }
    };

    updateLeader = function updateLeader (position, username, points){
        if(this.names[position]){
            this.names[position].element.text = username;
            this.scores[position].element.text = points;
        }
    };
};

registerScript(UiLeaderboard, 'uiLeaderboard'); 

UiLeaderboard.attributes.add('names', {type: 'entity', array: true});
UiLeaderboard.attributes.add('scores', {type: 'entity', array: true});

export {UiLeaderboard};
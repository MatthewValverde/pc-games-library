import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';

class ScoreCollision extends ScriptType {

// initialize code called once per entity
    initialize = function() {
        this.canScore = this.startHittable;
        this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    };

    hit = function (finalScore) {
        if(this.disableScoreOnHit === true){
            this.canScore = false;
        }
        this.entity.fire('scored', finalScore);
        if(this.appFireOnScore !== ''){
            this.app.fire(this.appFireOnScore, finalScore);
        }
        if(this.entityFireOnScore !== ''){
            this.entity.fire(this.entityFireOnScore, finalScore);
        }
    };

    onTriggerEnter = function (entity) {
        this.app.logger.log('scoreObj trigger', entity, entity.scripts);
        if (entity.script.projectileController !== undefined) {
            entity.script.projectileController.checkIfScored(this.entity);
        }
    };

    setScoreable = function(scoreable){
        this.canScore = scoreable;
    }
}

registerScript(ScoreCollision, 'scoreCollision');

ScoreCollision.attributes.add('pointsModifier', {type: 'number'});
ScoreCollision.attributes.add('startHittable', {type: 'boolean', default: true});
ScoreCollision.attributes.add('disableScoreOnHit', {type: 'boolean', default: false});
ScoreCollision.attributes.add('appFireOnScore', {type: 'string'});
ScoreCollision.attributes.add('entityFireOnScore', {type: 'string'});

export {ScoreCollision};
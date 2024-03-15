import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class Ccd extends ScriptType {

    initialize = function() {
        var body; // Type btRigidBody
    
        body = this.entity.rigidbody.body;
        body.setCcdMotionThreshold(this.motionThreshold);
        body.setCcdSweptSphereRadius(this.sweptSphereRadius);
        body.setContactProcessingThreshold(1e30);
        this.on('attr:motionThreshold', function(value, prev) {
            body = this.entity.rigidbody.body;
            body.setCcdMotionThreshold(value);
        });
        this.on('attr:sweptSphereRadius', function(value, prev) {
            body = this.entity.rigidbody.body;
            body.setCcdSweptSphereRadius(value);
        });
    };
};

registerScript(Ccd, 'ccd'); 

Ccd.attributes.add('motionThreshold', {
    type: 'number', 
    default: 1, 
    title: 'Motion Threshold', 
    description: 'Number of meters moved in one frame before CCD is enabled'
});

Ccd.attributes.add('sweptSphereRadius', {
    type: 'number', 
    default: 0.2, 
    title: 'Swept Sphere Radius', 
    description: 'This should be below the half extent of the collision volume. E.g For an object of dimensions 1 meter, try 0.2'
});

export {Ccd};
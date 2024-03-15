import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class KalikratisEditorPath extends ScriptType {

    initialize = function initialize() {
        // --- variables
        this.vec = new pc.Vec3();
        this.vec2 = new pc.Vec3();
        this.numberOfChildren = undefined;
        //this.time = 0;
        this.position = new pc.Vec3();
        this.lookAt = new pc.Vec3();
        this.up = new pc.Vec3();
        this.animationDirection = 1;
        //this.isPlaying = this.isInEditor() === false ? this.autoplay : false;
        this.percent = 0;
        // --- execute
        this.prepare();

        this.getCurvesFromPath();
        this.lapsDone = 0;
        this.doAnimate = true;
    };

    update = function update(dt) {
        // if (this.renderLine) {
        //     this.monitorPointChanges();

        //     this.drawLine();

        //     // --- in editor checks
        //     if (this.isInEditor() === true) {
        //         if (this.numberOfChildren !== this._getNodes().length) {
        //             this.getCurvesFromPath();

        //             this.updateEditorTranslationListeners();
        //         }
        //     }
        // }
        // --- we autoplay only if we are outside of the editor
        if(this.doAnimate === true){
            this.percent += dt * this.moveSpeed;
            if(this.percent >= 1){
                this.percent = 0;
            }
            this.animate(this.percent);
        }
    };
    
    animate = function animate(percent) {
        //this.app.fire('uiPathSet', this.laneNum, percent);
        // Get the interpolated values for the position from the curves
        this.position.set(this.path.px.value(percent), this.path.py.value(percent), this.path.pz.value(percent));
        
        // Get the interpolated values for the look at point from the curves
        this.lookAt.set(this.path.tx.value(percent), this.path.ty.value(percent), this.path.tz.value(percent));

        // Get the interpolated values for the up vector from the curves
        this.up.set(this.path.ux.value(percent), this.path.uy.value(percent), this.path.uz.value(percent));
        
        // Make the camera look at the interpolated target position with the correct
        // up direction to allow for camera roll and to avoid glimbal lock
        //this.animationEntity.lookAt(this.lookAt, this.up);
        
        this.animationEntity.setPosition(this.position);
        this.animationEntity.lookAt(this.lookAt);
        this.animationEntity.up.set(this.up);
    };
    
    isInEditor = function isInEditor() {
        var Uranus
        return window['Uranus'] !== undefined && Uranus.Editor && Uranus.Editor.inEditor() === true;
    };

    prepare = function prepare() {
        if (this.isInEditor()) {
            this.editorTranslationCallback = this.getCurvesFromPath.bind(this);

            this.updateEditorTranslationListeners();
        }
    };

    _getListeners = function _getListeners() {
        function getChildren(entity) {
            return [entity, entity.children.map((child) => getChildren(child))];
        }

        return getChildren(this.entity)['flat'](10000);
    };

    updateEditorTranslationListeners = function updateEditorTranslationListeners() {
        const nodes = this._getNodes();
        var editor;
        this.numberOfChildren = nodes.length;

        const listeners = this._getListeners();

        listeners.forEach((entity) => {
            const item = editor['call']('entities:get', entity._guid);

            item.unbind('position:set', this.editorTranslationCallback);
            item.on('position:set', this.editorTranslationCallback);
            item.unbind('rotation:set', this.editorTranslationCallback);
            item.on('rotation:set', this.editorTranslationCallback);
            item.unbind('scale:set', this.editorTranslationCallback);
            item.on('scale:set', this.editorTranslationCallback);
        });
    };

    editorInitialize = function editorInitialize() {
        // --- add custom CSS
        const sheet = window.document.styleSheets[0];
        sheet.insertRule(
            '.active-block-builder-button { background-color: #f60 !important; color: white !important; }',
            sheet.cssRules.length,
        );
    };

    editorAttrChange = function editorAttrChange(property /* , value */) {
        if (property === 'curveType') {
            this.getCurvesFromPath();
        }

        if (property === 'duration'
            || property === 'loopAnimation'
            || property === 'yoyoAnimation'
            || property === 'animationEntity'
        ) {
            this.resetAnimation();
        }
    };

    // --- editor script methods
    editorScriptPanelRender = function editorScriptPanelRender(element) {
        const containerEl = element.firstChild;
        var ui;
        // --- animation toggle button
        const btnTogglePlay = new ui.Button({
            text: '+ Toggle Animation',
        });

        btnTogglePlay.on('click', () => {
            this.isPlaying = !this.isPlaying;
            this.setEditorPlaying(btnTogglePlay);
        });

        containerEl.append(btnTogglePlay.element);

        this.setEditorPlaying(btnTogglePlay);

        // --- animation toggle button
        const btnResetAnimation = new ui.Button({
            text: '- Reset Animation',
        });

        btnResetAnimation.on('click', this.resetAnimation, this);

        containerEl.append(btnResetAnimation.element);
    };

    resetAnimation = function resetAnimation() {
        this.time = 0;
        this.animate(0);
    };

    setEditorPlaying = function setEditorPlaying(btnTogglePlay) {
        if (this.isPlaying) {
            btnTogglePlay.element.classList.add('active-block-builder-button');
        } else {
            btnTogglePlay.element.classList.remove('active-block-builder-button');
        }
    };

    _getNodes = function _getNodes() {
        function getChildren(entity) {
            return entity.children.length === 0 ? [entity] : entity.children.map((child) => getChildren(child));
        }

        return getChildren(this.entity).flat(10000);
    };

    getCurvesFromPath = function getCurvesFromPath() {
        if (this.path && this.isStatic === true) {
            return;
        }

        const curveMode = this.curveType;
        const curves = {
            pathLength: 0,
        };

        // Create curves for position
        curves['px'] = new pc.Curve();
        curves['px'].type = curveMode;

        curves['py'] = new pc.Curve();
        curves['py'].type = curveMode;

        curves['pz'] = new pc.Curve();
        curves['pz'].type = curveMode;

        // Create curves for target look at position
        curves['tx'] = new pc.Curve();
        curves['tx'].type = curveMode;

        curves['ty'] = new pc.Curve();
        curves['ty'].type = curveMode;

        curves['tz'] = new pc.Curve();
        curves['tz'].type = curveMode;

        // Create curves for the 'up' vector for use with the lookAt function to
        // allow for roll and avoid gimbal lock
        curves['ux'] = new pc.Curve();
        curves['ux'].type = curveMode;

        curves['uy'] = new pc.Curve();
        curves['uy'].type = curveMode;

        curves['uz'] = new pc.Curve();
        curves['uz'].type = curveMode;

        const nodes = this._getNodes();

        // Store the distance from the start of the path for each path node
        const nodePathLength = [];

        // For use when calculating the distance between two nodes on the path
        const distanceBetween = new pc.Vec3();

        // Push 0 as we are starting our loop from 1 for ease
        nodePathLength.push(0);

        for (let i = 1; i < nodes.length; ++i) {
            const prevNode = nodes[i - 1];
            const nextNode = nodes[i];

            // Work out the distance between the current node and the one before in the path
            distanceBetween.sub2(prevNode.getPosition(), nextNode.getPosition());
            curves.pathLength += distanceBetween.length();

            nodePathLength.push(curves.pathLength);
        }

        for (let i = 0; i < nodes.length; ++i) {
            // Calculate the time for the curve key based on the distance of the path to the node
            // and the total path length so the speed of the camera travel stays relatively
            // consistent throughout
            const t = nodePathLength[i] / curves.pathLength;

            const node = nodes[i];

            const pos = node.getPosition();
            curves['px'].add(t, pos.x);
            curves['py'].add(t, pos.y);
            curves['pz'].add(t, pos.z);

            // Create and store a lookAt position based on the node position and the forward direction
            const lookAt = pos.clone().add(node.forward);
            curves['tx'].add(t, lookAt.x);
            curves['ty'].add(t, lookAt.y);
            curves['tz'].add(t, lookAt.z);

            const { up } = node;
            curves['ux'].add(t, up.x);
            curves['uy'].add(t, up.y);
            curves['uz'].add(t, up.z);
        }

        curves['getPosition'] = (percentage) => new pc.Vec3(
            curves['px'].value(percentage),
            curves['py'].value(percentage),
            curves['pz'].value(percentage),
        );
        curves['getLookAt'] = (percentage) => new pc.Vec3(
            curves['tx'].value(percentage),
            curves['ty'].value(percentage),
            curves['tz'].value(percentage),
        );
        curves['getUp'] = (percentage) => new pc.Vec3(
            curves['ux'].value(percentage),
            curves['uy'].value(percentage),
            curves['uz'].value(percentage),
        );

        this.path = curves;
    };

    drawLine = function drawLine() {
        if (!this.path || this.path.length === 0) {
            return false;
        }

        const { path } = this;
        const stepsCount = Math.ceil(path.pathLength / this.renderStep);
        let distance = 0;

        let percentLast = 0;
        let percent = 0;

        for (let i = 0; i <= stepsCount; ++i) {
            if (percent >= 1.0) break;

            // --- calculate percent for next line segment
            distance += this.renderStep;
            percent = distance / path.pathLength;

            if (percent > 1.0) {
                percent = 1.0;
            }

            this._drawNode(path, percent, percentLast);

            percentLast = percent;
        }

        return true;
    };

    _drawNode = function _drawNode({
        px, py, pz, ux, uy, uz, tx, ty, tz,
    }, percent, percentLast) {
        const lastPosition = new pc.Vec3(px.value(percentLast), py.value(percentLast), pz.value(percentLast));
        const currentPosition = new pc.Vec3(px.value(percent), py.value(percent), pz.value(percent));

        const upVector = new pc.Vec3(ux.value(percent), uy.value(percent), uz.value(percent));
        const forwardVector = new pc.Vec3(tx.value(percent), ty.value(percent), tz.value(percent))
            .sub(currentPosition)
            .normalize();
        const sideVector = new pc.Vec3().cross(forwardVector, upVector);

        const sideDistance = 0.5;

        const upPoint = new pc.Vec3().add2(currentPosition, upVector.clone()['scale'](0.01));
        const forwardPoint = new pc.Vec3().add2(currentPosition, forwardVector.clone()['scale'](0.1));
        const sidePoint1 = new pc.Vec3().add2(currentPosition, sideVector.clone()['scale'](sideDistance));
        const sidePoint2 = new pc.Vec3().add2(currentPosition, sideVector.clone()['scale'](-sideDistance));
        const lastSidePoint1 = new pc.Vec3().add2(lastPosition, sideVector.clone()['scale'](sideDistance));
        const lastSidePoint2 = new pc.Vec3().add2(lastPosition, sideVector.clone()['scale'](-sideDistance));
        const upSidePoint1 = new pc.Vec3().add2(sidePoint1, upVector.clone()['scale'](0.05));
        const upSidePoint2 = new pc.Vec3().add2(sidePoint2, upVector.clone()['scale'](0.05));

        // --- render a line segment at a curve position
        this.app.renderLine(lastPosition, currentPosition, this.renderColor);
        this.app.renderLine(lastSidePoint1, sidePoint1, this.renderColor);
        this.app.renderLine(lastSidePoint2, sidePoint2, this.renderColor);

        this.app.renderLine(currentPosition, upPoint, pc.Color.RED);
        this.app.renderLine(sidePoint1, upSidePoint1, pc.Color.RED);
        this.app.renderLine(sidePoint2, upSidePoint2, pc.Color.RED);
        this.app.renderLine(currentPosition, forwardPoint, pc.Color.CYAN);
        this.app.renderLine(sidePoint1, sidePoint2, pc.Color.CYAN);
    };

    _isDirty = function _isDirty() {
        return this._getListeners().some(({ _dirtyWorld }) => _dirtyWorld);
    };

    monitorPointChanges = function monitorPointChanges() {
        if (this._isDirty()) {
            this.getCurvesFromPath();
        }
    };
};

registerScript(KalikratisEditorPath, 'kalikratisEditorPath'); 

KalikratisEditorPath.attributes.add('renderLine', {
    type: 'boolean',
    default: true,
    title: 'Render Line',
    description: 'If checked the line will be rendered in scene (works both in editor and on launch).',
});

KalikratisEditorPath.attributes.add('renderColor', {
    type: 'rgba',
    title: 'Render Color',
    description: 'The color of the line to render.',
});

KalikratisEditorPath.attributes.add('renderStep', {
    type: 'number',
    default: 0.25,
    title: 'Render Step',
    description: 'The length of each line segment rendered.',
});

KalikratisEditorPath.attributes.add('curveType', {
    type: 'number',
    default: 3,
    enum: [
        { CURVE_LINEAR: 0 },
        { CURVE_SMOOTHSTEP: 1 },
        { CURVE_CATMULL: 2 },
        { CURVE_CARDINAL: 3 },
        { CURVE_SPLINE: 4 },
        { CURVE_STEP: 5 },
    ],
    title: 'Curve Type',
    description: 'The type of the line curve rendered.',
});

KalikratisEditorPath.attributes.add('isStatic', {
    type: 'boolean',
    default: false,
    title: 'Is Static',
    description: 'If checked the line will not update if any point gets updated (performance optimization).',
});

KalikratisEditorPath.attributes.add('animationEntity', {
    type: 'entity',
    title: 'Animation Entity',
    description: 'The entity to animate on the path.',
});

KalikratisEditorPath.attributes.add('loopAnimation', {
    type: 'boolean',
    default: true,
    title: 'Loop Animation',
    description: 'If selected the animation will loop infinitely.',
});

KalikratisEditorPath.attributes.add('yoyoAnimation', {
    type: 'boolean',
    default: false,
    title: 'Yoyo Animation',
    description: 'If selected and Loop Animation is also selected the animation will yoyo back when looping.',
});

KalikratisEditorPath.attributes.add('autoplay', {
    type: 'boolean',
    default: true,
    title: 'Auto Play',
    description: 'If selected the animation will automatically start when this entity is initialized.',
});

KalikratisEditorPath.attributes.add('moveSpeed',{
    type: 'number',
    default: 1,
});

// KalikratisEditorPath.attributes.add('inEditor', {
//     type: 'boolean',
//     default: true,
//     title: 'In Editor',
//     description: 'If selected and the Uranus Editor SDK is enabled this script will execute in editor as well.',
// });

export {KalikratisEditorPath};
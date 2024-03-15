import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';

class SceneLoader extends ScriptType {

    initialize = function () {
        for (let i = 0; i < this.gameThemes.length; i++) {
            this.app.on(this.gameThemes[i], this.loadScene, this);
            var newEntity = new pc.Entity();
            newEntity.reparent(this.entity);
            newEntity.name = this.gameThemes[i];
        }
        this.isCustom = false;
    };
    
    loadScene = function (theme, sceneName, customTheme) {
        this.app.logger.log('loading scene: ' + theme + '_' + sceneName);
    
        //delete old scene entities if they exist
        var thisRoot = this.app.root.findByName(theme);
        this.app.logger.log('sceneRoot', thisRoot);
        if (thisRoot.children.length > 0) {
            thisRoot.children[0].destroy();
        }
        var scene = this.app.scenes.find(theme + '_' + sceneName);
        this.app.scenes.loadSceneHierarchy(scene.url, function (err, loadedSceneRootEntity) {
            if (err) {
                console.error(err);
            } else {
                loadedSceneRootEntity.reparent(thisRoot);
                var app = pc['app'];
                app.camera = app.root.findByName('PlayerCamera');
                app.batcher.generate();
                app.lightmapper.bake();
            }
        });
        if(customTheme){
            this.app.fire('customTheme', customTheme);
        }
    };
};

registerScript(SceneLoader, 'sceneLoader'); 

SceneLoader.attributes.add('gameThemes', { type: 'string', array: true });

export {SceneLoader};
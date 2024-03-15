import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';

class SetMaterialVideoTexture extends ScriptType {

// initialize code called once per entity
    initialize = function() {
        this.canUpload = false;
        this.videoElementCreated = false;
        this.app.on('configLoaded', this.initVideoAndRun, this);
        this.app.on(this.videoKey + '_set', this.setManualVideo, this);
        this.app.on(this.videoKey + '_play', this.playVideo, this);
        this.app.on(this.videoKey + '_pause', this.pauseVideo, this);
        this.app.on(this.videoKey + '_vol', this.setVolume, this);
        this.mat = this.entity.render.meshInstances[0].material;   
        this.manualUrl = undefined;
    };

    setVolume = function(vol){
        this.video.volume = vol;
    }

    setManualVideo = function(url){
        if(!this.videoElementCreated){
            this.createVideoElement();
        }
        this.manualUrl = url;
        this.unloadVideo();
        this.loadVideo();
    }

    createVideoElement = function(){
        this.video = document.createElement('video');
        this.video.autoplay = this.autoPlayVideo;
        this.video.crossOrigin = 'anonymous';
        this.video.loop = this.loopVideo;
        this.video.volume = this.volume;

        // muted attribute is required for videos to autoplay
        this.video.muted = this.startMuted;
        // critical for iOS or the video won't initially play, and will go fullscreen when playing
        this.video.playsInline = true;

        // iOS video texture playback requires that you add the video to the DOMParser
        // with at least 1x1 as the video's dimensions
        let style = this.video.style;
        style.width = '1px';
        style.height = '1px';
        style.position = 'absolute';
        style.opacity = '0';
        style.zIndex = '-1000';
        style.pointerEvents = 'none';

        document.body.appendChild(this.video);
        this.videoElementCreated = true;

        // Create a texture to hold the video frame data            
        this.videoTexture = new pc.Texture(this.app.graphicsDevice, {
            format: pc.PIXELFORMAT_R8_G8_B8,
            minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR,
            magFilter: pc.FILTER_LINEAR,
            addressU: pc.ADDRESS_CLAMP_TO_EDGE,
            addressV: pc.ADDRESS_CLAMP_TO_EDGE,
            mipmaps: false,
            //autoMipmap: false
        });

        this.videoTexture.setSource(this.video);

        this.video.addEventListener('canplay', function (e) {
            this.mat.diffuse.set(0,0,0);
            this.mat.diffuseMap = this.blankTexture.resource;
            this.mat.emissiveMap = this.videoTexture;
            this.mat.update();
        }.bind(this));
    }

    initVideoAndRun = function() {
        if(this.app['setting_' + this.videoKey] === "" || this.app['setting_' + this.videoKey] === undefined){
            if(this.defaultUrl === ''){
                return;
            }
        }
        if(this.app['setting_' + this.videoKey].endsWith('.jpg') || this.app['setting_' + this.videoKey].endsWith('.png')){
            //load image in place of video
            this.setImage(this.app['setting_' + this.videoKey]);
        }
        else{
            if(!this.videoElementCreated){
                this.createVideoElement();
            }
            this.loadVideo();
            if(this.autoPlayOnFirstLoad){
                this.playVideo();
            }
        }


    };

    setImage = function (value) {
        if(value === "" || value === undefined){
            return;
        }
        var image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = (() => {
            var texture = new pc.Texture(this.app.graphicsDevice);
            texture.anisotropy = 16;
            texture.mipmaps = true;
            texture.setSource(image);
            this.mat.diffuse.set(1,1,1);
            this.mat.diffuseMap = texture;
            this.mat.emissiveMap = texture;
                this.mat.opacityMap = texture;
                this.mat.blendType = pc.BLEND_NONE;
                this.mat.opacityMapChannel = 'a';
                this.mat.alphaToCoverage = true;
            this.mat.update();
        }).bind(this);
        image.src = value.url !== undefined ? value.url : value;
    };

    unloadVideo = function() {
        this.canUpload = false;
        // unload video : src : https://stackoverflow.com/questions/3258587/how-to-properly-unload-destroy-a-video-element
        // Other src: https://html.spec.whatwg.org/multipage/media.html#best-practices-for-authors-using-media-elements
        if(this.video) {
            this.video.pause();
            this.video.removeAttribute('src');
            this.video.load();
        }
    };

    loadVideo = function(){
        // unload video : src : https://stackoverflow.com/questions/3258587/how-to-properly-unload-destroy-a-video-element
        // Other src: https://html.spec.whatwg.org/multipage/media.html#best-practices-for-authors-using-media-elements
        this.canUpload = true;
        if(this.defaultUrl !== "" && (this.app['setting_' + this.videoKey] === undefined || this.app['setting_' + this.videoKey] === '')){
            this.manualUrl = this.defaultUrl;
        }
        this.video.src = this.manualUrl === undefined ? this.app['setting_' + this.videoKey] : this.manualUrl;
        this.video.load();
        this.app.customVideosLoaded += 1;
        if(this.app.customVideosLoaded = this.app.numberOfCustomVideos){
            this.app.videosLoadedResolver();
        }
    }

    playVideo = function(){
        this.video.play();
    }

    pauseVideo = function(){
        this.video.pause();
    }

    // update code called every frame
    update = function(dt) {
            // Transfer the latest video frame to the video texture
        if(this.canUpload){
                this.videoTexture.upload();
        }    
    };
};

registerScript(SetMaterialVideoTexture, 'setMaterialVideoTexture');

SetMaterialVideoTexture.attributes.add('defaultUrl', {type: 'string'});

SetMaterialVideoTexture.attributes.add('blankTexture', {
    type: 'asset',
    assetType: 'texture'
});


SetMaterialVideoTexture.attributes.add('autoPlayOnFirstLoad', {
    type: 'boolean', 
    default: true
});

SetMaterialVideoTexture.attributes.add('loopVideo', {
    type: 'boolean',
    default: true
});

SetMaterialVideoTexture.attributes.add('volume', {
    type: 'number',
    default: 0.5
});

SetMaterialVideoTexture.attributes.add('startMuted', {
    type: 'boolean', 
    default: true
});

export {SetMaterialVideoTexture};
import {registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';


class AppRenderer extends ScriptType {

    initialize = function () {
        this.app.gameRender = this;
        this.rafId = null;
        this.mediaRecorder = null;
        this.chunks = [];
        this.fps = 0;
        this.isHidden = false;
        this.setResolution();
        window.addEventListener('resize', this.setResolution.bind(this));
        this.lastTime = performance.now();
        this.deltaTimeAccumulator = 0;
        this.frameDuration = 1000 / this.targetFps;
        this.renderedFrames = 0;
        this.app.on('settingsLoaded', this.start, this);
        this.app.on('resetGame', this.onReset, this);
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                this.lastTime = performance.now();
                this.isHidden = false;
                this.rafId = requestAnimationFrame(this.renderLoop.bind(this));
            }
            else{
                this.isHidden = true;
                cancelAnimationFrame(this.rafId);
            }
        });
    };
    
    onReset =  function(){
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop(true);
        }
    };

    start = function () {
        if (this.app.setting_showFps === true) {
            this.startFpsCounter();
        }
        this.app.autoRender = false;
        this.rafId = requestAnimationFrame(this.renderLoop.bind(this));
    };
    
    startFpsCounter = function () {
        this.initializeFpsDisplay();
        setInterval(() => {
            this.fps = this.renderedFrames;
            this.fpsDisplay.textContent = `FPS: ${Math.round(this.fps)}`;
            this.renderedFrames = 0;  // Reset the counter for the next second
        }, 1000);
    };
    
    setResolution = function () {
        // Get the current aspect ratio
        var aspectRatio = window.innerWidth / window.innerHeight;
    
        // Calculate width for 1080p height
        if(this.verticalResolution > 3840){
            this.verticalResolution = 3840;
        }
        if(this.verticalResolution < 720){
            this.verticalResolution = 720;
        }
        var targetHeight = this.verticalResolution;
        var targetWidth = targetHeight * aspectRatio;
    
        // Apply the resolution to PlayCanvas
        var app = pc.Application.getApplication(); // Assuming you have PlayCanvas' pc namespace available
    
        app.setCanvasResolution(pc.RESOLUTION_FIXED, targetWidth, targetHeight);
        app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    
    };
    
    initializeFpsDisplay = function () {
        this.fpsDisplay = document.createElement('div');
        this.fpsDisplay.id = 'fps-display';
        this.fpsDisplay.style.position = 'absolute';
        this.fpsDisplay.style.top = '10px';
        this.fpsDisplay.style.left = '10px';
        this.fpsDisplay.style.zIndex = '9999';
        this.fpsDisplay.style.color = 'white';
        this.fpsDisplay.style.backgroundColor = 'black';
        this.fpsDisplay.style.padding = '5px';
        document.body.appendChild(this.fpsDisplay);
    };
    
    renderLoop = function (currentTime) {
        if (this.isHidden === true) {
            return;
        }
    
        // Compute the time since the last frame in milliseconds.
        var deltaTime = Math.min(currentTime - this.lastTime, this.frameDuration);
        this.deltaTimeAccumulator += deltaTime;
    
        let logicUpdated = false;
        // This loop ensures all accumulated time is accounted for
        while (this.deltaTimeAccumulator >= this.frameDuration) {
            // Call your game update logic with the frameDuration, not deltaTime, since we want consistent game updates
            this.app.gameController.onFrameRender(this.frameDuration / 1000);
            this.deltaTimeAccumulator -= this.frameDuration;
            this.renderedFrames++;
            logicUpdated = true;
        }
    
        // Only render if there was an update to the game logic
        if (logicUpdated) {
            this.app.render();
        }
        
        this.lastTime = currentTime;
        this.rafId = requestAnimationFrame(this.renderLoop.bind(this));
    };
    
    
    initializeMediaRecorder = function (stream) {
        var codecs = [
            { mimeType: 'video/webm; codecs=vp9', bitsPerSecond: this.recordingBps },
            { mimeType: 'video/webm; codecs=vp8', bitsPerSecond: this.recordingBps },
            { mimeType: 'video/webm; codecs=h264', bitsPerSecond: this.recordingBps },
            { mimeType: 'video/mp4; codecs=h264', bitsPerSecond: this.recordingBps },
            { mimeType: 'video/webm', bitsPerSecond: this.recordingBps }, // Generic webm
            { mimeType: 'video/mp4', bitsPerSecond: this.recordingBps }  // Generic mp4
        ];
    
        var options = null;
    
        for (var i = 0; i < codecs.length; i++) {
            if (MediaRecorder.isTypeSupported(codecs[i].mimeType)) {
                options = codecs[i];
                break;
            }
        }
    
        if (!options) {
            console.error("No supported codec found.");
            return;
        }
    
        this.mediaRecorder = new MediaRecorder(stream, options);
    
        this.mediaRecorder.ondataavailable = function (event) {
            this.chunks.push(event.data);
        }.bind(this);
    
        this.mediaRecorder.onstop = async function (isReset) {
            if(isReset === true){
                this.chunks = [];
                return;
            }
            var blob = new Blob(this.chunks, { type: options.mimeType });
            
            try {
                const dataUrl = await this.blobToDataURL(blob);
        
                if (this.app.inPlayCanvas) {
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    // Extract the file extension without codec details
                    var filenameExtension = options.mimeType.split('/')[1].split(';')[0];
                    a.download = 'playcanvas-gameplay.' + filenameExtension;
                    a.click();
                } else {
                    this.app.controller.sendMessage({
                        event: "game_recording",
                        data: {
                            "url": dataUrl,  // Send the data URL instead of blob URL
                        }
                    });
                }
                this.chunks = []; // Clear the chunks for the next recording
            } catch (error) {
                console.error("Error converting blob to data URL: ", error);
            }
        }.bind(this);
    };
    
    // Start recording
    startRecording = function () {
        if (this.app.setting_recordGame !== true) {
            return;
        }
        var canvas = document.querySelector('canvas');
    
        // Capture every other frame
        var stream = canvas.captureStream(this.targetFps / 2);
    
        this.initializeMediaRecorder(stream);
    
        // Calculate timeslice for capturing every frame (but since our capture rate is half, it results in capturing every other frame)
        var timeslice = 1000 / (this.targetFps / 2);
        this.mediaRecorder.start(timeslice);
    };
    
    // Stop recording
    stopRecording = function () {
        if (this.app.setting_recordGame !== true) {
            return;
        }
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop(false);
        }
    };

    blobToDataURL = function(blob: Blob): Promise<string> {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = _e => resolve(reader.result as string);
          reader.onerror = _e => reject(reader.error);
          reader.onabort = _e => reject(new Error("Read aborted"));
          reader.readAsDataURL(blob);
        });
      }
};

registerScript(AppRenderer, 'appRenderer'); 

AppRenderer.attributes.add('targetFps', { type: 'number', default: 30 });
AppRenderer.attributes.add('recordingBps', { type: 'number', default: 250000 });
AppRenderer.attributes.add('verticalResolution', { type: 'number', default: 1080 });

export {AppRenderer};
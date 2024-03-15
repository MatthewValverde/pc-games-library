import { registerScript, ScriptType } from 'playcanvas';
import { Random } from 'random-js';
import { MersenneTwister19937 } from 'random-js';
import * as pc from 'playcanvas';

class AppController extends ScriptType {

    public initialize = function(){
        
        this.app.controller = this;

        //create base app variables and promises
        this.setAppVariables();
        this.setPromises();
        this.muteAppUntilInput();
        
        //wait until game is setup then turn off load screen
        this.waitForGameSetupComplete();
        

        //wait until game controller exists
        var self = this;
        var checkExist = setInterval(function () {
    
            if (self.app.gameController !== undefined) {
                clearInterval(checkExist);
                console.log('exists');
                self.start();
            }
        }, 100);
    }

    public start = function(){
        //check if game is running in playcanvas
        this.app.inPlayCanvas ? this.startPlayCanvasGame() : this.startPlatformGame();
    }

    public setAppVariables= function(){
        this.app.stateNum = -1;
        this.app.platform = this.getPlatform();
        this.app.inPlayCanvas = this.getInPlayCanvas();
    }

    public setPromises = function(){
        this.createPromise('configLoaded');
        this.createPromise('input');
        this.createPromise('imagesLoaded');
        this.createPromise('assetsLoaded');
        this.createPromise('videosLoaded');
    }

    public createPromise(string){
        this.app[string + 'Promise'] = new Promise(resolve => this.app[string + 'Resolver'] = resolve);
    };

    public muteAppUntilInput = function(){
        this.app.systems.sound.volume = 0;
        Promise.all([
            this.app.configLoadedPromise,
            this.app.inputPromise,
        ]).then(() => {
            if (this.app.inPlayCanvas === true || this.app.mode.includes('freeplay') || this.app.mode.includes('event')) {
                this.app.tween(this.app.systems.sound.manager).to({ volume: 1 }, 0.5, pc['SineInOut']).start();
            }
        });
    }

    public startPlayCanvasGame = function(){
        //game running in playcanvas, load config file to set up game
        this.parseConfig(this.playcanvasConfigJson.resource);
        
    }

    public startPlatformGame = function(){
        //game running outside playcanvas
        //subscribe to window messages and send ready so a config can be received
        window.addEventListener('message', this.receiveMessage.bind(this));
        this.sendMessage({ event: 'ready', apiVersion: 1 });
    }

    public waitForGameSetupComplete = function(){
        Promise.all([
            this.app.configLoadedPromise,
            this.app.imagesLoadedPromise,
            this.app.assetsLoadedPromise,
            this.app.videosLoadedPromise,
        ]).then(() => {
            this.selfRanStates = (this.app.inPlayCanvas === true || this.app.mode === 'freeplay');
            this.setStatesFromJson(this.stateJson.resource);
            this.forceSetState(this.app.states[0].name);
            if(this.app.settings !== undefined && this.app.settings.timers !== undefined){
                if(this.selfRanStates) Object.keys(this.app.settings.timers).forEach(key => this.loadTimer(key, this.app.settings.timers[key]));
            }
            this.app.stateStartTime = (this.app.inPlayCanvas === true && this.app.mode !== 'freeplay') ? Date.now() : undefined;
            if(this.app.setting_font1 !== undefined && this.app.setting_font1 !== ''){
                for(let i = 0; i < this.fontNames.length; i++){
                    if(this.app.setting_font1 === this.fontNames[i]){
                        this.font1Id = i;
                        this.app.customFont1 = this.fonts[this.font1Id];
                    }
                }
            }
            if(this.app.setting_font2 !== undefined && this.app.setting_font2 !== ''){
                for(let i = 0; i < this.fontNames.length; i++){
                    if(this.app.setting_font2 === this.fontNames[i]){
                        this.font2Id = i;
                        this.app.customFont2 = this.fonts[this.font2Id];
                    }
                }
            }
            this.app.fire('initializationComplete');
            this.sendMessage({ event: 'initialization_complete' });    
            //subscribe to state changes if we are in event and not in playcanvas
            //if (!this.selfRanStates) this.sendMessage({event:'getState', apiVersion: 1});
        });        
    }

    public setStatesFromJson = function(stateJson){
        this.app.states = stateJson[this.app.mode] === undefined ? stateJson.default : stateJson[this.app.mode];
    }

    public loadTimer = function(key, value){
        for (let i = 0; i< this.app.states.length; i++){
            if(key === this.app.states[i].timeVar){
                this.app.states[i].duration = value;
            }
        }
    }

    public update = function(dt){
        if(this.selfRanStates === true){
            if(this.app.stateStartTime !== undefined){
                //run states
            }
        }
    }   

////////////////////////////////////////
//MESSAGE RECEIVING/////////////////////
////////////////////////////////////////

    public receiveMessage = function (message) {
        if (Object.values(message.data).length === 0) {
            this.app.logger.log('recieved message with no data', message);
            return;
        }

        const { event, data, requestType } = message.data;
        switch (event) {
            case 'config':
                this.app.logger.log(event, "received", data);
                if(this.app.config === undefined) this.parseConfig(data);
                break;
            case 'state':
                this.app.logger.log(event, "received", data.data);
                this.parseState(data.data);
                break;
            case 'response':
                switch (requestType) {
                    case 'get_leaderboard':
                        this.handleIncomingLeaderboard(message.data);
                        break;
                    case 'get_leader_entry':
                        this.handleIncomingLeader(message.data);
                        break;
                }
                break;
            case 'resetGame':
                this.setRandomSeed(data.seed ? data.seed : undefined);
                if(this.app.canReset === true){
                    this.app.canReset = false;
                    this.app.fire('resetGame');
                }
                break;
            case 'muteGame':
                this.app.systems.sound.volume = 0;
                this.app.fire('mute');
                break;
            case 'unmuteGame':
                this.app.fire('unmute');
                this.app.systems.sound.volume = 1;
                break;
            default:
                this.app.logger.log('Unsupported message', message.data);
                break;
        }
    };
    
    public setRandomSeed = function(seed){
        this.app.random = new Random(seed ? MersenneTwister19937.seed(seed):MersenneTwister19937.autoSeed());
    }

////////////////////////////////////////
//CONFIG PARSING////////////////////////
////////////////////////////////////////

    public parseConfig = function(config){
        this.app.config = config;
        //////////run one time config load code
        this.app.mode = config.mode;
        this.app.logger.log('App Running in ' + this.app.mode + ' mode.');
        if(config.design){
            this.parseDesign(config.design);
        }
        else{
            this.app.imagesLoadedResolver();
            this.app.videosLoadedResolver();
        }
        if(config.settings){
            this.parseSettings(config.settings);
        }
        else{
            this.app.settings = {};
            this.app.fire('settingsLoaded')
        }
        this.app.configLoadedResolver();
        this.app.fire('configLoaded');
    }

    public parseDesign = function (design) {
        const { colors, images, videos } = design;

        if (colors && Object.values(colors).length > 0) {
            this.app.colors = colors;
            this.app.logger.log('LOADING COLORS:', colors);
            Object.keys(colors).forEach(key => this.setColor(key, colors[key]));
        }
        
        
        if (images && Object.values(images).length > 0) {
            this.app.numberOfCustomImages = 0;
            Object.keys(images).forEach(key => this.checkEmptyOrAdd(images[key], "Images"));
            this.app.logger.log('LOADING IMAGES:', images);
            this.app.customImagesLoaded = 0;
            Object.keys(images).forEach(key => this.setImage(key, images[key]));
            if(this.app.numberOfCustomImages === 0){
                this.app.imagesLoadedResolver();
            }
        }
        else {
            this.app.imagesLoadedResolver();
        }

        if (videos && Object.values(videos).length > 0) {
            this.app.numberOfCustomVideos = 0;
            Object.keys(videos).forEach(key => this.checkEmptyOrAdd(videos[key], "Videos"));
            this.app.logger.log('LOADING VIDEOS', videos);
            this.app.customVideosLoaded = 0;
            Object.keys(videos).forEach(key => this.setVariable(key, videos[key]));
            if(this.app.numberOfCustomVideos === 0){
                this.app.videosLoadedResolver();
            }
        }
        else{
            this.app.videosLoadedResolver();
        }
    };

    public checkEmptyOrAdd = function(value, group){
        if(value === "" || value === undefined){
            return;
        }
        this.app["numberOfCustom"+group] += 1;
    }

    public setColor = function (key, value) {
        if(value === "" || value === undefined){
            return;
        }
        var keyColor = new pc.Color().fromString(value);
        this.app['color_' + key] = keyColor;
        this.app.fire('setColor_' + key);
    };

    public setImage = function (key, value) {
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
            this.app['texture_' + key] = texture;
            this.app.fire('setTexture_' + key, texture);
            this.app.customImagesLoaded += 1;
            if(this.app.customImagesLoaded === this.app.numberOfCustomImages){
                this.app.imagesLoadedResolver();
            }
        }).bind(this);
        image.src = value.url !== undefined ? value.url : value;

        /////
        //SPRITE AND TEXTURE LOADER
        /////
        // var image = new Image();
        // image.crossOrigin = 'anonymous';
        // const prom = new Promise(res => {
        //     image.onload = () => {
        //         const atlas = new pc.TextureAtlas();
        //         atlas.frames = {
        //             "0": {
        //                 rect: new pc.Vec4(0, 0, 512, 512),
        //                 pivot: new pc.Vec2(0.5, 0.5),
        //                 border: new pc.Vec4(0, 0, 0, 0)
        //             },
    
        //         };
        //         const texture = new pc.Texture(this.app.graphicsDevice, {
        //             magFilter: pc.FILTER_LINEAR,
        //             minFilter: pc.FILTER_LINEAR
    
        //         });
        //         texture.anisotropy = 16;
        //         texture.mipmaps = true;
                
        //         texture.setSource(image);

        //         this.app['texture_' + key] = texture;
        //         this.app.fire('setTexture_' + key, texture);
                
        //         atlas.texture = texture;
    
        //         const sprite = new pc.Sprite(this.app.graphicsDevice, {
        //             atlas,
        //             frameKeys: ['0'],
        //             pixelsPerUnit: 100,
        //             renderMode: pc.SPRITE_RENDERMODE_SIMPLE
    
        //         });
                
        //         return res(sprite);
        //     };
        //     image.src = value.url !== undefined ? value.url : value;
        // });

        // prom
        //     .then(sprite=>{
        //         this.app['sprite_' + key] = sprite;
        //         this.app.customImagesLoaded += 1;
        //         if(this.app.customImagesLoaded === this.app.numberOfCustomImages){
        //             this.app.imagesLoadedResolver();
        //         }
        // });
    };

    public parseSettings = function (settings) {
        if (Object.values(settings).length > 0) {
            this.app.settings = settings;
            Object.keys(settings).forEach(key => this.setVariable(key, settings[key], settings));
        }
        else{
            this.app.settings = {};
        }
        this.app.fire('settingsLoaded');
    };

    public setVariable = function (key, entry, settings) {
        this.app['setting_' + key] = entry.url !== undefined ? entry.url : entry;
        this.app.fire(key, this.app[key]);
    };

////////////////////////////////////////
//STATE PARSING/////////////////////////
////////////////////////////////////////

    public parseState = function(state){
        
        const {sid, gameStateInfo, stateStartTime, stateName, stateDuration} = state;
        
        if(sid !== undefined){

            if(this.app.sessionId === undefined){
                
                //subscribe to socket multiplayer if required
                if (this.socketMultiplayer) this.subscribeToMultiplayer();

                //the game is not in a session, join the current session/event
                this.app.sessionId = sid;
                this.app.gameController.joinEvent();
            }
            
            //set game state
            //this.app.gameController.setState(stateName, stateDuration, gameStateInfo, stateStartTime);
            this.startState(stateName, stateStartTime, stateDuration);
        }
        else{

            if(this.app.stateStartTime === undefined){
                
                //game is in an active event, stop it and reset game
                this.app.gameController.leaveEvent();
                this.app.sessionId = undefined;
                this.app.stateStartTime = undefined;
                if (this.socketMultiplayer) this.unsubscribeFromMultiplayer();
            }
        }
    };

    public subscribeToMultiplayer(){
        //TBD
    };

    public unsubscribeFromMultiplayer(){
        //TBD
    };

    public forceSetState = function(stateName) {
        // Clear the state timer if it exists
        if(this.interval){
            clearInterval(this.interval);
        }
      
        for (let i = 0; i < this.app.states.length; i++) {
          if (stateName === this.app.states[i].name) {
            this.app.stateNum = i;
            this.startState(this.app.states[i].name, Date.now(), this.app.states[i].duration);
            return;
          }
        }
      }

    public startState = function(stateName, stateStartTime, stateDuration){
        //if previous state active deactivate it
        this.app.logger.log('stateStart:', stateName, " Time: ", stateDuration);
        this.app.menuName = stateName;
        this.app.stateName = stateName;
        this.app.fire('stateSet');
        this.app.fire('stateStart_' + stateName);
        //track state time if needed (duration > 0)
        if(stateDuration > 0){
            this.trackStateTime(stateName, stateDuration);
        }
    };

    public goToNextState = function(){
        if(this.selfRanStates){
            var nextState = this.app.states[this.app.stateNum + 1].name;
            this.forceSetState(nextState);
        }
    }

    private delay = function(delay: number) {
        return new Promise(r => {
            setTimeout(r, delay);
        })
    };

    private trackStateTime = function(trackedState, stateDuration) {
        if (stateDuration === 0) return;
      
        let timer = stateDuration;
        if(this.interval){
            clearInterval(this.interval);
        }
        this.app.fire('timer_' + trackedState, timer);
        this.interval = setInterval(() => {
          timer--;
          this.app.fire('timer_' + trackedState, timer);
          if (timer === 0) {
            clearInterval(this.interval);
            this.goToNextState();
          }
        }, 1000);
      }

////////////////////////////////////////
//MESSAGE SENDING///////////////////////
////////////////////////////////////////

    public sendMessage = function (message) {
        this.app.logger.log('Sending Message', message);
        parent.postMessage(message, '*');
    };

    public sendScore = function (scoreToSend: number) {
        this.sendMessage({
            id: 0,
            event: 'award_points',
            data: {
                leaderboards: [this.getLeaderboardId()],
                amount: scoreToSend,
            }
        });
    };

    requestLeaderboard = function (limit){
        var topLeadersLimit = limit === undefined ? (this.app.mode.includes('mainboard') ? this.mainboardLeaderboardCount : this.leaderboardCount) : limit;
        
        //get leaderboard
        this.sendMessage({
            id: 0,
            event: 'get_leaderboard',
            data: {
                leaderboard: this.leaderboardID,
                topLeadersLimit
            }
        });
        
        //get user leaderboard data
        if(!this.app.mode.includes('mainboard')){
            this.sendMessage({
                event: 'get_leader_entry',
                data: {
                    leaderboard: this.getLeaderboardId()
                }
            });
        }
    }

    getLeaderboardId = function(){return this.app.mode === 'freeplay' ? `freeplay-${this.gameId}` : `${this.gameId}-${this.app.sessionId}`;};

    public getPlatform = function (): void {
        const userAgent = navigator.userAgent || navigator.vendor || window['opera'];
        var platform;
        // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            platform = "Windows Phone";
        }
        else if (/android/i.test(userAgent)) {
            platform = "Android";
        }
        else if (/iPad|iPhone|iPod/.test(userAgent) && !window['MSStream']) {
            platform = "iOS";
        }
        else{
            platform = 'desktop';
        }
        return platform;
    };

    public getInPlayCanvas = function(){
        var pageUrl = window.location.href;
        this.app.logger.log('pageUrl', pageUrl);
        return pageUrl.includes('playcanv') ? true : false;
    }
}
registerScript(AppController, 'appController');

AppController.attributes.add('gameId', {type: 'string', default: 'game-id'});
AppController.attributes.add('socketMultiplayer', {type: 'boolean', default: false});
AppController.attributes.add('leaderboardCount', {type: 'number', default: 5});
AppController.attributes.add('mainboardLeaderboardCount', {type: 'number', default: 10});
AppController.attributes.add('capFramerate', {type: 'boolean', default: false});
AppController.attributes.add('playcanvasConfigJson', {
    type: 'asset',
    title: 'PlayCan Config JSON',
    assetType: 'json',
    description: 'testConfig.json in the base folder - Change your settings in this file for test modes'
});
AppController.attributes.add('stateJson', {
    type: 'asset',
    title: 'State JSON',
    assetType: 'json',
    description: 'state setup for the game'
});
AppController.attributes.add('fontNames', {type: 'string', array: true});
AppController.attributes.add('fonts', {type: 'asset', assetType: 'font', array: true});
export { AppController };


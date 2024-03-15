import { Random } from "random-js";
import { AppController } from "./AppController";
import { EnableUiMulti } from "./enableUiMulti";
import { DeleteAfterTime } from "./deleteAfterTime";
import { SceneLoader } from "./sceneLoader";
import { SetMaterialColor } from "./setMaterialColor";
import { SetMaterialTexture } from "./setMaterialTexture";
import { SetMaterialVideoTexture } from "./setMaterialVideoTexture";
import { SetTextOnEvent } from "./setTextOnEvent";
import { SetTextFont } from "./setTextFont";
import { SetUiColor } from "./setUiColor";
import { SetUiTexture } from "./setUiTexture";
import { SetParticleColor } from "./setParticleColor";
import { UiLeaderboard } from "./uiLeaderboard";
import { InputMouseTouch } from "./InputMouseTouch";
import { AppRenderer } from "./appRenderer";
//import other
import { TextInput } from "./textInput";
import { Bloom } from "./posteffect-bloom";
import { ButtonSetMenu } from "./buttonSetMenu";
import { ButtonSetState } from "./buttonSetState";
import { ButtonFireEvent } from "./buttonFireEvent";
import { Ccd } from "./ccd";
import { KalikratisEditorPath } from "./kalikratis-editor-path";
import { ScoreCollision } from "./scoreCollision";
import { TransformPingPong } from "./transformPingPong";
import { TransformRotate } from "./transformRotate";
import { Logger } from "./logger";

const setGameInfo = (gameInfo) => {
    const {gameId, gameVersion, gameModes, colorKeys, textureKeys, videoKeys, states, menus} = gameInfo;
    //add attributes to template scripts based on gameInfo
    AppController.attributes.add('playcanvasTestMode', {
        title: 'Playcanvas Test Mode',
        type: 'string',
        default: 'freeplay',
        enum: gameModes,
        description: 'Test Mode for playcanvas, tested update'
    });
    SetMaterialColor.attributes.add('colorKey', {
        type: 'string',
        enum: colorKeys
    });
    SetUiColor.attributes.add('colorKey', {
        type: 'string',
        enum: colorKeys
    });
    SetParticleColor.attributes.add('colorKey', {
        type: 'string',
        enum: colorKeys,
        array: true
    });
    SetMaterialTexture.attributes.add('textureKey', {
        type: 'string',
        enum: textureKeys
    });
    SetUiTexture.attributes.add('textureKey', {
        type: 'string',
        enum: textureKeys
    });
    SetMaterialVideoTexture.attributes.add('videoKey', {
        type: 'string',
        enum: videoKeys
    });
    ButtonSetMenu.attributes.add('toMenu', {
        type: 'string',
    });
    ButtonSetState.attributes.add('toState', {
        type: 'string',
    });
    EnableUiMulti.attributes.add('enabledMenus', {
        type: 'string', 
        //enum: menus,
        array: true
    });
    EnableUiMulti.attributes.add('enabledStates', {
        type: 'string', 
        //enum: states,
        array: true
    });
    
};

//export package to be imported by typescript template projects
export {
    AppRenderer,
    Logger,
    AppController,
    Bloom,
    ButtonFireEvent,
    ButtonSetMenu,
    ButtonSetState,
    Ccd,
    DeleteAfterTime,
    EnableUiMulti,
    KalikratisEditorPath,
    SceneLoader,
    ScoreCollision,
    SetMaterialColor,
    SetMaterialTexture,
    SetMaterialVideoTexture,
    SetUiColor,
    SetUiTexture,
    SetParticleColor,
    SetTextOnEvent,
    SetTextFont,
    setGameInfo,
    TextInput,
    TransformPingPong,
    TransformRotate,
    UiLeaderboard,
    Random,
    InputMouseTouch,
};

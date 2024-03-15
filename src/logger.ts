import * as pc from 'playcanvas';
import { registerScript, ScriptType } from 'playcanvas';
class Logger extends ScriptType {

    initialize = function(){
        this.app.logger = this;
    };
    
    public log = function(...message){
        if(this.app.inPlayCanvas === true){
            console.log(...message);
        }
    };
  
    public warn = function(...message){
        console.warn(...message);
    };
  
    public error = function(...message){
        console.error(...message);
    };
};

registerScript(Logger, 'logger'); 

export {Logger};
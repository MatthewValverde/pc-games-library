import { registerScript, ScriptType } from 'playcanvas';
import * as pc from 'playcanvas';

class TextInput extends ScriptType {



    // initialize code called once per entity
    initialize = function () {
        this.app.activeTextInput = undefined;

        this.app.on('resetTextInput', () => {
            this.reset();
        });

        this.inputContainer.element.on('click', function (event) {
            event.event.preventDefault();
            this.setActive();
        }, this);



        this.reset();
    };

    reset = function () {
        this.clearInputFocus();
        this.app[this.textAppVar] = '';
        this.textDisplay.element.text = this.clearText;
        this.app.fire('closeKeyboard');
    };

    setText = function (newString) {

        this.app[this.textAppVar] = newString;
        //this.app.fire(this.fireOnTextSet, newString === '' ? 'NO ANSWER' : this.app[this.textAppVar]);
        this.app.gameController.setTextString(this.id, newString === '' ? 'NO ANSWER' : this.app[this.textAppVar]);
        this.textDisplay.element.text = newString === '' ? this.clearText : this.app[this.textAppVar];
        this.app.fire('currentInputText', this.app[this.textAppVar]);
    };

    public setActive = function () {
        if (this.app.activeTextInput !== this) {
            if (this.app.activeTextInput !== undefined) {
                this.app.activeTextInput.setInactive();
            }

            this.app.activeTextInput = this;
            this.app.inputElement.value = this.app[this.textAppVar];
            const end = this.app.inputElement.value.length;
            this.app.inputElement.setSelectionRange(end, end);
            this.openKeyboard(100);
            this.highlightContainer.enabled = true;


            this.app.logger.log('set active', this.id);
        }
    };

    public setInactive = function () {
        this.highlightContainer.enabled = false;
    };

    public clearInputFocus = function () {
        if (this.app.activeTextInput === this) {
            this.app.fire('currentInputText', '');
            this.app.activeTextInput = undefined;
            this.setInactive();
            //this.closeKeyboard(this.iOS === true ? 0 : 90);
            this.closeKeyboard(0);
        }
    };

    openKeyboard = function (time) {
        window.setTimeout(function () {
            this.app.inputElement.focus();
            this.app.fire('openKeyboard');
        }.bind(this), time);

    };

    closeKeyboard = function (time) {
        window.setTimeout(function () {
            this.app.graphicsDevice.canvas.focus();
            this.app.fire('closeKeyboard');
        }.bind(this), time);

    };


}

registerScript(TextInput, 'textInput');
// initialize code called once per entity
TextInput.attributes.add('id', { type: 'string' });
TextInput.attributes.add('clearText', { type: 'string', default: 'Input Answer' });
TextInput.attributes.add('textAppVar', { type: 'string' });
TextInput.attributes.add('fireOnTextSet', { type: 'string' });
TextInput.attributes.add('inputContainer', { type: 'entity' });
TextInput.attributes.add('highlightContainer', { type: 'entity' });
TextInput.attributes.add('textDisplay', { type: 'entity' });

TextInput.attributes.add('clearButtons', { type: 'entity', array: true });

export { TextInput };
import { Monkey } from './MonkeyPatch.js';
import { Draw } from './Draw.js';
import { log } from './messages.js';

export default class TempHpEnabledBar {

    /**
     * Modify Token._drawBar to call custom drawing method if 
     */
    static patchTokenDrawBar() {
        const TokenClass = CONFIG["Token"]?.objectClass ?? Token;
        log(`Patching ${TokenClass.name}._drawBar`);

        Monkey.replaceMethod(TokenClass, '_drawBar', function(number, bar, data) {
            if (TempHpEnabledBar.shouldDraw(data.attribute)) {
                const hpBar = new TempHpEnabledBar(this, number, bar);
                return hpBar.draw();
            }

            return Monkey.callOriginalFunction(this, '_drawBar', number, bar, data);
        });
    }

    /**
    * Should the custom HP bar drawing method be used?
    *
    * @param {String} attribute  Key path to the attribute to be drawn in the bar.
    * @return {boolean}          Whether to use the custom HP bar or the core Foundry bar.
    */
    static shouldDraw(attribute) {
        return attribute === "attributes.hp";
    }
    
    constructor(token, number, bar) {
        this.token = token;
        this.barNumber = number;
        this.bar = bar;
        this.tempText = new PIXI.Text();
    
        this.w = token.w;
        this.h = Math.max((canvas.dimensions.size / 12), 8);
        if ( token.data.height >= 2 ) this.h *= 1.6;  // Enlarge the bar for large tokens
    }

    get data() {
        return this.token.actor.data.data;
    }

    /* ---------------------------------------- */
    /*              Private Methods             */
    /* ---------------------------------------- */

    /**
    * Step through the drawing process.
    *
    * @protected
    */
    draw() {
        this._predraw();
        const draw = new Draw(this.bar, this.token.w, this.h, this.tempText);
        this._draw(draw);
        this._postdraw();
    }

    /**
    * Steps to perform before drawing.
    *
    * @protected
    */
    _predraw() {
        this.bar.clear();
        this.bar.removeChildren();
    }

    _draw(draw) {
        let _hp = duplicate(this.data.attributes.hp);
        const hp = {
          max: Number(_hp.max),
          temp: Number(getProperty(_hp, "temp") || 0),
          value: Number(_hp.value),
        }
      
        const hasTemp = hp.temp > 0;
      
        const valuePct = Math.clamped(hp.value, 0, hp.max) / hp.max;
        const valueColorPct = Math.clamped(hp.value, 0, hp.max) / hp.max;
    
        draw.setSize(hasTemp)
            .background()
            .current(valuePct)
            .mainBorder()
            .temp(hp.temp);
    }

    /**
    * Steps to perform after drawing.
    *
    * @protected
    */
    _postdraw() {
        // Set position
        let posY = this.barNumber === 0 ? this.token.h - this.h : 0;
        this.bar.position.set(0, posY);
    }

}
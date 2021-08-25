import { log } from './messages.js';
import { Monkey } from './MonkeyPatch.js';
import { BetterRollsChatCard } from "../../betterrolls5e/scripts/chat-message.js";

export default class TempHpButton {

    constructor() {
	}

    static patchChatCard() {
        log(`Patching Chatcard`);
        
        Monkey.replaceMethod(BetterRollsChatCard, '_setupOverlayButtons', async function(html) {            
            await Monkey.callOriginalFunction(this, '_setupOverlayButtons', html);

            const damageOverlays = html.find(".damage-overlay-br > span:first-child");
            const tempDamageButton = await renderTemplate(`modules/better-temp-hp-5e/templates/overlay-damage-update.html`);

		    // Add chat damage buttons
		    [...damageOverlays].forEach(element => {
			    element = $(element);
			    element.prepend($(tempDamageButton));
            });

            html.find('.temp-hp-button').off().on("click", async (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
    
                // find out the proper dmg thats supposed to be applied
                const dmgElement = $(ev.target.parentNode.parentNode.parentNode.parentNode);
                let dmg = dmgElement.find('.red-base-die').text();
    
                if (dmgElement.find('.red-extra-die').length > 0) {
                    const critDmg = dmgElement.find('.red-extra-die').text();
                    const dialogPosition = {
                        x: ev.originalEvent.screenX,
                        y: ev.originalEvent.screenY
                    };
    
                    dmg = await this._resolveCritDamage(Number(dmg), Number(critDmg), dialogPosition);
                }
    
                // apply temp hp to selected tokens using the apply damage method
                for (const actor of TempHpButton.getTargetActors()) {
                    await this.applyDamage(actor, "temphp", dmg, -1);
                }
    
                setTimeout(() => {
                    if (canvas.hud.token._displayState && canvas.hud.token._displayState !== 0) {
                        canvas.hud.token.render();
                    }
                }, 50);
            });

        });

        Monkey.replaceMethod(BetterRollsChatCard, '_onHover', function(html) {            
            Monkey.callOriginalFunction(this, '_onHover', html);

            const controlled = canvas?.tokens.controlled.length > 0;
            html.find('.temp-hp-button').toggle(controlled);
        });
    }

    /**
	 * Retrieves all tokens currently selected on the canvas. This is the normal select,
	 * not the target select.
	 */
	static getTargetTokens({required=false}={}) {
		const character = game.user.character;
		const controlled = canvas.tokens.controlled;
		if (!controlled.length && character) {
			return [character];
		}

		const results = controlled.filter(a => a);
		if (required && !controlled.length) {
			ui.notifications.warn(game.i18n.localize("DND5E.ActionWarningNoToken"));
		}

		return results;
	}

	/**
	 * Returns all selected actors
	 * @param param1.required True if a warning should be shown if the list is empty
	 */
	static getTargetActors({required=false}={}) {
		return TempHpButton.getTargetTokens({required}).map(character => character.actor).filter(a => a);
	}

	static async bind(message, html) {
		log("bind" + BetterRollsChatCard);
    }

}
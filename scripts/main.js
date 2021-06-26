import TempHpButton from "./TempHpButton.js";
import TempHpDisplay from "./TempHpDisplay.js";

Hooks.once('setup', async function() {  
    TempHpDisplay.patchTokenDrawBar();
    TempHpButton.patchChatCard();
});

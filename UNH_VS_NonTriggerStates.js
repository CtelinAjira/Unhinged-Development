//=============================================================================
// Unhinged Development - VS Battle Grid System: Non-Trigger States
// UNH_VS_NonTriggerStates.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_VS_NonTriggerStates = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [EnchantAid]
 * @author Unhinged Developer
 * @base VisuMZ_2_BattleGridSystem
 * @orderAfter VisuMZ_2_BattleGridSystem
 *
 * @help
 * I've been bothered by the fact that there's apparently no way to make a 
 * levitating guy fly over a landmine within the VS suite.
 *
 * This is a response to that, allowing for states that make Node Triggers not 
 * take.
 * <No Trigger>   - Set battler with this state to not trip Node Triggers
 * <No Trigger:X> - See <No Trigger>, but with a condition (JS Eval)
 * <Always Trigger>   - Set skill to bypass <No Trigger> and <No Trigger:X>
 * <Always Trigger:X> - See <Always Trigger>, but with a condition (JS Eval)
 */
//=============================================================================

const UNH_VS_NonTriggerStates = {};
UNH_VS_NonTriggerStates.pluginName = 'UNH_VS_NonTriggerStates';

UNH_VS_NonTriggerStates.Battler_registerGridNodeTrigger = Game_Battler.prototype.registerGridNodeTrigger;
Game_Battler.prototype.registerGridNodeTrigger = function (triggerSkill) {
  const skill = triggerSkill;
  const user = this;
  const isTriggerproof = this.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    if (!obj.meta['No Trigger']) return false;
    return !!eval(obj.meta['No Trigger']);
  });
  if (!isTriggerproof) {
    UNH_VS_NonTriggerStates.Battler_registerGridNodeTrigger.call(this, triggerSkill);
  }
};
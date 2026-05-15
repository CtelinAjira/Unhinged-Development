//=============================================================================
// Unhinged Development - [Item Effect: Add State] Override
// UNH_ItemEffectAddStateOverride.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter UNH_MiscFunc
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [ItemEffectAddStateOverride]
 * @author Unhinged Developer
 *
 * @param BeforeCode
 * @text Extra Pre-Exec Code
 * @desc Runs before running action.itemEffectAddState()
 * Variables: action, target, effect
 * @type note
 * @default ""
 *
 * @param AfterCode
 * @text Extra Post-Exec Code
 * @desc Runs after running action.itemEffectAddState()
 * Variables: action, target, effect
 * @type note
 * @default ""
 *
 * @help
 * ============================================================================
 * Overridden Functions
 * ============================================================================
 * 
 * Game_Action.prototype.itemEffectAddState()
 * - overridden to be defined by plugin parameters above
 */
//=============================================================================

const UNH_ItemEffectAddStateOverride = {};
UNH_ItemEffectAddStateOverride.pluginName = 'UNH_ItemEffectAddStateOverride';
UNH_ItemEffectAddStateOverride.parameters = PluginManager.parameters(UNH_ItemEffectAddStateOverride.pluginName);
UNH_ItemEffectAddStateOverride.BeforeCode = String(UNH_ItemEffectAddStateOverride.parameters['BeforeCode'] || "");
UNH_ItemEffectAddStateOverride.BeforeFunc = new Function('action', 'target', 'effect', UNH_ItemEffectAddStateOverride.BeforeCode + '\nreturn false;');
UNH_ItemEffectAddStateOverride.AfterCode = String(UNH_ItemEffectAddStateOverride.parameters['AfterCode'] || "");
UNH_ItemEffectAddStateOverride.AfterFunc = new Function('action', 'target', 'effect', UNH_ItemEffectAddStateOverride.AfterCode + '\nreturn false;');

UNH_ItemEffectAddStateOverride.Action_itemEffectAddState = Game_Action.prototype.itemEffectAddState;
Game_Action.prototype.itemEffectAddState = function(target, effect) {
  let isKill = false;
  if (UNH_ItemEffectAddStateOverride.BeforeCode) {
    isKill = isUNH_ItemEffectAddStateOverride.BeforeFunc(this, target, effect);
  }
  if (!isKill) {
    UNH_ItemEffectAddStateOverride.Action_itemEffectAddState.call(this, target, effect);
  }
  if (UNH_ItemEffectAddStateOverride.AfterCode) {
    isUNH_ItemEffectAddStateOverride.AfterFunc(this, target, effect);
  }
};
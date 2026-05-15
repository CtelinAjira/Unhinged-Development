//=============================================================================
// Unhinged Development - [Aply Item User Effect] Override
// UNH_ApplyItemUserEffectOverride.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter UNH_MiscFunc
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [ApplyItemUserEffectOverride]
 * @author Unhinged Developer
 *
 * @param BeforeCode
 * @text Extra Pre-Exec Code
 * @desc Runs before running action.applyItemUserEffect()
 * Variables: action, target, effect
 * @type note
 * @default ""
 *
 * @param AfterCode
 * @text Extra Post-Exec Code
 * @desc Runs after running action.applyItemUserEffect()
 * Variables: action, target, effect
 * @type note
 * @default ""
 *
 * @help
 * ============================================================================
 * Overridden Functions
 * ============================================================================
 * 
 * Game_Action.prototype.applyItemUserEffect()
 * - overridden to be defined by plugin parameters above
 */
//=============================================================================

const UNH_ApplyItemUserEffectOverride = {};
UNH_ApplyItemUserEffectOverride.pluginName = 'UNH_ApplyItemUserEffectOverride';
UNH_ApplyItemUserEffectOverride.parameters = PluginManager.parameters(UNH_ApplyItemUserEffectOverride.pluginName);
UNH_ApplyItemUserEffectOverride.BeforeCode = String(UNH_ApplyItemUserEffectOverride.parameters['BeforeCode'] || "");
UNH_ApplyItemUserEffectOverride.BeforeFunc = new Function('action', 'target', 'effect', UNH_ApplyItemUserEffectOverride.BeforeCode + '\nreturn false;');
UNH_ApplyItemUserEffectOverride.AfterCode = String(UNH_ApplyItemUserEffectOverride.parameters['AfterCode'] || "");
UNH_ApplyItemUserEffectOverride.AfterFunc = new Function('action', 'target', 'effect', UNH_ApplyItemUserEffectOverride.AfterCode + '\nreturn false;');

UNH_ApplyItemUserEffectOverride.Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
Game_Action.prototype.applyItemUserEffect = function(target) {
  let isKill = false;
  if (UNH_ApplyItemUserEffectOverride.BeforeCode) {
    isKill = isUNH_ApplyItemUserEffectOverride.BeforeFunc(this, target);
  }
  if (!isKill) {
    UNH_ApplyItemUserEffectOverride.Action_applyItemUserEffect.call(this, target, effect);
  }
  if (UNH_ApplyItemUserEffectOverride.AfterCode) {
    isUNH_ApplyItemUserEffectOverride.AfterFunc(this, target, effect);
  }
};
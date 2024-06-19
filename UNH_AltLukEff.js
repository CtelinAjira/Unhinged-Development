//=============================================================================
// Unhinged Development - Alternate Luck Effect
// UNH_AltLukEff.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [AltLukEff]
 * @author Unhinged Developer
 *
 * @param LukEffect
 * @text LUK Effect
 * @desc The new code when lukEffectRate is called
 * @type note
 * @default "const user = this.subject();\nconst lukDiff = user.luk - target.luk;\n\nreturn Math.max(1.0 + (lukDiff * 0.001), 0.0);"
 *
 * @help
 */
//=============================================================================

const UNH_AltLukEff = {};
UNH_AltLukEff.pluginName = 'UNH_AltLukEff';
UNH_AltLukEff.parameters = PluginManager.parameters(UNH_AltLukEff.pluginName);
UNH_AltLukEff.LukEffect = String(UNH_AltLukEff.parameters['LukEffect']);

UNH_AltLukEff.Action_lukEffectRate = Game_Action.prototype.lukEffectRate;
Game_Action.prototype.lukEffectRate = function(target) {
  if (UNH_AltLukEff.LukEffect === '') {
    return UNH_AltLukEff.Action_lukEffectRate.call(this);
  }
  eval(UNH_AltLukEff.LukEffect);
};
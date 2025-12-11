//=============================================================================
// Unhinged Development - Alternate Luck Effect
// UNH_AltLukEff.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.01] [Unhinged] [AltLukEff]
 * @author Unhinged Developer
 *
 * @param LukEffect
 * @text LUK Effect
 * @desc The new code when lukEffectRate is called
 * Must include a return statement
 * @type note
 * @default "return (1 + ((user.luk - target.luk) * 0.001));"
 *
 * @help
 */
//=============================================================================

const UNH_AltLukEff = {};
UNH_AltLukEff.pluginName = 'UNH_AltLukEff';
UNH_AltLukEff.parameters = PluginManager.parameters(UNH_AltLukEff.pluginName);
UNH_AltLukEff.LukEffect = String(UNH_AltLukEff.parameters['LukEffect'] || '');
if (!UNH_AltLukEff.LukEffect) {
  UNH_AltLukEff.LukEval = function() {
    return 1;
  };
} else {
  UNH_AltLukEff.LukEval = new Function('action', 'user', 'target', '' + UNH_AltLukEff.LukEffect);
}

UNH_AltLukEff.Action_lukEffectRate = Game_Action.prototype.lukEffectRate;
Game_Action.prototype.lukEffectRate = function(target) {
  if (UNH_AltLukEff.LukEffect === '') {
    return UNH_AltLukEff.Action_lukEffectRate.call(this);
  }
  if (!UNH_AltLukEff.LukEffect.includes('return ') {
    return UNH_AltLukEff.Action_lukEffectRate.call(this);
  }
  return Math.max(UNH_AltLukEff.LukEval(this, this.subject(), target), 0);
};
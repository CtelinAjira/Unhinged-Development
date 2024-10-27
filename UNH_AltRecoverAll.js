//=============================================================================
// Unhinged Development - Alternate Recover All
// UNH_AltRecoverAll.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter VisuMZ_0_CoreEngine
 * @orderAfter UNH_RecoveryElements
 * @plugindesc [RPG Maker MZ] [Version 1.01] [Unhinged] [AltRecoverAll]
 * @author Unhinged Developer
 *
 * @param RecoverExtraCode
 * @text Extra recoverAll Code
 * @desc Any extra code you wish to run in recoverAll
 * @type note
 * @default ""
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Now you can add onto the recoverAll function without changing the core script!!
 */
//=============================================================================

const UNH_AltRecoverAll = {};
UNH_AltRecoverAll.pluginName = 'UNH_AltRecoverAll';
UNH_AltRecoverAll.parameters = PluginManager.parameters(UNH_AltRecoverAll.pluginName);
UNH_AltRecoverAll.RecoverExtraCode = String(UNH_AltRecoverAll.parameters['RecoverExtraCode'] || 'return');

UNH_AltRecoverAll.BattlerBase_recoverAll = Game_BattlerBase.prototype.recoverAll;
Game_BattlerBase.prototype.recoverAll = function() {
  const target = this;
  eval(UNH_AltRecoverAll.RecoverExtraCode);
  UNH_AltRecoverAll.BattlerBase_recoverAll.call(this);
};
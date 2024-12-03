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
 * @param RecoverBeforeCode
 * @text Run Before recoverAll
 * @desc Any code you wish to run before recoverAll
 * @type note
 * @default ""
 *
 * @param RecoverAfterCode
 * @text Run After recoverAll
 * @desc Any  code you wish to run after recoverAll
 * @type note
 * @default ""
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Now you can add onto the recoverAll function without changing the core 
 * script!!
 */
//=============================================================================

const UNH_AltRecoverAll = {};
UNH_AltRecoverAll.pluginName = 'UNH_AltRecoverAll';
UNH_AltRecoverAll.parameters = PluginManager.parameters(UNH_AltRecoverAll.pluginName);
UNH_AltRecoverAll.RecoverBeforeCode = String(UNH_AltRecoverAll.parameters['RecoverBeforeCode'] || '');
UNH_AltRecoverAll.RecoverAfterCode = String(UNH_AltRecoverAll.parameters['RecoverAfterCode'] || '');

UNH_AltRecoverAll.BattlerBase_recoverAll = Game_BattlerBase.prototype.recoverAll;
Game_BattlerBase.prototype.recoverAll = function() {
  const target = this;
  if (!!UNH_AltRecoverAll.RecoverBeforeCode) {
    try {
      eval(UNH_AltRecoverAll.RecoverBeforeCode);
    } catch (e) {
      console.log(e);
    }
  }
  UNH_AltRecoverAll.BattlerBase_recoverAll.call(this);
  if (!!UNH_AltRecoverAll.RecoverAfterCode) {
    try {
      eval(UNH_AltRecoverAll.RecoverAfterCode);
    } catch (e) {
      console.log(e);
    }
  }
};
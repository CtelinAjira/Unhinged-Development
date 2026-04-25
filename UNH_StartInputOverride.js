//=============================================================================
// Unhinged Development - Start Input Override
// UNH_StartInputOverride.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter VisuMZ_1_BattleCore
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [StartInputOverride]
 * @author Unhinged Developer
 *
 * @param StartInputUnitBeforeCode
 * @text Extra Pre-Exec Code (Unit)
 * @desc Runs before running BattleManager.startInput()
 * @type note
 * @default ""
 *
 * @param StartInputBattlerBeforeCode
 * @text Extra Pre-Exec Code (Battler)
 * @desc Runs before running BattleManager.startInput()
 * Variables: user
 * @type note
 * @default ""
 *
 * @param StartInputUnitAfterCode
 * @text Extra Post-Exec Code (Unit)
 * @desc Runs after running BattleManager.startInput()
 * @type note
 * @default ""
 *
 * @param StartInputBattlerAfterCode
 * @text Extra Post-Exec Code (Battler)
 * @desc Runs after running BattleManager.startInput()
 * Variables: user
 * @type note
 * @default ""
 *
 * @help
 * ============================================================================
 * Overridden Functions
 * ============================================================================
 * 
 * BattleManager.startInput()
 * - overridden to be defined by plugin parameters above
 * - now takes parameter "original" to determine if new functionality should be 
 *   used (false) or ignored (true)
 */
//=============================================================================

const UNH_StartInputOverride = {};
UNH_StartInputOverride.pluginName = 'UNH_StartInputOverride';
UNH_StartInputOverride.parameters = PluginManager.parameters(UNH_StartInputOverride.pluginName);
UNH_StartInputOverride.StartInputUnitBeforeCode = String(UNH_StartInputOverride.parameters['StartInputUnitBeforeCode'] || "");
UNH_StartInputOverride.StartInputUnitBeforeFunc = new Function(UNH_StartInputOverride.StartInputUnitBeforeCode);
UNH_StartInputOverride.StartInputBattlerBeforeCode = String(UNH_StartInputOverride.parameters['StartInputBattlerBeforeCode'] || "");
UNH_StartInputOverride.StartInputBattlerBeforeFunc = new Function("user", UNH_StartInputOverride.StartInputBattlerBeforeCode);
UNH_StartInputOverride.StartInputUnitAfterCode = String(UNH_StartInputOverride.parameters['StartInputUnitAfterCode'] || "");
UNH_StartInputOverride.StartInputUnitAfterFunc = new Function(UNH_StartInputOverride.StartInputUnitAfterCode);
UNH_StartInputOverride.StartInputBattlerAfterCode = String(UNH_StartInputOverride.parameters['StartInputBattlerAfterCode'] || "");
UNH_StartInputOverride.StartInputBattlerAfterFunc = new Function("user", UNH_StartInputOverride.StartInputBattlerAfterCode);

UNH_StartInputOverride.BattleManager_startInput = BattleManager.startInput;
BattleManager.startInput = function(original) {
  if (!original) {
    if (!!UNH_StartInputOverride.StartInputUnitBeforeCode) {
      UNH_StartInputOverride.StartInputUnitBeforeFunc();
    }
    if (!!UNH_StartInputOverride.StartInputBattlerBeforeCode) {
      for (const member of $gameParty.members()) {
        UNH_StartInputOverride.StartInputBattlerBeforeFunc(member);
      }
    }
    if (!!UNH_StartInputOverride.StartInputBattlerBeforeCode) {
      for (const member of $gameTroop.members()) {
        UNH_StartInputOverride.StartInputBattlerBeforeFunc(member);
      }
    }
  }
  UNH_StartInputOverride.BattleManager_startInput.call(this);
  if (!original) {
    if (!!UNH_StartInputOverride.StartInputBattlerAfterCode) {
      UNH_StartInputOverride.StartInputUnitAfterFunc();
    }
    if (!!UNH_StartInputOverride.StartInputBattlerAfterCode) {
      for (const member of $gameParty.members()) {
        UNH_StartInputOverride.StartInputBattlerAfterFunc(member);
      }
    }
    if (!!UNH_StartInputOverride.StartInputBattlerAfterCode) {
      for (const member of $gameTroop.members()) {
        UNH_StartInputOverride.StartInputBattlerAfterFunc(member);
      }
    }
  }
};
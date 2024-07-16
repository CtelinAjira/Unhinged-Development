//=============================================================================
// Unhinged Development - Flee Switch
// UNH_FleeSwitch.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter VisuMZ_0_CoreEngine
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [FleeSwitch]
 * @author Unhinged Developer
 *
 * @param FleeSwitchID
 * @text Flee Switch
 * @desc If this switch is on, guarantee fleeing.
 * @type switch
 * @default 0
 *
 * @help
 */
//=============================================================================

const UNH_FleeSwitch = {};
UNH_FleeSwitch.pluginName = 'UNH_FleeSwitch';
UNH_FleeSwitch.parameters = PluginManager.parameters(UNH_FleeSwitch.pluginName);
UNH_FleeSwitch.FleeSwitchID = Number(UNH_FleeSwitch.parameters['FleeSwitchID'] || 0);

UNH_FleeSwitch.processEscape = BattleManager.processEscape;
BattleManager.processEscape = function() {
  if (UNH_FleeSwitch.FleeSwitchID <= 0) {
    return UNH_FleeSwitch.processEscape.call(this);
  }
  if ($gameSwitches.value(UNH_FleeSwitch.FleeSwitchID)) {
    this._escapeRatio = 1;
  }
  return UNH_FleeSwitch.processEscape.call(this);
};

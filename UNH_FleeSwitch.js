//=============================================================================
// Unhinged Development - Flee Switch
// UNH_FleeSwitch.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter VisuMZ_0_CoreEngine
 * @orderAfter VisuMZ_1_BattleCore
 * @orderAfter VisuMZ_1_MessageCore
 * @orderAfter VisuMZ_2_AniMsgTextEffects
 * @orderAfter VisuMZ_2_DragonbonesUnion
 * @orderAfter VisuMZ_3_MessageKeywords
 * @orderAfter VisuMZ_3_MsgLetterSounds
 * @orderAfter VisuMZ_3_StateTooltips
 * @orderAfter VisuMZ_3_VisualGoldDisplay
 * @plugindesc [RPG Maker MZ] [Version 1.01] [Unhinged] [FleeSwitch]
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

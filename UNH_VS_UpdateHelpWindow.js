//=============================================================================
// Unhinged Development - VS Skill Learn System: Update Help Window
// UNH_VS_UpdateHelpWindow.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [VS_UpdateHelpWindow]
 * @author Unhinged Developer
 * @base VisuMZ_2_SkillLearnSystem
 * @orderAfter VisuMZ_2_SkillLearnSystem
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Skill Description Window updates when you change its description.
 */
//=============================================================================

const UNH_VS_UpdateHelpWindow = {};
UNH_VS_UpdateHelpWindow.pluginName = 'UNH_VS_UpdateHelpWindow';

UNH_VS_UpdateHelpWindow.onSkillLearnConfirmOk = Scene_Skill.prototype.onSkillLearnConfirmOk;
Scene_Skill.prototype.onSkillLearnConfirmOk = function () {
  UNH_VS_UpdateHelpWindow.onSkillLearnConfirmOk.call(this);
  this._helpWindow.refresh();
};
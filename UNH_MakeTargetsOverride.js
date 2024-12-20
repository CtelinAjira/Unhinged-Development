//=============================================================================
// Unhinged Development - Make Targets Override
// UNH_MakeTargetsOverride.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter VisuMZ_1_BattleCore
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [MakeTargetsOverride]
 * @author Unhinged Developer
 *
 * @param MakeTargetsCode
 * @text Extra Code
 * @desc Runs after storing action.makeTargets()
 * @type note
 * @default ""
 *
 * @help
 * ============================================================================
 * Overridden Functions
 * ============================================================================
 * 
 * unit.makeTargets()
 * - overridden to be defined by plugin parameters above
 *   - action: the action makeTargets() is being called for
 *   - item: the database object for action
 *   - user: action's user
 *   - targets: action's target array
 * - now takes parameter "original" to determine if new functionality should be 
 *   used (false) or ignored (true)
 */
//=============================================================================

const UNH_MakeTargetsOverride = {};
UNH_MakeTargetsOverride.pluginName = 'UNH_MakeTargetsOverride';
UNH_MakeTargetsOverride.parameters = PluginManager.parameters(UNH_MakeTargetsOverride.pluginName);
UNH_MakeTargetsOverride.MakeTargetsCode = String(UNH_MakeTargetsOverride.parameters['MakeTargetsCode'] || "");

UNH_MakeTargetsOverride.Action_makeTargets = Game_Action.prototype.makeTargets;
Game_Action.prototype.makeTargets = function(original = false) {
  const targets = UNH_MakeTargetsOverride.Action_makeTargets.call(this);
  const action = this;
  const item = this.item();
  const user = this.subject();
  if (!original) {
    if (!!UNH_MakeTargetsOverride.MakeTargetsCode) {
      try {
        eval(UNH_MakeTargetsOverride.MakeTargetsCode)
      } catch (e) {
        console.log('Error found in new code for action.makeTargets()\nExtra code silenced for the sake of runtime');
      }
    }
  }
  return targets;
};
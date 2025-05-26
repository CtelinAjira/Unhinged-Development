//=============================================================================
// Unhinged Development - Custom Encounter Steps
// UNH_CustEncStep.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_CustEncStep = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.03] [Unhinged] [MiscFunc]
 * @author Unhinged Developer
 *
 * @param NewCode
 * @text New Encounter Step Code
 * @desc JS code for Game_Player.prototype.makeEncounterCount()
 * @type note
 * @default "const amp = Math.round($gameMap.encounterStep() / 2);\nconst v = Math.randomInt(2 * amp + 1) - amp;\nthis._encounterCount = $gameMap.encounterStep() + v;"
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * So apparently the encounter frequency is just fucked for no good reason.
 * 
 * Game_Player.prototype.makeEncounterCount = function() {
 *     const n = $gameMap.encounterStep();
 *     this._encounterCount = Math.randomInt(n) + Math.randomInt(n) + 1;
 * };
 * 
 * This is the function they use to calculate that.  It runs that at the start 
 * of every battle, so it can calculate the number of steps from there to the 
 * next battle.
 * 
 * And yes, this means you can ALWAYS have 1-step encounters no matter how many 
 * steps you set the average to.
 * 
 * If that bothers you, I've just given you a plugin that lets you alter that 
 * code yourself.  I've even included a default that isn't just two randomInt 
 * calls, so even plug-n-players don't have to deal with 1-step encounters.
 */
//=============================================================================

const UNH_CustEncStep = {};
UNH_CustEncStep.pluginName = 'UNH_CustEncStep';
UNH_CustEncStep.parameters = PluginManager.parameters(UNH_CustEncStep.pluginName);
UNH_CustEncStep.NewCode = String(UNH_CustEncStep.parameters['NewCode'] || "");
UNH_CustEncStep.NewEncStep = new Function(UNH_CustEncStep.NewCode);

UNH_CustEncStep.OldEncStep = Game_Player.prototype.makeEncounterCount;
Game_Player.prototype.makeEncounterCount = function() {
  if (!UNH_CustEncStep.NewCode) {
    UNH_CustEncStep.OldEncStep.call(this);
  } else {
    UNH_CustEncStep.NewEncStep.call(this);
  }
};
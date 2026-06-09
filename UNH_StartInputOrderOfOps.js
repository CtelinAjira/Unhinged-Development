//=============================================================================
// Unhinged Development - Start Input: Order of Operations
// UNH_StartInputOrderOfOps.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderBefore UNH_MiscFunc
 * @orderBefore VisuMZ_0_CoreEngine
 * @orderBefore UNH_StartInputOverride
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [StartInputOrderOfOps]
 * @author Unhinged Developer
 *
 * @param EnemiesFirst
 * @text Enemy Turn Lock
 * @desc When to lock in enemy turns relative to player turns
 * @type boolean
 * @on Before
 * @off After
 * @default false
 *
 * @help
 * ============================================================================
 * Overridden Functions
 * ============================================================================
 * 
 * BattleManager.startInput()
 * - overridden to account for the plugin parameters above
 */
//=============================================================================

const UNH_StartInputOrderOfOps = {};
UNH_StartInputOrderOfOps.pluginName = 'UNH_StartInputOrderOfOps';
UNH_StartInputOrderOfOps.parameters = PluginManager.parameters(UNH_StartInputOrderOfOps.pluginName);
UNH_StartInputOrderOfOps.EnemiesFirst = !!UNH_StartInputOrderOfOps.parameters['EnemiesFirst'];

if (UNH_StartInputOrderOfOps.EnemiesFirst) {
  BattleManager.startInput = function() {
    this._phase = "input";
    this._inputting = true;
    $gameTroop.makeActions();
    $gameParty.makeActions();
    this._currentActor = null;
    if (this._surprise || !$gameParty.canInput()) {
        this.startTurn();
    }
  };
}
//=============================================================================
// Unhinged Development - Map Regen Overwrite
// UNH_MapRegenOverwrite.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [MapRegenOverwrite]
 * @author Unhinged Developer
 *
 * @param NoStateDamage
 * @text Disable State Damage
 * @desc Disable damage from states?
 * @type boolean
 * @on "Turn It Off"
 * @off "Keep It On"
 * @default false
 *
 * @param NoTileDamage
 * @text Disable Tile Damage
 * @desc Disable damage from map tiles?
 * @type boolean
 * @on "Turn It Off"
 * @off "Keep It On"
 * @default false
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Do you have any parallel events to process damage over time outside of 
 * combat?  Are the per-so-many-steps calculations messing with you?
 *
 * Let's turn them off!
 *
 * ============================================================================
 * Plugin Warning
 * ============================================================================
 *
 * This plugin alters "Game_Actor.prototype.onPlayerWalk", and doesn't give an 
 * alias.  As such, if you are using any other plugins that attempt to modify 
 * "Game_Actor.prototype.onPlayerWalk", put this plugin before ALL of them!
 */
//=============================================================================

const UNH_MapRegenOverwrite = {};
UNH_MapRegenOverwrite.pluginName = 'UNH_MapRegenOverwrite';
UNH_MapRegenOverwrite.parameters = PluginManager.parameters(UNH_MapRegenOverwrite.pluginName);
UNH_MapRegenOverwrite.NoStateDamage = !!UNH_MapRegenOverwrite.parameters['NoStateDamage'];
UNH_MapRegenOverwrite.NoTileDamage = !!UNH_MapRegenOverwrite.parameters['NoTileDamage'];

Game_Actor.prototype.onPlayerWalk = function() {
  if (!UNH_MapRegenOverwrite.NoTileDamage) {
    this.unhTileDamage();
  }
  if (!UNH_MapRegenOverwrite.NoStateDamage) {
    this.unhStateDamage();
  }
};

Game_Actor.prototype.unhTileDamage = function() {
  this.clearResult();
  this.checkFloorEffect();
};

Game_Actor.prototype.unhStateDamage = function() {
  if ($gamePlayer.isNormal()) {
    this.turnEndOnMap();
    for (const state of this.states()) {
      this.updateStateSteps(state);
    }
    this.showAddedStates();
    this.showRemovedStates();
  }
};
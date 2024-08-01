//=============================================================================
// Unhinged Development - Map Regen Overwrite
// UNH_MapRegenOverwrite.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [MapRegenOverwrite]
 * @author Unhinged Developer
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
 * This plugin alters "Game_Player.prototype.updateNonmoving" to exclude its 
 * normal $gameParty.onPlayerWalk() call, and doesn't give an alias.  As such, 
 * if you are using any other plugins that attempt to modify 
 * "Game_Player.prototype.updateNonmoving", put this plugin before ALL of them!
 */
//=============================================================================

const UNH_MapRegenOverwrite = {};
UNH_MapRegenOverwrite.pluginName = 'UNH_MapRegenOverwrite';

Game_Player.prototype.updateNonmoving = function(wasMoving, sceneActive) {
  if (!$gameMap.isEventRunning()) {
    if (wasMoving) {
      this.checkEventTriggerHere([1, 2]);
      if ($gameMap.setupStartingEvent()) {
        return;
      }
    }
    if (sceneActive && this.triggerAction()) {
      return;
    }
    if (wasMoving) {
      this.updateEncounterCount();
    } else {
      $gameTemp.clearDestination();
    }
  }
};
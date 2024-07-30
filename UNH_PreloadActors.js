//=============================================================================
// Unhinged Development - Preload Actors
// UNH_PreloadActors.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [PreloadActors]
 * @author Unhinged Developer
 *
 * @help
 * Loads all actors into the game as part of selecting 'New Game'
 * It's plug-and-play!
 */
//=============================================================================

const UNH_PreloadActors = {};
UNH_PreloadActors.pluginName = 'UNH_PreloadActors';

Game_Actors.prototype.data = function() {
  let temp = null;
  for (let i = 1; i < $dataActors.length; i++) {
    temp = $gameActors.actor(i);
  }
  return this._data;
};

UNH_PreloadActors.Party_setupStartingMembers = Game_Party.prototype.setupStartingMembers;
Game_Party.prototype.setupStartingMembers = function() {
  let temp = null;
  for (let i = 1; i < $dataActors.length; i++) {
    temp = $gameActors.actor(i);
  }
  UNH_PreloadActors.Party_setupStartingMembers.call(this);
};

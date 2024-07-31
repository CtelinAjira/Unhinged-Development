//=============================================================================
// Unhinged Development - Preload Actors
// UNH_PreloadActors.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.01] [Unhinged] [PreloadActors]
 * @author Unhinged Developer
 *
 * @help
 * Loads all actors into the game as part of selecting 'New Game'
 * It's plug-and-play!
 */
//=============================================================================

const UNH_PreloadActors = {};
UNH_PreloadActors.pluginName = 'UNH_PreloadActors';

Game_Actors.prototype.initActors = function() {
  if (this._data === undefined) {
    this._data = [];
  } else if (!Array.isArray(this._data)) {
    this._data = [];
  }
  if (this._data.length <= 0) {
    for (let i = 0; i < $dataActors.length; i++) {
      if ($dataActors[i]) {
        if (!this._data[i]) {
          this._data[i] = new Game_Actor(i);
        }
      }
    }
  }
};

UNH_PreloadActors.Actors_actor = Game_Actors.prototype.actor;
Game_Actors.prototype.actor = function(actorId) {
  this.initActors();
  return UNH_PreloadActors.Actors_actor.call(this, actorId);
};

Game_Actors.prototype.data = function() {
  this.initActors();
  return this._data;
};

UNH_PreloadActors.Party_setupStartingMembers = Game_Party.prototype.setupStartingMembers;
Game_Party.prototype.setupStartingMembers = function() {
  $gameActors.initActors();
  UNH_PreloadActors.Party_setupStartingMembers.call(this);
};

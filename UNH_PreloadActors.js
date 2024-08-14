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
 * @param initOnBoot
 * @text Initialize On Boot
 * @desc Should all actors be instantiated when starting a new game?
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @param initOnActor
 * @text Initialize On Actor Call
 * @desc Should all actors be instantiated when calling $gameActors.actor()?
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Doing anything weird with your actors that requires them to be called in 
 * someone else's damage formula?  Calling an actor in another actor's 
 * notetags?
 *
 * If so, you may or may not have experienced the most subtle of lagspikes, 
 * because RPG Maker doesn't instantiate actors until their functions and 
 * parameters are required.  This plugin lets you bypass that lagspike by 
 * giving a little control over *when* actors are instantiated.
 *
 * Additionally, I've included a few functions for control over the array 
 * containing those actor instances ($gameActors._data)
 * 
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * $gameActors.initActors();
 * - Instantiates all actors
 *   - you may optionally pass in a database ID from the Actors tab, to just 
 *     instantiate that one actor
 *
 * $gameActors.data();
 * - Returns an array containing an instance for each actor in you database
 *
 * $gameActors.clear();
 * - Clears all actors from memory
 *
 * $gameActors.resetData();
 * - Clears all actors from memory, then instantiates ALL of them fresh
 */
//=============================================================================

const UNH_PreloadActors = {};
UNH_PreloadActors.pluginName = 'UNH_PreloadActors';
UNH_PreloadActors.parameters = PluginManager.parameters(UNH_PreloadActors.pluginName);
UNH_PreloadActors.initOnBoot = !!UNH_PreloadActors.parameters['initOnBoot'];
UNH_PreloadActors.initOnActor = !!UNH_PreloadActors.parameters['initOnActor'];

Game_Actors.prototype.initActors = function(actorId) {
  if (typeof actorId !== 'number') actorId = 0;
  if (this._data === undefined) {
    this.clear();
  } else if (!Array.isArray(this._data)) {
    this.clear();
  }
  if (!!$dataActors[actorId]) {
    if (!this._data[actorId]) {
      this._data[actorId] = new Game_Actor(actorId);
    }
  } else {
    for (const obj of $dataActors) {
      if (!obj) continue;
      if (typeof obj !== 'object') continue;
      let id = obj.id;
      if (!!this._data[id]) continue;
      this._data[id] = new Game_Actor(id);
    }
  }
};

Game_Actors.prototype.clear = function() {
  this._data = [];
};

Game_Actors.prototype.resetData = function() {
  this.clear();
  this.initActors(0);
};

Game_Actors.prototype.data = function() {
  if (!!UNH_PreloadActors.initOnActor) {
    this.initActors(0);
    return this._data;
  } else {
    let tempData = [];
    for (const obj of $dataActors) {
      if (!obj) continue;
      if (typeof obj !== 'object') continue;
      let id = obj.id;
      if (!!this._data[id]) {
        tempData[id] = this._data[id];
      } else {
        tempData[id] = new Game_Actor(id);
      }
    }
	return tempData;
  }
};

if (!!UNH_PreloadActors.initOnActor) {
  UNH_PreloadActors.DataManager_createGameObjects = DataManager.createGameObjects;
  DataManager.createGameObjects = function() {
    UNH_PreloadActors.DataManager_createGameObjects.call(this);
    $gameActors.initActors(0);
  };
}

if (!!UNH_PreloadActors.initOnActor) {
  UNH_PreloadActors.Actors_actor = Game_Actors.prototype.actor;
  Game_Actors.prototype.actor = function(actorId) {
    this.initActors(0);
    return UNH_PreloadActors.Actors_actor.call(this, actorId);
  };
}

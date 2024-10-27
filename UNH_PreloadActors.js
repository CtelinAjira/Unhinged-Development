//=============================================================================
// Unhinged Development - Preload Actors
// UNH_PreloadActors.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.03] [Unhinged] [PreloadActors]
 * @author Unhinged Developer
 *
 * @param PostInit
 * @text Post-Initialization Code
 * @desc JS Code to call after instantiating actors
 * @type note
 * @default "//variables:\n//actor - the current actor\n//actorId - the id of the current actor"
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
 * instantiating them all on a new game.
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
UNH_PreloadActors.PostInit = String(UNH_PreloadActors.parameters['PostInit'] || "");
UNH_PreloadActors.isParsing = true;

UNH_PreloadActors.codeParse = function(code) {
  if (typeof code !== 'string') return [];
  return code.split('\n');
};

UNH_PreloadActors.runPostInit = function(actorId) {
  if (typeof actorId !== 'number') return;
  if (actorId === 0) return;
  if (actorId > $dataActors.length) return;
  if (!UNH_PreloadActors.PostInit) return;
  if (UNH_PreloadActors.codeParse(UNH_PreloadActors.PostInit).length <= 0) return;
  if (!$gameActors._data[actorId]) $gameActors._data[id] = new Game_Actor(id);
  const actor = $gameActors._data[actorId];
  eval(UNH_PreloadActors.PostInit);
};

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
      UNH_PreloadActors.runPostInit(actorId);
    }
  } else {
    for (const obj of $dataActors) {
      if (!obj) continue;
      if (typeof obj !== 'object') continue;
      let id = obj.id;
      if (!!this._data[id]) continue;
      this._data[id] = new Game_Actor(id);
      UNH_PreloadActors.runPostInit(id);
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
  this.initActors(0);
  return this._data;
};

UNH_PreloadActors.Actors_actor = Game_Actors.prototype.actor;
Game_Actors.prototype.actor = function(actorId) {
  this.initActors(0);
  return UNH_PreloadActors.Actors_actor.call(this, actorId);
};
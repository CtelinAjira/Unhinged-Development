//=============================================================================
// Unhinged Development - Preload Actors
// UNH_PreloadActors.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.04] [Unhinged] [PreloadActors]
 * @author Unhinged Developer
 *
 * @param PostInit
 * @text Post-Initialization Code
 * @desc JS Code to call after instantiating actors
 * Variables: actor, actorId
 * @type note
 * @default ""
 *
 * @command Add_With_Scaling
 * @text Add With Scaling
 * @desc Sets target party member to the chosen level, then adds them to the party
 * 
 * @arg ActorId
 * @text New Member
 * @desc New actor to be added to the party
 * @type actor
 * @default 0
 * 
 * @arg ScaleType
 * @text Scaling Type
 * @desc How to calculate level scaling
 * @type select
 * @option Eval
 * @value eval level
 * @option Party Maximum
 * @value max level
 * @option Party Average
 * @value avg level
 * @option Party Minimum
 * @value min level
 * @option Leader's Level
 * @value lead level
 * @option No Scaling
 * @value cur level
 * @default eval level
 * 
 * @arg TgLevel
 * @text Target Level
 * @desc Variables: actor, maxLv, party, alive, dead, leader, tgLv
 * Returns: tgLv
 * @type note
 * @default "tgLv = actor.expForLevel(leader.level);\ntgLv = Math.max(tgLv, 1);\ntgLv = Math.min(tgLv, maxLv);"
 *
 * @command Add_With_Scaling_Eval
 * @text Add With Scaling (JS Eval)
 * @desc Sets target party member to the chosen level, then adds them to the party
 * 
 * @arg ActorId
 * @text Actor ID (JS Eval)
 * @desc Actor ID for member to be added
 * See Actors tab in Database for valid values
 * @type string
 * @default 0
 * 
 * @arg ScaleType
 * @text Scaling Type
 * @desc How to calculate level scaling
 * @type select
 * @option Eval
 * @value eval level
 * @option Party Maximum
 * @value max level
 * @option Party Average
 * @value avg level
 * @option Party Minimum
 * @value min level
 * @option Leader's Level
 * @value lead level
 * @option No Scaling
 * @value cur level
 * @default eval level
 * 
 * @arg TgLevel
 * @text Target Level
 * @desc Variables: actor, maxLv, party, alive, dead, leader, tgLv
 * Returns: tgLv
 * @type note
 * @default "tgLv = actor.expForLevel(leader.level);\ntgLv = Math.max(tgLv, 1);\ntgLv = Math.min(tgLv, maxLv);"
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

PluginManager.registerCommand(UNH_PreloadActors.pluginName, "Add_With_Scaling", params => {
  if (!params.ActorId) {
    return;
  }
  UNH_PreloadActors.addWithScaling(params);
});

PluginManager.registerCommand(UNH_PreloadActors.pluginName, "Add_With_Scaling_Eval", params => {
  if (!params.ActorId) {
    return;
  }
  params.ActorId = eval(params.ActorId);
  UNH_PreloadActors.addWithScaling(params);
});

UNH_PreloadActors.addWithScaling = function(params) {
  if (typeof params.ActorId !== 'number') {
    return;
  }
  if (isNaN(params.ActorId)) {
    return;
  }
  if (params.ActorId < 1) {
    return;
  }
  if (params.ActorId >= $dataActors.length) {
    return;
  }
  const actorId = params.ActorId;
  let scaleType = String(params.ScaleType).toLowerCase();
  if (scaleType === 'cur level') {
  } else if (scaleType === 'max level') {
    const tgLv = $gameParty.members().reduce(function(r, member) {
      if (!member) return r;
      return Math.max(r, member.level);
    }, 0);
    if (tgLv !== actor.level) {
      actor.changeLevel(tgLv, false);
    }
  } else if (scaleType === 'avg level') {
    const tgLv = $gameParty.members().reduce(function(r, member) {
      if (!member) return r;
      return Math.max(r, member.level);
    }, 0);
    if (tgLv !== actor.level) {
      actor.changeLevel(Math.round(tgLv / Math.max($gameParty.size(), 1)), false);
    }
  } else if (scaleType === 'min level') {
    const tgLv = $gameParty.members().reduce(function(r, member) {
      if (!member) return r;
      return Math.min(r, member.level);
    }, actor.maxLevel());
    if (tgLv !== actor.level) {
      actor.changeLevel(tgLv, false);
    }
  } else if (scaleType === 'lead level') {
    const tgLv = $gameParty.leader().level;
    if (tgLv !== actor.level) {
      actor.changeLevel(tgLv, false);
    }
  } else {
    if (!!params.TgLevel) {
      try {
        const actor = $gameActors.actor(actorId);
        const maxLv = actor.maxLevel();
        const party = $gameParty.members();
        const alive = $gameParty.aliveMembers();
        const dead = $gameParty.deadMembers();
        const leader = $gameParty.leader();
        let tgLv = 0;
        eval(params.TgLevel);
        if (!isNaN(tgLv)) {
          if (tgLv > 0 && tgLv < maxLv) {
            if (tgLv !== actor.level) {
              actor.changeLevel(tgLv, false);
            }
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
  $gameParty.addActor(actorId);
};

UNH_PreloadActors.codeParse = function(code) {
  if (typeof code !== 'string') return [];
  return code.split('\n');
};

UNH_PreloadActors.runPostInit = function(actorId) {
  if (typeof actorId !== 'number') return;
  if (isNaN(actorId)) return;
  if (actorId <= 0) return;
  if (actorId >= $dataActors.length) return;
  if (!UNH_PreloadActors.PostInit) return;
  if (UNH_PreloadActors.codeParse(UNH_PreloadActors.PostInit).length <= 0) return;
  if (!$gameActors._data[actorId]) $gameActors._data[id] = new Game_Actor(id);
  const actor = $gameActors._data[actorId];
  const postInit = new Function('actor', 'actorId', UNH_PreloadActors.PostInit);
  try {
    postInit(actor, actorId);
  } catch (e) {
    return;
  }
};

Game_Actors.prototype.initActors = function(actorId) {
  if (typeof actorId !== 'number') actorId = 0;
  if (isNaN(actorId)) actorId = 0;
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
  this.initActors();
};

Game_Actors.prototype.data = function(actorId) {
  this.initActors(actorId);
  if (actorId === undefined) actorId = 0;
  if (typeof actorId !== 'number') actorId = 0;
  if (isNaN(actorId)) actorId = 0;
  if (actorId <= 0) return this._data;
  if (actorId >= $dataActors.length) return this._data;
  return this._data[actorId];
};

UNH_PreloadActors.Actors_actor = Game_Actors.prototype.actor;
Game_Actors.prototype.actor = function(actorId) {
  this.initActors();
  return UNH_PreloadActors.Actors_actor.call(this, actorId);
};
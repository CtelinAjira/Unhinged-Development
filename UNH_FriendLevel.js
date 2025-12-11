//=============================================================================
// Unhinged Development - Friendship Levels
// UNH_FriendLevel.js
//=============================================================================

var Imported = Imported || {};

/*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [FriendLevel]
 * @author Unhinged Developer
 *
 * @param MaxFriendshipLevel
 * @text Default Maximum Friendship Level
 * @type number
 * @default 25
 *
 * @param FriendshipExpToNext
 * @text Friendship EXP to Next Rank
 * @desc Variables: actor, curLv
 * Return Type: Number
 * @type string
 * @default 5 + curLv
 *
 * @command ModifyFriendshipExp
 * @text Modify Friendship EXP
 * @arg actorId
 * @text Actor
 * @type actor
 * @default 1
 * @arg operation
 * @text Operation
 * @type select
 * @option Assign
 * @value 0
 * @option Plus
 * @value 1
 * @option Minus
 * @value -1
 * @default 0
 * @arg value
 * @text Value
 * @type number
 * @min 0
 * @default 0
 *
 * @command ModifyFriendshipLevel
 * @text Modify Friendship Level
 * @arg actorId
 * @text Actor
 * @type actor
 * @default 1
 * @arg value
 * @text New Level
 * @type number
 * @min 0
 * @default 0
 *
 * @command StoreFriendshipLevel
 * @text Store Friendship Level
 * @arg actorId
 * @text Actor
 * @type actor
 * @default 1
 * @arg variableId
 * @text Variable
 * @type variable
 * @default 0
 *
 * @command FriendKnowledgeCheck
 * @text Knowledge Check on Friend
 * @arg actorId
 * @text Actor
 * @type actor
 * @default 1
 * @arg switchId
 * @text Switch
 * @type switch
 * @default 0
 * @arg numChecks
 * @text Number of Rolls
 * @type number
 * @min 1
 * @default 1
 * 
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Initial Friendship Level:X>
 * - Use for Actors
 *   - Set the actor's starting friendship level to X (Number)
 * <Maximum Friendship Level:X>
 * - Use for Actors
 *   - Set the actor's maximum friendship level to X (Number)
 */

const UNH_FriendLevel = {};
UNH_FriendLevel.pluginName = 'UNH_FriendLevel';
UNH_FriendLevel.parameters = PluginManager.parameters(UNH_FriendLevel.pluginName);
UNH_FriendLevel.MaxFriendshipLevel = Number(UNH_FriendLevel.parameters['MaxFriendshipLevel'] || 0);
UNH_FriendLevel.FETN_RetVal = String(UNH_FriendLevel.parameters['FriendshipExpToNext'] || "5 + curLv");
UNH_FriendLevel.FETN_Code = "  if (curLv < 0) {\n    return 0;\n  } else {  \n  let retVal = (" + UNH_FriendLevel.FETN_RetVal + ");\n  retVal *= (curLv + 1);\n  return retVal;\n  }";
UNH_FriendLevel.FriendshipExpToNext = new Function("actor", "curLv", "try {\n" + UNH_FriendLevel.FETN_Code + "\n} catch (e) {\n  return 0;\n}");

PluginManager.registerCommand(UNH_FriendLevel.pluginName, "ModifyFriendshipExp", function(args) {
  let actorId = 0;
  try {
    actorId = Number(args.actorId);
  } catch (e) {
    actorId = 0;
  }
  let operation = 0;
  try {
    operation = Number(args.operation);
  } catch (e) {
    operation = 0;
  }
  let value = 0;
  try {
    value = Number(args.value);
  } catch (e) {
    value = 0;
  }
  const actor = $gameActors.actor(actorId);
  if (!!actor) {
    if (operation > 0) {
      actor.unhAddFriendshipExp(value);
    } else if (operation < 0) {
      actor.unhAddFriendshipExp(-value);
    } else {
      actor.unhSetFriendshipExp(value);
    }
  }
});

PluginManager.registerCommand(UNH_FriendLevel.pluginName, "ModifyFriendshipLevel", function(args) {
  let actorId = 0;
  try {
    actorId = Number(args.actorId);
  } catch (e) {
    actorId = 0;
  }
  let value = 0;
  try {
    value = Number(args.value);
  } catch (e) {
    value = 0;
  }
  const actor = $gameActors.actor(actorId);
  if (!!actor) {
    value = Math.max(Math.min(value, actor.unhFriendshipMaxLevel()), 0);
    const expSet = actor.unhFriendshipExpToNext(value);
    actor.unhSetFriendshipExp(expSet);
  }
});

PluginManager.registerCommand(UNH_FriendLevel.pluginName, "StoreFriendshipLevel", function(args) {
  let actorId = 0;
  try {
    actorId = Number(args.actorId);
  } catch (e) {
    actorId = 0;
  }
  let variableId = 0;
  try {
    variableId = Number(args.variableId);
  } catch (e) {
    variableId = 0;
  }
  const actor = $gameActors.actor(actorId);
  if (!!actor) {
    $gameVariables.setValue(variableId, actor.unhGetFriendshipExp());
  }
});

PluginManager.registerCommand(UNH_FriendLevel.pluginName, "FriendKnowledgeCheck", function(args) {
  let actorId = 0;
  try {
    actorId = Number(args.actorId);
  } catch (e) {
    actorId = 0;
  }
  let switchId = 0;
  try {
    switchId = Number(args.switchId);
  } catch (e) {
    switchId = 0;
  }
  let numChecks = 1;
  try {
    numChecks = Number(args.numChecks);
  } catch (e) {
    numChecks = 1;
  }
  const actor = $gameActors.actor(actorId);
  if (!!actor) {
    $gameSwitches.setValue(switchId, actor.unhFriendKnowledgeCheck(numChecks));
  }
});

Object.defineProperty(Game_Actor.prototype, "aff", {
    get: function() {
        return this.unhGetFriendshipLevel();
    },
    configurable: true
});

Game_Actor.prototype.unhFriendshipMaxLevel = function() {
  if (!this._unhMaxFriendLevel) {
    if (this.actor()) {
      const meta = this.actor().meta;
      if (meta) {
        const friendMaxLv = meta['Maximum Friendship Level'];
        if (!isNaN(friendMaxLv)) {
          this._unhMaxFriendLevel = Number(friendMaxLv || '0')
        } else {
          this._unhMaxFriendLevel = UNH_FriendLevel.MaxFriendshipLevel;
        }
      } else {
        this._unhMaxFriendLevel = UNH_FriendLevel.MaxFriendshipLevel;
      }
    } else {
      this._unhMaxFriendLevel = UNH_FriendLevel.MaxFriendshipLevel;
    }
  }
  return this._unhMaxFriendLevel;
};

Game_Actor.prototype.unhFriendshipExpToNext = function(level) {
  const maxLevel = this.unhFriendshipMaxLevel();
  if (!this._unhFriendExpToNext) {
    this._unhFriendExpToNext = [];
    for (let i = 0; i < maxLevel + 1; i++) {
      this._unhFriendExpToNext[i] = UNH_FriendLevel.FriendshipExpToNext(this, i);
    }
  }
  if (level === undefined) return this._unhFriendExpToNext;
  if (typeof level !== 'number') return this._unhFriendExpToNext;
  if (isNaN(level)) return this._unhFriendExpToNext;
  level = level % maxLevel;
  return this._unhFriendExpToNext[level];
};

Game_Actor.prototype.unhInitFriendshipExp = function(value) {
  if (!value) value = 0;
  if (typeof value !== 'number') value = 0;
  if (isNaN(value)) value = 0;
  if (this._unhFriendExp === undefined) {
    if (!this.actor()) {
      this._unhFriendExp = value;
      return;
    }
    const meta = this.actor().meta;
    if (!meta) {
      this._unhFriendExp = value;
      return;
    }
    const friendLv = meta['Initial Friendship Level'];
    if (!friendLv) {
      this._unhFriendExp = value;
      return;
    }
    if (isNaN(friendLv)) {
      this._unhFriendExp = value;
      return;
    }
    this._unhFriendExp = Number(friendLv || '0');
  }
};

Game_Actor.prototype.unhGetFriendshipExp = function() {
  this.unhInitFriendshipExp();
  return this._unhFriendExp;
};

Game_Actor.prototype.unhSetFriendshipExp = function(value) {
  if (!value) value = 0;
  if (typeof value !== 'number') value = 0;
  if (isNaN(value)) value = 0;
  const maxLv = this.unhFriendshipMaxLevel();
  const maxExp = this.unhFriendshipExpToNext(maxLv);
  let friendExp = Number(value || '0');
  friendExp = Math.max(friendExp, 0);
  friendExp = Math.min(friendExp, maxExp);
  if (isNaN(this.unhGetFriendshipExp())) {
    this.unhInitFriendshipExp(friendExp);
  } else {
    this._unhFriendExp = friendExp;
  }
};

Game_Actor.prototype.unhAddFriendshipExp = function(value) {
  if (!value) value = 0;
  if (typeof value !== 'number') value = 0;
  if (isNaN(value)) value = 0;
  const curExp = this.unhGetFriendshipExp();
  if (isNaN(curExp)) {
    this.unhInitFriendshipExp(value);
  } else {
    this.unhSetFriendshipExp(curExp + value);
  }
};

Game_Actor.prototype.unhGetFriendshipLevel = function() {
  const curExp = this.unhGetFriendshipExp();
  const expThresholds = this.unhFriendshipExpToNext();
  const level = expThresholds.reduce(function(r, threshold, index) {
    if (curExp >= threshold) {
      return r + 1;
    } else {
      return r;
    }
  }, -1);
  return Math.max(Math.min(level, this.unhFriendshipMaxLevel()), 0);
};

Game_Actor.prototype.unhDisplayFriendshipExp = function() {
  const curLv = this.unhGetFriendshipLevel();
  const curExp = this.unhGetFriendshipExp();
  if (curLv < 1) {
    return curExp;
  } else {
    const lastExp = this.unhFriendshipExpToNext(curLv - 1);
    return (curExp - lastExp);
  }
  return this._unhFriendExp;
};

Game_Actor.prototype.unhDisplayFriendshipToNext = function() {
  const curLv = this.unhGetFriendshipLevel();
  const curExp = this.unhFriendshipExpToNext(curLv);
  if (curLv < 1) {
    return curExp;
  } else {
    const lastExp = this.unhFriendshipExpToNext(curLv - 1);
    return (curExp - lastExp);
  }
  return this._unhFriendExp;
};

Game_Actor.prototype.unhFriendKnowledgeCheck = function(checks) {
  if (checks === undefined) checks = 1;
  if (typeof checks !== 'number') checks = 1;
  if (isNaN(checks)) checks = 1;
  const actor = this;
  const dieMax = actor.unhFriendshipMaxLevel();
  const rolls = Array.from(Array(checks), function() {
    return Math.randomInt(dieMax);
  });
  const passCheck = rolls.every(function(e) {
    return (e < actor.unhGetFriendshipLevel());
  });
  return passCheck;
};
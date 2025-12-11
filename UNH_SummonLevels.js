//=============================================================================
// Unhinged Development - Preload Actors: Summon Levels
// UNH_SummonLevels.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_SummonLevels = true;

//=============================================================================
 /*:
 * @target MZ
 * @base UNH_PreloadActors
 * @orderAfter UNH_PreloadActors
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [SummonLevels]
 * @author Unhinged Developer
 *
 * @param DefaultLevel
 * @text Default Enemy Level
 * @desc The default level for enemies
 * @type number
 * @default 1
 * @min 1
 * @max 99
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Do you want to call the stats of another actor?  With this plugin, I've 
 * already handled the screwy javascript required to sync up their levels with 
 * yours!
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <unhSummon>
 * - Use for Actors
 * - Marks an actor as a summon for the purpose of this plugin
 * <unhActorSummon:X>
 * - Use for Actors
 * - Same as <unhSummon>, but also marks actor X (Database ID) as the dedicated 
 *   summoner
 * <unhEnemySummon:X>
 * - Use for Actors
 * - Same as <unhSummon>, but also marks enemy X (Database ID) as the dedicated 
 *   summoner
 * <unhSummonerLevel:X>
 * - Use for Enemies
 * - Gives enemies a level X (JS: Number) for the purposes of summoning
 *   - user: the enemy being given a level
 * - Do not use if also using UNH_MiscFunc.js
 * - Do not use if also using VisuMZ_3_EnemyLevels.js
 * <unhSummonId:X>
 * - Use for Skills/Items
 * - Marks an action to specifically use actor X (JS: Database ID) as the summon
 *   - action: the marked action
 *   - item: the action's database entry
 *   - user: the action's actual user
 */
//=============================================================================

const UNH_SummonLevels = {};
UNH_SummonLevels.pluginName = 'UNH_SummonLevels';
UNH_SummonLevels.parameters = PluginManager.parameters(UNH_SummonLevels.pluginName);
UNH_SummonLevels.DefaultLevel = Number(UNH_SummonLevels.parameters['DefaultLevel'] || 0);

UNH_SummonLevels.hasPlugin = function(name) {
  return $plugins.some(function(plug) {
    if (!plug) return false;
    if (!plug.name) return false;
    if (!plug.status) return false;
    return plug.name === name;
  });
};

Game_BattlerBase.prototype.summons = function() {
  return $gameActors.data().filter(function(actor) {
    if (!actor) return false;
    if (actor === this) return false;
    if ($gameParty.members().includes(actor)) return false;
    if (!actor.actor()) return false;
    if (!actor.actor().meta) return false;
    if (!!eval(actor.actor().meta.unhSummon)) {
      return true;
    }
    return false;
  });
};

Game_Actor.prototype.summons = function() {
  const summons = Game_BattlerBase.prototype.summons.call(this);
  const user = this;
  for (const actor of $gameActors.data()) {
    if (!actor) continue;
    if (actor === this) continue;
    if ($gameParty.members().includes(actor)) continue;
    if (!actor.actor()) continue;
    if (summons.includes(actor)) continue;
    if (!actor.actor().meta) continue;
    if (!actor.actor().meta.unhActorSummon) continue;
    if (typeof actor.actor().meta.unhActorSummon === 'boolean') {
      summons.push(actor);
      continue;
    }
    if (isNaN(actor.actor().meta.unhActorSummon)) continue;
    const actorId = this.actorId();
    const summonId = Number(eval(actor.actor().meta.unhActorSummon));
    if (actorId === summonId) {
      summons.push(actor);
    }
  }
  return summons;
};

Game_Enemy.prototype.summons = function() {
  const summons = Game_BattlerBase.prototype.summons.call(this);
  const user = this;
  for (const actor of $gameActors.data()) {
    if (!actor) continue;
    if (actor === this) continue;
    if ($gameParty.members().includes(actor)) continue;
    if (!actor.actor()) continue;
    if (summons.includes(actor)) continue;
    if (!actor.actor().meta) continue;
    if (!actor.actor().meta.unhEnemySummon) continue;
    if (typeof actor.actor().meta.unhEnemySummon === 'boolean') {
      summons.push(actor);
      continue;
    }
    if (isNaN(actor.actor().meta.unhEnemySummon)) continue;
    const enemyId = this.enemyId();
    const summonId = Number(eval(actor.actor().meta.unhEnemySummon));
    if (enemyId === summonId) {
      summons.push(actor);
    }
  }
  return summons;
};

UNH_SummonLevels.BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
  const action = this._action;
  action.unhSummonCalcLevel();
  UNH_SummonLevels.BattleManager_startAction.call(this);
};

Game_Action.prototype.unhSummonCalcLevel = function(actorId) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  let meta = null;
  let metaData = '0';
  let defSmnId = 0;
  if (!!item) {
    meta = item.meta;
    if (!!meta) {
      if (!!meta['unhSummonId']) {
        metaData = meta['unhSummonId'];
        if (isNaN(metaData)) {
          const evalData = eval(metaData);
          if (isNaN(evalData)) {
            defSmnId = 0;
          } else {
            defSmnId = Number(evalData);
          }
        } else {
          defSmnId = Number(metaData);
        }
      }
    }
  }
  const summons = user.summons();
  const actors = $gameActors.data();
  if (actorId === undefined) actorId = defSmnId;
  if (typeof actorId !== 'number') actorId = defSmnId;
  if (isNaN(actorId)) actorId = defSmnId;
  if (actorId < 0) actorId = defSmnId;
  if (actorId >= actors.length) actorId = defSmnId;
  const temp = ((UNH_SummonLevels.hasPlugin('VisuMZ_3_EnemyLevels')) ? (user.maxLevel()) : (99));
  const maxLevel = ((user.isActor()) ? (user.maxLevel()) : (temp));
  const level = user.unhLevel(maxLevel);
  if (actorId > 0) {
    const summon = $gameActors.actor(actorId);
    if (summons.includes(summon)) summon.changeExp(summon.expForLevel(level), false);
  } else {
    for (const summon of user.summons()) {
      if (summon.level === level) continue;
      summon.changeExp(summon.expForLevel(level), false);
    }
  }
};

if (!UNH_SummonLevels.hasPlugin('VisuMZ_3_EnemyLevels') && !UNH_SummonLevels.hasPlugin('UNH_MiscFunc')) {
  Object.defineProperty(Game_Enemy.prototype, "level", {
    get: function () {
      return this.getLevel();
    },
    configurable: true
  });

  Game_Enemy.prototype.getLevel = function() {
    if (this._level === undefined) this._level = this.createLevel(99);
    return this._level;
  };

  Game_Enemy.prototype.createLevel = function(max) {
    const user = this.enemy();
    const defaultLevel = UNH_SummonLevels.DefaultLevel;
    if (!user) return defaultLevel;
    const meta = user.meta;
    if (!meta) return defaultLevel;
    const level = meta.unhSummonerLevel;
    if (!level) return defaultLevel;
    if (typeof level === 'number') {
      if (isNaN(level)) return UNH_SummonLevels.DefaultLevel;
	  return Math.min(Math.max(Number(level), 1), max);
    }
    if (/^\d+$/.test(level)) {
      if (isNaN(level)) return UNH_SummonLevels.DefaultLevel;
	  return Math.min(Math.max(Number(level), 1), max);
    }
    try {
      const dummy = eval(level);
      if (typeof dummy === 'object') return ((dummy.isActor()) ? (dummy.level) : (UNH_SummonLevels.DefaultLevel));
      if (isNaN(dummy)) return UNH_SummonLevels.DefaultLevel;
      return Math.min(Math.max(Number(dummy), 1), max);
    } catch (e) {
      return UNH_SummonLevels.DefaultLevel;
    }
  };
};

Game_BattlerBase.prototype.unhLevel = function(max) {
  return 1;
};

Game_Actor.prototype.unhLevel = function(max) {
  return Math.min(Math.max(Number(this.level), 1), max);
};

Game_Enemy.prototype.unhLevel = function(max) {
  return Math.min(Math.max(Number(this.level), 1), max);
};
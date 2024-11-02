//=============================================================================
// Unhinged Development - Preload Actors: Summon Levels
// UNH_SummonLevels.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @base UNH_PreloadActors
 * @orderAfter UNH_PreloadActors
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [SummonLevels]
 * @author Unhinged Developer
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
 * - Gives enemies a level X (JS) for the purposes of summoning
 *   - user: the enemy being given a level
 * - Do not use if also using VisuMZ_3_EnemyLevels.js
 */
//=============================================================================

const UNH_SummonLevels = {};
UNH_SummonLevels.pluginName = 'UNH_SummonLevels';

Game_BattlerBase.prototype.summons = function() {
  return $gameActors.data().filter(function(actor) {
    if (!actor) return false;
    if (!actor.actor()) return false;
    if (!actor.actor().meta) return false;
    return !!actor.actor().meta.unhSummon;
  });
};

Game_Actor.prototype.summons = function() {
  const summons = Game_BattlerBase.prototype.summons.call(this);
  for (const actor of $gameActors.data()) {
    if (!actor) continue;
    if (!actor.actor()) continue;
    if (!actor.actor().meta) continue;
    if (isNaN(actor.actor().meta.unhActorSummon)) continue;
    if (actor.actor().meta.unhActorSummon === true) summons.push(actor);
    if (this.actorId() === Number(actor.actor().meta.unhActorSummon)) summons.push(actor);
  }
  return summons;
};

Game_Enemy.prototype.summons = function() {
  const summons = Game_BattlerBase.prototype.summons.call(this);
  for (const actor of $gameActors.data()) {
    if (!actor) continue;
    if (!actor.actor()) continue;
    if (!actor.actor().meta) continue;
    if (isNaN(actor.actor().meta.unhEnemySummon)) continue;
    if (actor.actor().meta.unhEnemySummon === true) summons.push(actor);
    if (this.enemyId() === Number(actor.actor().meta.unhEnemySummon)) summons.push(actor);
  }
  return summons;
};

UNH_SummonLevels.BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
  const subject = this._subject;
  subject.unhSummonCalcLevel();
  UNH_SummonLevels.BattleManager_startAction.call(this);
};

Game_BattlerBase.prototype.unhSummonCalcLevel = function() {
  const level = this.unhLevel();
  for (const summon of this.summons()) {
    if (summon.level === level) continue;
    summon.changeExp(summon.expForLevel(level), false);
  }
};

Game_BattlerBase.prototype.unhLevel = function() {
  return 1;
};

Game_Actor.prototype.unhLevel = function() {
  return this._level;
};

Game_Enemy.prototype.unhLevel = function() {
  if (!!Imported.VisuMZ_3_EnemyLevels) {
    return this.getLevel();
  } else if (!!this._level) {
    return this._level;
  }
  const user = this.enemy();
  const meta = user.meta;
  if (!meta) return 1;
  const level = meta.unhSummonerLevel;
  if (!level) return 1;
  if (typeof level === 'number') return ((isNaN(level)) ? (1) : (Math.min(Math.max(Number(level), 1), 99)));
  try {
    const evalFunc = new Function('user', 'meta', 'return ' + level);
    const dummy = evalFunc(user, meta);
    if (typeof dummy === 'object') return ((dummy.isActor()) ? (dummy.level) : (1));
    if (isNaN(dummy)) return 1;
    return Math.min(Math.max(Number(dummy), 1), 99);
  } catch (e) {
    return 1;
  }
};
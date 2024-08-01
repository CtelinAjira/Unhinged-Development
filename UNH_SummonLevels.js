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
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [SummonLevels]
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
 * <unhSummonerLevel:X>
 * - Use for Enemies
 * - Gives enemies a level X (Number) for the purposes of summoning
 */
//=============================================================================

const UNH_SummonLevels = {};
UNH_SummonLevels.pluginName = 'UNH_SummonLevels';

UNH_SummonLevels.BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
  const subject = this._subject;
  const summonLevel = subject.unhSummonCalcLevel();
  UNH_SummonLevels.BattleManager_startAction.call(this);
};

Game_BattlerBase.prototype.unhSummonCalcLevel = function() {
  const level = this.unhLevel();
  for (const summon of $gameActors.data()) {
    if (summon.level === level) continue;
    if (!summon.actor().meta) continue;
    if (!summon.actor().meta.unhSummon) continue;
    summon.changeExp(summon.expForLevel(level), false);
  }
  return level;
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
  const meta = this.enemy().meta;
  if (!!meta) {
    const smLv = meta.unhSummonerLevel
    if (!!smLv) {
      if (typeof smLv === 'number') {
        return Math.max(smLv, 1);
      }
      try {
        let returnVal = eval(smLv);
        return returnVal;
      } catch (e) {
        return 1;
      }
    }
  }
  return 1;
};

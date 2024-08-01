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
 * 
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * battler.unhSummonLevel(X)
 * - sets all summons' levels to X (Number), then returns X
 * battler.unhSummonLevel(X, Y)
 * - sets level of actor Y (Number) to X (Number), then returns X
 */
//=============================================================================

const UNH_SummonLevels = {};
UNH_SummonLevels.pluginName = 'UNH_SummonLevels';

Game_BattlerBase.prototype.unhSummonCalcLevel = function(level, actorId) {
  if (!level) level = 1;
  if (!!actorId) {
    const summon = $gameActors.actor(actorId);
    if (summoner.level !== level) {
      const meta = summon.actor().meta;
      if (!!meta) {
        const isSummon = meta.unhSummon;
        if (!!isSummon) {
          summon.changeExp(summon.expForLevel(level), false);
        }
      }
    }
  } else {
    for (const summon of $gameActors.data()) {
      if (summon.level !== level) continue;
      if (!summon.actor().meta) continue;
      if (!summon.actor().meta.unhSummon) continue;
      summon.changeExp(summon.expForLevel(level), false);
    }
  }
  return level;
};

Game_Actor.prototype.unhSummonLevel = function(actorId) {
  return this.unhSummonCalcLevel(this.level, actorId);
};

Game_Enemy.prototype.unhLevel = function() {
  if (!!Imported.VisuMZ_3_EnemyLevels) {
    return this.level;
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

Game_Enemy.prototype.unhSummonLevel = function(actorId) {
  return this.unhSummonCalcLevel(this.unhLevel(), actorId);
};

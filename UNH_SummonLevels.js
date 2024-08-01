//=============================================================================
// Unhinged Development - Preload Actors: Summon Levels
// UNH_SummonLevels.js
//=============================================================================

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
 * battler.unhSummonLevel()
 * - returns the highest aggro total for the chosen unit
 */
//=============================================================================

const UNH_SummonLevels = {};
UNH_SummonLevels.pluginName = 'UNH_SummonLevels';

Game_BattlerBase.prototype.unhSummonCalcLevel = function(actorId, level) {
  const actors = $gameActors.data();
  if (!!actorId) {
    const actor = actors[actorId];
    if (actor.level !== level) {
      const meta = actor.actor().meta;
      if (!!meta) {
        const isSummon = meta.unhSummon;
        if (!!isSummon) {
          actor.changeExp(actor.expForLevel(level), false);
        }
      }
    }
  } else {
    for (const summon of actors) {
      if (summon.level !== level) continue;
      if (!summon.actor().meta) continue;
      if (!summon.actor().meta.unhSummon) continue;
      summon.changeExp(summon.expForLevel(level), false);
    }
  }
  return level;
};

Game_Actor.prototype.unhSummonLevel = function(actorId) {
  return this.unhSummonCalcLevel(actorId, this.level);
};

Game_Enemy.prototype.unhLevel = function() {
  if (!!this._level) return this._level;
  const meta = this.enemy().meta;
  if (!!meta) {
    const smLv = meta.unhSummonerLevel
    if (!!smLv) {
      if (typeof smLv === 'number') {
        return smLv;
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
  return this.unhSummonCalcLevel(actorId, this.unhLevel());
};
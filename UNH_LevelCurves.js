//=============================================================================
// Unhinged Development - Level Curves
// UNH_LevelCurves.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [LevelCurves]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <ExpToNext:X>
 * - Use for Actors
 * - Actor takes X experience to level up (JavaScript)
 *   - user - the actor in question
 *   - level - the next level
 * - CASE SENSITIVE
 *
 * Example: 
 *          <ExpToNext:100>
 *          <ExpToNext:(10 + (10 * level))>
 *          <ExpToNext:(10 * Math.pow(2, level / 4))>
 */
//=============================================================================

const UNH_LevelCurves = {};
UNH_LevelCurves.pluginName = 'UNH_LevelCurves';

UNH_LevelCurves.Actor_expForLevel = Game_Actor.prototype.expForLevel;
Game_Actor.prototype.expForLevel = function(level) {
  if (!this.actor().meta) {
    return UNH_LevelCurves.Actor_expForLevel.call(this, level);
  } else if (!this.actor().meta.ExpToNext) {
    return UNH_LevelCurves.Actor_expForLevel.call(this, level);
  }
  const user = this;
  level = level - 1;
  return eval(this.actor().meta.ExpToNext) * (level + 1);
};

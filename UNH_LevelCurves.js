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

UNH_LevelCurves.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_LevelCurves.DataManager_isDatabaseLoaded.call(this)) return false;

  if (!UNH_LevelCurves._loaded) {
	this.processUnhExpNotetags($dataActors);
    UNH_LevelCurves._loaded = true;
  }
  return true;
};

DataManager.processUnhExpNotetags = function(group) {
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);
    obj.unhLevelCurve = '';
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<Unh Exp To Next:[ ](.*)>/i)) {
        obj.unhLevelCurve = String(RegExp.$1);
      }
    }
  }
};

UNH_LevelCurves.Actor_expForLevel = Game_Actor.prototype.expForLevel;
Game_Actor.prototype.expForLevel = function(level) {
  const user = this;
  const actor = user.actor();
  if (actor.unhLevelCurve === '') {
    return UNH_LevelCurves.Actor_expForLevel.call(this, level);
  }
  let expString = String(actor.meta.ExpToNext) + ' * (level + 1)';
  try {
    const tempLevel = level - 1;
    const evalFunc = new Function('user', 'actor', 'level', 'return ' + expString);
    return evalFunc(user, actor, tempLevel);
  } catch (e) {
    return UNH_LevelCurves.Actor_expForLevel.call(this, level);
  }
};

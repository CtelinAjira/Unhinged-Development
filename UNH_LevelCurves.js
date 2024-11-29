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
 * @param DefaultExpToNext
 * @text Default Exp To Next Level
 * @desc Variables: user, actor, curLv, tgLv
 * Leave blank to use corescript calculations
 * @type string
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
 *   - actor - the actor's database object
 *   - curLv - your current level
 *   - tgLv - your next level
 * - CASE SENSITIVE
 *
 * Example: 
 *          <ExpToNext:100>
 *          <ExpToNext:(10 + (10 * curLv))>
 *          <ExpToNext:(10 * Math.pow(2, curLv / 4))>
 */
//=============================================================================

const UNH_LevelCurves = {};
UNH_LevelCurves.pluginName = 'UNH_LevelCurves';
UNH_LevelCurves.parameters = PluginManager.parameters(UNH_LevelCurves.pluginName);
UNH_LevelCurves.DefaultExpToNext = String(UNH_LevelCurves.parameters['DefaultExpToNext'] || '');

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
    obj.unhLevelCurve = UNH_LevelCurves.DefaultExpToNext;
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<ExpToNext:(.*)>/i)) {
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
  let expString = String(actor.meta.ExpToNext) + ' * (tgLv)';
  try {
    const evalFunc = new Function('user', 'actor', 'curLv', 'tgLv', 'return Math.round(Number(' + expString + '));');
    return evalFunc(user, actor, level - 1, level);
  } catch (e) {
    return UNH_LevelCurves.Actor_expForLevel.call(this, level);
  }
};

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
 * <Exp To Next: X>
 * - Use for Actors
 * - Actor takes X experience to level up (JavaScript)
 *   - user - the actor in question
 *   - level - the target level
 * - CASE INSENSITIVE
 *
 * Example: 
 *          <Exp To Next: 100>
 *          <Exp To Next: 10 * level>
 *          <Exp To Next: 10 * Math.pow(2, (level - 1) / 4)>
 */
//=============================================================================

const UNH_LevelCurves = {};
UNH_LevelCurves.pluginName = 'UNH_LevelCurves';
UNH_LevelCurves.parameters = PluginManager.parameters(UNH_LevelCurves.pluginName);

UNH_LevelCurves.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_LevelCurves.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_LevelCurves._isLoaded) {
    this.processExpNotetags($dataActors);
    this.processExpNotetags($dataClasses);
    UNH_LevelCurves._isLoaded = true;
  }
  return true;
};

DataManager.processExpNotetags = function(group){
  const note = /<(?:EXP TO NEXT):[ ](.*)>/i;
  for (const obj of group) {
    if (!obj) continue;
    obj._expToNext = '';
	const notedata = obj.note.split(/[\r\n]+/);
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(note)) {
        obj._expToNext = String(RegExp.$1);
	  }
    }
    obj._expToNext += ' * (level - 1)';
  }
};

UNH_LevelCurves.Actor_expForLevel = Game_Actor.prototype.expForLevel;
Game_Actor.prototype.expForLevel = function(level) {
  const user = this;
  const actor = this.actor();
  const curClass = this.currentClass();
  const expToNext = actor._expToNext ? actor._expToNext.trim() : curClass._expToNext.trim();
  if (!expToNext) return UNH_LevelCurves.Actor_expForLevel.call(this, level);
  try {
    return Math.round(eval(expToNext));
  } catch (e) {
    return UNH_LevelCurves.Actor_expForLevel.call(this, level);
  }
};

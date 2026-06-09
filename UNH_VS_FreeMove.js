//=============================================================================
// Unhinged Development - VS Battle Grid System: Freedom of Movement
// UNH_VS_FreeMove.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_FreeMove]
 * @author Unhinged Developer
 * @base VisuMZ_2_BattleGridSystem
 * @orderAfter VisuMZ_2_BattleGridSystem
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * New notetags to allow for resistance to movement sealing.
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Free Move>
 * - Unlocks otherwise sealed movement, no questions asked.
 * 
 * <Free Move: X%> (Number)
 * - X% chance to unlock otherwise sealed movement.
 * 
 * <Free Move: X.Y%> (Number, Number)
 * - X.Y% chance to unlock otherwise sealed movement.
 * 
 * <Free Move: X> (JS Eval)
 * - Unlocks otherwise sealed movement if X evals to true
 *   - Variables: action, item, user, target
 */
//=============================================================================

const UNH_VS_FreeMove = {};
UNH_VS_FreeMove.pluginName = 'UNH_VS_FreeMove';

UNH_VS_FreeMove.FreeMoveFuncs = {
  Actor:{'0':new Function(action, target, 'return false;')},
  Class:{'0':new Function(action, target, 'return false;')},
  Weapon:{'0':new Function(action, target, 'return false;')},
  Armor:{'0':new Function(action, target, 'return false;')},
  Enemy:{'0':new Function(action, target, 'return false;')},
  State{'0':new Function(action, target, 'return false;')}
};

UNH_VS_FreeMove.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_VS_FreeMove.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_VS_FreeMove._loaded) {
    this.processUnhFreeMoveNotetags($dataActors);
    this.processUnhFreeMoveNotetags($dataClasses);
    this.processUnhFreeMoveNotetags($dataWeapons);
    this.processUnhFreeMoveNotetags($dataArmors);
    this.processUnhFreeMoveNotetags($dataEnemies);
    this.processUnhFreeMoveNotetags($dataStates);
    UNH_VS_FreeMove._loaded = true;
  }
  return true;
};

DataManager.processUnhFreeMoveNotetags = function(group) {
  let groupKey = '';
  switch (group) {
    case $dataActors:
      groupKey = 'Actor';
      break;
    case $dataClasses:
      groupKey = 'Class';
      break;
    case $dataWeapons:
      groupKey = 'Weapon';
      break;
    case $dataArmors:
      groupKey = 'Armor';
      break;
    case $dataStates:
      groupKey = 'State';
      break;
    case $dataEnemies:
      groupKey = 'Enemy';
      break;
  }
  let code;
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<FREE MOVE>/i)) {
        code = 'return true;';
      } else if (line.match(/<FREE MOVE:[ ](\d+)([%％])>/i)) {
        code = 'return ((Math.random() * 100) < (' + String(parseInt(RegExp.$1)) + '));';
      } else if (line.match(/<FREE MOVE:[ ](\d+).(\d+)([%％])>/i)) {
        code = 'return ((Math.random() * 100) < (' + String(parseInt(RegExp.$1)) + '.' + String(parseInt(RegExp.$2)) + '));';
      } else if (line.match(/<FREE MOVE:[ ](.*)>/i)) {
        code = 'const item = action.item();\nconst user = action.subject();\nreturn (' + String(RegExp.$1) + ');';
      } else {
        code = 'return false;';
      }
    }
    UNH_VS_FreeMove.FreeMoveFuncs[groupKey][n] = new Function('action', 'target', code);
  }
};

UNH_VS_FreeMove.Battler_isNoGridMove = Game_Battler.prototype.isNoGridMove;
Game_Battler.prototype.isNoGridMove = function() {
  if (!UNH_VS_FreeMove.Battler_isNoGridMove.call(this)) return false;
  const action = BattleManager._action;
  if (!action) return false;
  const target = this;
  return target.traitObjects().some(function(obj) {
    return UNH_VS_FreeMove.FreeMoveFuncs[obj.groupKey][obj.id](action, target);
  });
};

UNH_VS_FreeMove.Battler_isSealedGridMove = Game_Battler.prototype.isSealedGridMove;
Game_Battler.prototype.isSealedGridMove = function() {
  if (!UNH_VS_FreeMove.Battler_isSealedGridMove.call(this)) return false;
  const action = BattleManager._action;
  if (!action) return false;
  const target = this;
  return target.traitObjects().some(function(obj) {
    return UNH_VS_FreeMove.FreeMoveFuncs[obj.groupKey][obj.id](action, target);
  });
};
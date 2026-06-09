//=============================================================================
// Unhinged Development - VS Battle Grid System: Knockback Resistance
// UNH_VS_KnockbackResist.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_KnockbackResist]
 * @author Unhinged Developer
 * @base VisuMZ_2_BattleGridSystem
 * @orderAfter VisuMZ_2_BattleGridSystem
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * New notetags to allow for resistance to forced movement.
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Resist Knockback>
 * - Cancels forced movement, no questions asked.
 * 
 * <Resist Knockback: X%> (Number)
 * - X% chance to cancel forced movement.
 * 
 * <Resist Knockback: X.Y%> (Number, Number)
 * - X.Y% chance to cancel forced movement.
 * 
 * <Resist Knockback: X> (JS Eval)
 * - Cancels forced movement if X evals to true
 *   - Variables: action, item, user, target
 */
//=============================================================================

const UNH_VS_KnockbackResist = {};
UNH_VS_KnockbackResist.pluginName = 'UNH_VS_KnockbackResist';

UNH_VS_KnockbackResist.ResistKnockbackFuncs = {
  Actor:{'0':new Function(action, target, 'return false;')},
  Class:{'0':new Function(action, target, 'return false;')},
  Weapon:{'0':new Function(action, target, 'return false;')},
  Armor:{'0':new Function(action, target, 'return false;')},
  Enemy:{'0':new Function(action, target, 'return false;')},
  State{'0':new Function(action, target, 'return false;')}
};

UNH_VS_KnockbackResist.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_VS_KnockbackResist.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_VS_KnockbackResist._loaded) {
    this.processUnhResistKnockbackNotetags($dataActors);
    this.processUnhResistKnockbackNotetags($dataClasses);
    this.processUnhResistKnockbackNotetags($dataWeapons);
    this.processUnhResistKnockbackNotetags($dataArmors);
    this.processUnhResistKnockbackNotetags($dataEnemies);
    this.processUnhResistKnockbackNotetags($dataStates);
    UNH_VS_KnockbackResist._loaded = true;
  }
  return true;
};

DataManager.processUnhResistKnockbackNotetags = function(group) {
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
      if (line.match(/<RESIST KNOCKBACK>/i)) {
        code = 'return true;';
      } else if (line.match(/<RESIST KNOCKBACK:[ ](.*)>/i)) {
        code = 'const item = action.item();\nconst user = action.subject();\nreturn (' + String(RegExp.$1) + ');';
      } else if (line.match(/<RESIST KNOCKBACK:[ ](\d+)([%％])>/i)) {
        code = 'return ((Math.random() * 100) < (' + String(parseInt(RegExp.$1)) + '));';
      } else if (line.match(/<RESIST KNOCKBACK:[ ](\d+).(\d+)([%％])>/i)) {
        code = 'return ((Math.random() * 100) < (' + String(parseInt(RegExp.$1)) + '.' + String(parseInt(RegExp.$2)) + '));';
      } else {
        code = 'return false;';
      }
    }
    UNH_VS_KnockbackResist.ResistKnockbackFuncs[groupKey][n] = new Function('action', 'target', code);
  }
};

UNH_VS_KnockbackResist.Action_applyBattleGridSystemTargetMovement = Game_Action.prototype.applyBattleGridSystemTargetMovement;
Game_Action.prototype.applyBattleGridSystemTargetMovement = function (target) {
  const action = this;
  if (this.subject().isActor() === target.isActor()) return;
  for (const obj of target.traitObjects()) {
    if (UNH_VS_KnockbackResist.ResistKnockbackFuncs[obj.groupKey][obj.id](action, target)) return;
  }
  UNH_VS_KnockbackResist.Action_applyBattleGridSystemTargetMovement.call(this, target);
};
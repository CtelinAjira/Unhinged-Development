//=============================================================================
// Unhinged Development - VS Battle Grid System: Non-Trigger States
// UNH_VS_NonTriggerStates.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_VS_NonTriggerStates = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [EnchantAid]
 * @author Unhinged Developer
 * @base VisuMZ_2_BattleGridSystem
 * @orderAfter VisuMZ_2_BattleGridSystem
 *
 * @help
 * I've been bothered by the fact that there's apparently no way to make a 
 * levitating guy fly over a landmine within the VS suite.
 *
 * This is a response to that, allowing for states that make Node Triggers not 
 * take.
 * <No Trigger>   - Set battler with this state to not trip Node Triggers
 * <No Trigger: X> - See <No Trigger>, but with a condition (JS Eval)
 * - Variables: skill, target
 * <Always Trigger>   - Set skill to bypass <No Trigger> and <No Trigger:X>
 * <Always Trigger: X> - See <Always Trigger>, but with a condition (JS Eval)
 * - Variables: skill, target
 */
//=============================================================================

const UNH_VS_NonTriggerStates = {};
UNH_VS_NonTriggerStates.pluginName = 'UNH_VS_NonTriggerStates';

UNH_VS_NonTriggerStates.BypassFunctions = {
  Actor:{
    '0':function(skill, target) {
      return false;
    }
  }, Class:{
    '0':function(skill, target) {
      return false;
    }
  }, Weapon:{
    '0':function(skill, target) {
      return false;
    }
  }, Armor:{
    '0':function(skill, target) {
      return false;
    }
  }, Enemy:{
    '0':function(skill, target) {
      return false;
    }
  }, State:{
    '0':function(skill, target) {
      return false;
    }
  }
};

UNH_VS_NonTriggerStates.EnsureFunctions = {
  Skill:{
    '0':function(skill, target) {
      return false;
    }
  }, Item:{
    '0':function(skill, target) {
      return false;
    }
  }
};

UNH_VS_NonTriggerStates.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_VS_NonTriggerStates.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_VS_NonTriggerStates._loaded) {
    this.processUnhTriggerEnsureNotetags($dataSkills);
    this.processUnhTriggerEnsureNotetags($dataItems);
    this.processUnhTriggerBypassNotetags($dataActors);
    this.processUnhTriggerBypassNotetags($dataClasses);
    this.processUnhTriggerBypassNotetags($dataWeapons);
    this.processUnhTriggerBypassNotetags($dataArmors);
    this.processUnhTriggerBypassNotetags($dataEnemies);
    this.processUnhTriggerBypassNotetags($dataStates);
    UNH_VS_NonTriggerStates._loaded = true;
  }
  return true;
};

DataManager.processUnhTriggerEnsureNotetags = function(group) {
  let groupKey = '';
  switch (group) {
    case $dataSkills:
      groupKey = 'Skill';
      break;
    case $dataItems:
      groupKey = 'Item';
      break;
  }
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    unhNoTrigger = false;
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<(?:NO TRIGGER)>/i)) {
        unhNoTrigger = true;
      } else if (line.match(/<(?:NO TRIGGER):[ ](*.)>/i)) {
        unhNoTrigger = String(RegExp.$1);
      }
    }
    UNH_VS_NonTriggerStates.EnsureFunctions[groupKey][n] = new Function(skill, target, 'return ' + unhNoTrigger + ';');
  }
};

DataManager.processUnhTriggerBypassNotetags = function(group) {
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
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    unhAlwaysTrigger = false;
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<(?:ALWAYS TRIGGER)>/i)) {
        unhAlwaysTrigger = true;
      } else if (line.match(/<(?:ALWAYS TRIGGER):[ ](*.)>/i)) {
        unhAlwaysTrigger = String(RegExp.$1);
      }
    }
    UNH_VS_NonTriggerStates.BypassFunctions[groupKey][n] = new Function(skill, target, 'return ' + unhAlwaysTrigger + ';');
  }
};

UNH_VS_NonTriggerStates.Battler_registerGridNodeTrigger = Game_Battler.prototype.registerGridNodeTrigger;
Game_Battler.prototype.registerGridNodeTrigger = function (skill) {
  if (!skill) {
    return;
  }
  const target = this;
  if (UNH_VS_NonTriggerStates.EnsureFunctions[skill.groupKey][skill.id](skill, user)) {
    UNH_VS_NonTriggerStates.Battler_registerGridNodeTrigger.call(this, skill);
  } else {
    const bypassTrigger = this.traitObjects().some(function(obj) {
      if (!obj) return false;
      return UNH_VS_NonTriggerStates.BypassFunctions[obj.groupKey][obj.id](skill, user);
    });
    if (!bypassTrigger) {
      UNH_VS_NonTriggerStates.Battler_registerGridNodeTrigger.call(this, skill);
    }
  }
};
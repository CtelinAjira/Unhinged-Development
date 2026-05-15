//=============================================================================
// Unhinged Development - Cover Conditions
// UNH_CoverConditions.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [CoverConditions]
 * @author Unhinged Developer
 *
 * @param CheckSub
 * @text BattleManager.checkSubstitute(target)
 * @desc Variables: action, user, target
 * Must Eval To: Boolean
 * @type string
 * @default target.isDying() && !action.isCertainHit()
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Cover Chance: x%>
 * <Cover Chance: x.y%>
 * - Use for States
 * - Affected battler only has the listed chance of intercepting attacks
 *   - Max of 2-digit precision (so 99.99% will work, but not 99.995%)
 * 
 * <Cover Condition: Up To x% HP>
 * <Cover Condition: Up To x.y% HP>
 * - Use for States
 * - Affected battler only covers allies at or below the specified HP%
 *   - Max of 2-digit precision (so 99.99% will work, but not 99.995%)
 *
 * <Cover Condition: Has State x>
 * - Use for States
 * - Affected battler only covers allies with the specified state
 *
 * <Cover Condition: Single Target>
 * - Use for States
 * - Affected battler only covers against single-target abilities
 *
 * <Cover Condition: Random Target>
 * - Use for States
 * - Affected battler can cover against random-target abilities
 *
 * <Cover Condition: Physical>
 * <Cover Condition: Magical>
 * <Cover Condition: Certain>
 * - Use for States
 * - Affected battler can only cover against the selected hit type
 *
 * <No Cover>
 * - Use for Skills/Items
 * - Tagged skill bypasses the substitute flag outright
 *
 * <No Cover as User>
 * - Use for States
 * - Tagged state causes afflicted's attacks to bypass the substitute flag as 
 *   though tagged with <No Cover>
 *
 * <No Cover as Target>
 * - Use for States
 * - Tagged state causes attacks against afflicted to bypass the substitute 
 *   flag as though tagged with <No Cover>
 *
 * <No Cover as Protector>
 * - Use for States
 * - Tagged state causes afflicted to not cover allies as though tagged with 
 *   <No Cover>
 */
//=============================================================================

const UNH_CoverConditions = {};
UNH_CoverConditions.pluginName = 'UNH_CoverConditions';
UNH_CoverConditions.parameters = PluginManager.parameters(UNH_CoverConditions.pluginName);
UNH_CoverConditions.CheckSub = String(UNH_CoverConditions.parameters['CheckSub'] || '');
UNH_CoverConditions.HasCheckSub = !!UNH_CoverConditions.CheckSub;
UNH_CoverConditions.CheckSubFunc = new Function('action', 'target', 'return ' + UNH_CoverConditions.CheckSub);

UNH_CoverConditions.NoCoverFuncs = {
  Action:{
    Skill:{'0':new Function(action, item, user, target, 'return false;')},
    Item:{'0':new Function(action, item, user, target, 'return false;')},
    Other:{'0':new Function(action, item, user, target, 'return false;')}
  }, User:{
    Actor:{'0':new Function(action, item, user, target, 'return false;')},
    Class:{'0':new Function(action, item, user, target, 'return false;')},
    Weapon:{'0':new Function(action, item, user, target, 'return false;')},
    Armor:{'0':new Function(action, item, user, target, 'return false;')},
    Enemy:{'0':new Function(action, item, user, target, 'return false;')},
    State{'0':new Function(action, item, user, target, 'return false;')}
  }, Target:{
    Actor:{'0':new Function(action, item, user, target, 'return false;')},
    Class:{'0':new Function(action, item, user, target, 'return false;')},
    Weapon:{'0':new Function(action, item, user, target, 'return false;')},
    Armor:{'0':new Function(action, item, user, target, 'return false;')},
    Enemy:{'0':new Function(action, item, user, target, 'return false;')},
    State{'0':new Function(action, item, user, target, 'return false;')}
  }, Protector:{
    Actor:{'0':new Function(action, item, user, target, protector, 'return false;')},
    Class:{'0':new Function(action, item, user, target, protector, 'return false;')},
    Weapon:{'0':new Function(action, item, user, target, protector, 'return false;')},
    Armor:{'0':new Function(action, item, user, target, protector, 'return false;')},
    Enemy:{'0':new Function(action, item, user, target, protector, 'return false;')},
    State{'0':new Function(action, item, user, target, protector, 'return false;')}
  }
};

UNH_CoverConditions.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_CoverConditions.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_CoverConditions._loaded) {
    this.processUnhCoverBypassNotetags1($dataSkills);
    this.processUnhCoverBypassNotetags1($dataItems);
    this.processUnhCoverBypassNotetags2($dataActors);
    this.processUnhCoverBypassNotetags2($dataClasses);
    this.processUnhCoverBypassNotetags2($dataWeapons);
    this.processUnhCoverBypassNotetags2($dataArmors);
    this.processUnhCoverBypassNotetags2($dataEnemies);
    this.processUnhCoverBypassNotetags2($dataStates);
    this.processUnhCoverNotetags($dataActors);
    this.processUnhCoverNotetags($dataClasses);
    this.processUnhCoverNotetags($dataWeapons);
    this.processUnhCoverNotetags($dataArmors);
    this.processUnhCoverNotetags($dataEnemies);
    this.processUnhCoverNotetags($dataStates);
    UNH_CoverConditions._loaded = true;
  }
  return true;
};

DataManager.processUnhCoverBypassNotetags1 = function(group) {
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
    unhNoCover = false;
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<(?:NO COVER)>/i)) {
        unhNoCover = true;
      } else if (line.match(/<(?:NO COVER):[ ](*.)>/i)) {
        unhNoCover = String(RegExp.$1);
      }
    }
    UNH_CoverConditions.NoCoverFuncs.Action[groupKey][n] = new Function(action, item, user, target, 'return ' + unhNoCover + ';');
  }
};

DataManager.processUnhCoverBypassNotetags2 = function(group) {
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
    let unhNoCoverUser = false;
    let unhNoCoverTarget = false;
    let unhNoCoverProtector = false;
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<(?:NO COVER AS USER)>/i)) {
        unhNoCoverUser = true;
      } else if (line.match(/<(?:NO COVER AS USER):[ ](*.)>/i)) {
        unhNoCoverUser = String(RegExp.$1);
      }
      if (line.match(/<(?:NO COVER AS TARGET)>/i)) {
        unhNoCoverTarget = true;
      } else if (line.match(/<(?:NO COVER AS TARGET):[ ](*.)>/i)) {
        unhNoCoverTarget = String(RegExp.$1);
      }
      if (line.match(/<(?:NO COVER AS PROTECTOR)>/i)) {
        unhNoCoverProtector = true;
      } else if (line.match(/<(?:NO COVER AS PROTECTOR):[ ](*.)>/i)) {
        unhNoCoverProtector = String(RegExp.$1);
      }
    }
    UNH_CoverConditions.NoCoverFuncs.User[groupKey][n] = new Function(action, item, user, target, 'return ' + unhNoCoverUser + ';');
    UNH_CoverConditions.NoCoverFuncs.Target[groupKey][n] = new Function(action, item, user, target, 'return ' + unhNoCoverTarget + ';');
    UNH_CoverConditions.NoCoverFuncs.Protector[groupKey][n] = new Function(action, item, user, target, protector, 'return ' + unhNoCoverProtector + ';');
  }
};

DataManager.processUnhCoverNotetags = function(group) {
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
    obj.coverState = 0;
    obj.coverTarget = false;
    obj.coverChance = -1;
    obj.coverPhys = false;
    obj.coverMag = false;
    obj.coverCert = false;
    obj.coverRandom = false;
    obj.coverDying = 0;
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<(?:COVER CONDITION):[ ](?:SINGLE TARGET)>/i)) {
        obj.coverTarget = true;
      }
      if (line.match(/<(?:COVER CONDITION):[ ](?:RANDOM TARGET)>/i)) {
        obj.coverRandom = true;
      }
      if (line.match(/<(?:COVER CONDITION):[ ](?:CERTAIN)>/i)) {
        obj.coverCert = true;
      }
      if (line.match(/<(?:COVER CONDITION):[ ](?:PHYSICAL)>/i)) {
        obj.coverPhys = true;
      }
      if (line.match(/<(?:COVER CONDITION):[ ](?:MAGICAL)>/i)) {
        obj.coverMag = true;
      }
      if (line.match(/<(?:COVER CONDITION):[ ](?:HAS STATE)[ ](\d+)>/i)) {
        obj.coverState = parseInt(RegExp.$1);
      }
      if (line.match(/<(?:COVER CONDITION):[ ](?:UP TO)[ ](\d+)(?:[%％] HP)>/i)) {
        obj.coverDying = parseInt(RegExp.$1);
      } else if (line.match(/<(?:COVER CONDITION):[ ](?:UP TO)[ ](\d+).(\d+)(?:[%％] HP)>/i)) {
        obj.coverDying = parseFloat(String(RegExp.$1) + '.' + String(RegExp.$2));
      }
      if (line.match(/<(?:COVER CHANCE):[ ](\d+)(?:[%％])>/i)) {
        obj.coverChance = parseInt(RegExp.$1);
      } else if (line.match(/<(?:COVER CHANCE):[ ](\d+).(\d+)(?:[%％])>/i)) {
        obj.coverChance = parseFloat(String(RegExp.$1) + '.' + String(RegExp.$2));
      }
    }
  }
};

Game_Battler.prototype.coverSingleOnly = function(stateId) {
  if (!stateId) return false;
  if (isNaN(stateId)) return false;
  if (stateId <= 0 || stateId > $dataStates.length) return false;
  const state = $dataStates[stateId];
  return !!state.coverTarget;
};

Game_Battler.prototype.coverSkillType = function(stateId) {
  if (!stateId) return false;
  if (isNaN(stateId)) return false;
  if (stateId <= 0 || stateId > $dataStates.length) return false;
  const state = $dataStates[stateId];
  let coverAttack = [];
  if (!!state.coverCert) coverAttack.push(0);
  if (!!state.coverPhys) coverAttack.push(1);
  if (!!state.coverMag) coverAttack.push(2);
  return coverAttack.sort(function(a, b) {
    return a - b;
  });
};

Game_Battler.prototype.coverChance = function(stateId) {
  if (!stateId) return false;
  if (isNaN(stateId)) return false;
  if (stateId <= 0 || stateId > $dataStates.length) return false;
  const state = $dataStates[stateId];
  if (state.coverChance < 0) return false;
  const coverChance = Math.max(Math.min(state.coverChance, 100), 0);
  if (coverChance === 100) return true;
  if (coverChance === 0) return false;
  return Math.randomInt(10000) < Math.round(coverChance * 100);
};

Game_Battler.prototype.coverRandomTarget = function(stateId) {
  if (!stateId) return false;
  if (isNaN(stateId)) return false;
  if (stateId <= 0 || stateId > $dataStates.length) return false;
  const state = $dataStates[stateId];
  return !!state.coverRandom;
};

Game_Battler.prototype.coverTargetWithState = function(stateId) {
  if (!stateId) return 0;
  if (isNaN(stateId)) return 0;
  if (stateId <= 0 || stateId >= $dataStates.length) return 0;
  const state = $dataStates[stateId];
  return Math.max(Math.min(state.coverState, $dataStates.length - 1), 0);
};

Game_Battler.prototype.coverAtHpPercent = function(stateId, target) {
  if (!stateId) return 0;
  if (isNaN(stateId)) return 0;
  if (stateId <= 0 || stateId > $dataStates.length) return 0;
  const state = $dataStates[stateId];
  const isDying = state.coverDying;
  if (isDying === undefined) return 0;
  if (typeof isDying !== 'number') return 0;
  if (isNaN(isDying)) return 0;
  const coverDying = Math.max(Math.min(isDying, 100), 0);
  if (coverDying === 0) return 0;
  return (target.hp <= (target.mhp * coverDying / 100));
};

UNH_CoverConditions.runChecks = function(action, target) {
  if (!action) return false;
  if (!target) return false;
  const item = action.item();
  const party = target.friendsUnit().members();
  let stateId, coverTypes;
  for (const member of party) {
    if (member === target) continue;
    member._unhCheckSub = undefined;
    for (const state of member.states()) {
      stateId = state.id;
      if (!member.coverChance(stateId)) continue;
      if (!member.coverAtHpPercent(stateId, target)) continue;
      if (member.coverSingleOnly(stateId) && !action.isForOne()) continue;
      if (action.isForRandom() && !member.coverRandomTarget(stateId)) continue;
      coverTypes = member.coverSkillType(stateId);
      if (coverTypes.length > 0 && !coverTypes.includes(item.hitType)) continue;
      if (!!member.coverTargetWithState(stateId)) {
        if (!target.states().includes(state)) continue;
      } else {
        continue;
      }
      member._unhCheckSub = true;
    }
  }
  return party.some(function(member) {
    if (!member) return false;
    return !!member._unhCheckSub;
  });
};

UNH_CoverConditions.checkSubstitute = BattleManager.checkSubstitute;
BattleManager.checkSubstitute = function(target) {
  if (!target) return false;
  const action = this._action;
  if (!action) return false;
  const item = action.item();
  const user = this._subject;
  if (user.isActor() === target.isActor()) return false;
  if (UNH_CoverConditions.NoCoverFuncs.Action[item.groupKey][item.id](action, item, user, target)) return false;
  const isUserBypassCover = user.traitObjects().some(function(obj) {
    return UNH_CoverConditions.NoCoverFuncs.User[obj.groupKey][obj.id](action, item, user, target);
  });
  if (isUserBypassCover) return false;
  const isTargetBypassCover = target.traitObjects().some(function(obj) {
    return UNH_CoverConditions.NoCoverFuncs.Target[obj.groupKey][obj.id](action, item, user, target);
  });
  if (isTargetBypassCover) return false;
  if (UNH_CoverConditions.runChecks(action, target)) return true;
  const baseCover = UNH_CoverConditions.checkSubstitute.call(this, target);
  if (!UNH_CoverConditions.HasCheckSub) return baseCover;
  try {
    const checkSub = UNH_CoverConditions.CheckSubFunc(action, target);
    return checkSub;
  } catch (e) {
    return baseCover;
  }
};

UNH_CoverConditions.Unit_substituteBattler = Game_Unit.prototype.substituteBattler;
Game_Unit.prototype.substituteBattler = function(target) {
  const action = BattleManager._action;
  const item = action.item();
  const user = BattleManager._subject;
  const protectors = this.aliveMembers().filter(function(member) {
    if (member === target) return false;
    const isCoverExempt = member.traitObjects().some(function(obj) {
      return UNH_CoverConditions.NoCoverFuncs.Protector[obj.groupKey][obj.id](action, item, user, target, member);
    });
    if (!!isCoverExempt) return false;
    const checkSub = member._unhCheckSub;
    member._unhCheckSub = undefined;
    if (!!checkSub) {
      return true;
    }
  });
  if (protectors.length > 0) {
    return protectors[Math.randomInt(protectors.length)];
  } else {
    return UNH_CoverConditions.Unit_substituteBattler.call(this, target);
  }
};

UNH_CoverConditions.BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
  UNH_CoverConditions.BattleManager_startAction.call(this);
  this._action.unhSetOldTargets(this._targets);
};

Game_Action.prototype.unhGetOldTargets = function() {
  if (!this._oldTargets) return [];
  if (!Array.isArray(this._oldTargets)) return [];
  return this._oldTargets;
};

Game_Action.prototype.unhSetOldTargets = function(arr) {
  if (!Array.isArray(arr)) {
    this._unhOldTargets = [];
  } else {
    this._unhOldTargets = arr;
  }
};
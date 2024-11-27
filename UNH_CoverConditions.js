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
 * Return Type: Boolean
 * @type note
 * @default "return target.isDying() && !action.isCertainHit();"
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
 */
//=============================================================================

const UNH_CoverConditions = {};
UNH_CoverConditions.pluginName = 'UNH_CoverConditions';
UNH_CoverConditions.parameters = PluginManager.parameters(UNH_CoverConditions.pluginName);
UNH_CoverConditions.CheckSub = String(UNH_CoverConditions.parameters['CheckSub'] || '');

UNH_CoverConditions.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_CoverConditions.DataManager_isDatabaseLoaded.call(this)) return false;

  if (!UNH_CoverConditions._loaded) {
    this.processUnhCoverNotetags($dataStates);
    UNH_CoverConditions._loaded = true;
  }
  return true;
};

DataManager.processUnhCoverNotetags = function(group) {
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);

    obj.coverState = 0;
    obj.coverTarget = undefined;
    obj.coverChance = -1;
    obj.coverPhys = undefined;
    obj.coverMag = undefined;
    obj.coverCert = undefined;
    obj.coverRandom = undefined;
    obj.coverDying = undefined;

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
  if (state.coverChance < 0) return true;
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
  if (!stateId) return false;
  if (isNaN(stateId)) return false;
  if (stateId <= 0 || stateId > $dataStates.length) return false;
  const state = $dataStates[stateId];
  return Math.max(Math.min(state.coverState, $dataStates.length), 0);
};

Game_Battler.prototype.coverAtHpPercent = function(stateId, target) {
  if (!stateId) return false;
  if (isNaN(stateId)) return false;
  if (stateId <= 0 || stateId > $dataStates.length) return false;
  const state = $dataStates[stateId];
  const coverDying = Math.max(Math.min(state.coverDying, 100), 0);
  if (coverDying === 0) return false;
  return target.hp <= (target.mhp * coverDying / 100);
};

UNH_CoverConditions.runChecks = function(action, target) {
  const party = target.friendsUnit().members();
  for (const member of party) {
    const coverChecks = [];
    let isCover;
    let stateId;
    for (const state of member.states()) {
      stateId = state.id;
      isCover = member.coverChance(stateId);
      if (!isCover) {
        coverChecks.push(isCover);
        continue;
      }
      isCover = member.coverAtHpPercent(stateId, target);
      if (!isCover) {
        coverChecks.push(isCover);
        continue;
      }
      const hitTypes = member.coverSkillType(stateId);
      if (hitTypes.length > 0) isCover = hitTypes.includes(action.item().hitType);
      if (!isCover) {
        coverChecks.push(isCover);
        continue;
      }
      if (action.isForRandom()) {
        isCover = member.coverRandomTarget(stateId);
      }
      if (!isCover) {
        coverChecks.push(isCover);
        continue;
      }
      if (user.coverSingleOnly(stateId)) {
        isCover = action.isForOne();
      }
      coverChecks.push(isCover);
    }
    member._unhCheckSub = coverChecks.some(function(ele) {
      return !!ele;
    });
    if (!!member._unhCheckSub) {
      return true;
    }
  }
  return false;
};

UNH_CoverConditions.checkSubstitute = BattleManager.checkSubstitute;
BattleManager.checkSubstitute = function(target) {
  const action = this._action;
  const user = action.subject();
  if (user.isActor() === target.isActor()) return false;
  if (UNH_CoverConditions.runChecks(target)) return true;
  try {
    const origFunc = new Function('action', 'user', 'target', (!!UNH_CoverConditions.CheckSub) ? UNH_CoverConditions.CheckSub : 'return target.isDying() && !action.isCertainHit();')
    return origFunc(action, user, target);
  } catch (e) {
    return UNH_CoverConditions.checkSubstitute.call(this, target);
  }
};

UNH_CoverConditions.Unit_substituteBattler = Game_Unit.prototype.substituteBattler;
Game_Unit.prototype.substituteBattler = function(target) {
  for (const member of this.members()) {
    if ((!!member._unhCheckSub) && (member !== target)) {
      member._unhCheckSub = undefined;
      return member;
    }
  }
  return UNH_CoverConditions.Unit_substituteBattler.call(this, target);
};
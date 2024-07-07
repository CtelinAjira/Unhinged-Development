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
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * battler.unhSkillLevel(id)
 * - returns the level in that skill ID
 * battler.unhSkillLevel(id)
 * - returns the level in that skill ID
 * battler.unhSetSkillLevel(id, value)
 * - sets the level in that skill ID to a new value
 * battler.unhAddSkillLevel(id, value)
 * - increases the level in that skill ID by a value
 * battler.unhSkillExp(id)
 * - returns the current skill experience for that skill ID
 * battler.unhSetSkillExp(id, value)
 * - sets the skill experience in that skill ID to a new value
 * - if above EXP to Level, will adjust level accordingly
 * battler.unhAddSkillExp(id, value)
 * - increases the skill experience for that skill ID by a value
 * - if above EXP to Level, will adjust level accordingly
 */
//=============================================================================

const UNH_CoverConditions = {};
UNH_CoverConditions.pluginName = 'UNH_CoverConditions';

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
    obj.coverChance = 0;
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

Game_Battler.prototype.coverTarget = function() {
  const states = this.states();
  let coverTarget = false;
  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    if (state.coverTarget !== undefined) {
      coverTarget = state.coverTarget;
	  break;
    }
  }
  return coverTarget;
};

Game_Battler.prototype.coverAttack = function() {
  const states = this.states();
  let coverAttack = [];
  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    if (!!state.coverCert) {
      if (!coverAttack.includes(0)) {
        coverAttack.push(0);
      }
    }
    if (!!state.coverPhys) {
      if (!coverAttack.includes(1)) {
        coverAttack.push(1);
      }
    }
    if (!!state.coverMag) {
      if (!coverAttack.includes(2)) {
        coverAttack.push(2);
      }
    }
    if (coverAttack.includes(0) && coverAttack.includes(1) && coverAttack.includes(2)) {
      break;
    }
  }
  return coverAttack.sort(function(a, b) {
    return a - b;
  });
};

Game_Battler.prototype.coverChance = function() {
  const states = this.states();
  let coverChance = -1;
  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    coverChance = Math.max(state.coverChance, coverChance);
    if (state.coverChance >= 100) {
      coverChance = coverChance;
	  break;
    }
  }
  if (coverChance <= 0) return true;
  return Math.randomInt(10000) <= Math.round(coverChance * 100);
};

Game_Battler.prototype.coverRandom = function() {
  const states = this.states();
  let coverRandom = -1;
  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    if (state.coverRandom >= 0) {
      coverRandom = state.coverRandom;
	  break;
    }
  }
  return coverRandom;
};

Game_Battler.prototype.coverState = function() {
  const states = this.states();
  let coverState = 0;
  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    if (state.coverState !== 0) {
      coverState = state.coverState;
	  break;
    }
  }
  return Math.max(Math.min(coverState, $dataStates.length), 0);
};

Game_Battler.prototype.coverDying = function(target) {
  const states = this.states();
  let coverDying = 0;
  for (let i = 0; i < states.length; i++) {
    const state = states[i];
    if (state.coverDying !== undefined && state.coverDying > coverDying) {
      coverDying = state.coverDying;
      if (coverDying >= 100) {
        coverDying = 100;
        break;
      }
    }
  }
  if (coverDying === 0) {
    return target.isDying();
  }
  return target.hp <= (target.mhp * Math.round(coverDying * 100) / 10000);
};

UNH_CoverConditions.checkSubstitute = BattleManager.checkSubstitute;
BattleManager.checkSubstitute = function(target) {
  const action = this._action;
  const user = action.subject();
  if (user.isActor() === target.isActor()) {
    return false;
  }
  const coverDying = user.coverDying(target);
  const coverRandom = user.coverRandom();
  const coverState = user.coverState();
  const coverSingle = user.coverTarget();
  const coverHitTypes = user.coverAttack();
  const coverChance = user.coverChance();
  let isCover = coverDying;
  if (isCover) {
    if (!coverRandom) {
      isCover = !action.isForRandom();
    }
  }
  if (isCover) {
    if (coverSingle) {
      isCover = (action.makeTargets().length === 1);
    }
  }
  if (isCover) {
    if (coverState >= 1) {
      isCover = target.isStateAffected(coverState);
    }
  }
  if (isCover && coverHitTypes.length > 0) {
    let isHitTypeValid = false;
    for (const hitType of coverHitTypes) {
      if (hitType === 0) {
        isHitTypeValid = action.isCertainHit();
      } else if (hitType === 1) {
        isHitTypeValid = action.isPhysical();
      } else if (hitType === 2) {
        isHitTypeValid = action.isMagical();
      }
      if (!!isHitTypeValid) break;
    }
    isCover = isHitTypeValid;
  }
  if (isCover) {
    isCover = coverChance;
  }
  return isCover;
};

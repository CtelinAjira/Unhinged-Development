//=============================================================================
// Unhinged Development - Bleed Processing
// UNH_BleedProcess.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_BleedProcess = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [BleedProcess]
 * @author Unhinged Developer
 * @base UNH_MiscFunc
 * @orderAfter UNH_MiscFunc
 *
 * @help
 */
//=============================================================================

const UNH_BleedProcess = {};
UNH_BleedProcess.pluginName = 'UNH_BleedProcess';

Game_BattlerBase.prototype.bleedStates = function() {
  const user = this;
  this._bleedStacks = this._bleedStacks || [];
  let stateId;
  return this.states().filter(function(state) {
    if (!state) return false;
    stateId = state.id;
    if (!this._bleedStacks[stateId]) return false;
    if (typeof this._bleedStacks[stateId] !== 'number') return false;
    return (this._bleedStacks[stateId] > 0);
  });
};

Game_BattlerBase.prototype.getTotalBleed = function() {
  const user = this;
  this._bleedStacks = this._bleedStacks || [];
  return this._bleedStacks.reduce(function(r, bleed) {
    if (!bleed) return r;
    return r + bleed;
  });
};

Game_BattlerBase.prototype.getBleed = function(stateId) {
  if (!stateId) return this.getTotalBleed();
  if (typeof stateId !== 'number') return this.getTotalBleed();
  if (isNaN(stateId)) return this.getTotalBleed();
  const user = this;
  this._bleedStacks = this._bleedStacks || [];
  if (!this._bleedStacks[stateId]) {
    if (this.isStateAffected(stateId)) {
      this._bleedStacks[stateId] = undefined;
      if (Imported.VisuMZ_1_SkillsStatesCore) this.clearStateDisplay(stateId);
      this.removeState(stateId);
    }
    return 0;
  }
  if (Imported.VisuMZ_1_SkillsStatesCore) this.setStateDisplay(stateId, Math.round(this._bleedStacks[stateId]));
  return Math.round(this._bleedStacks[stateId]);
};

Game_BattlerBase.prototype.setBleed = function(stateId, value) {
  if (!stateId) return;
  if (typeof stateId !== 'number') return;
  if (isNaN(stateId)) return;
  const user = this;
  this._bleedStacks = this._bleedStacks || [];
  if (!value) {
    this._bleedStacks[stateId] = undefined;
    if (this.isStateAffected(stateId)) {
      if (Imported.VisuMZ_1_SkillsStatesCore) this.clearStateDisplay(stateId);
      this.removeState(stateId);
    }
  } else if (typeof value !== 'number') {
    this._bleedStacks[stateId] = undefined;
    if (this.isStateAffected(stateId)) {
      if (Imported.VisuMZ_1_SkillsStatesCore) this.clearStateDisplay(stateId);
      this.removeState(stateId);
    }
  } else if (isNaN(value)) {
    this._bleedStacks[stateId] = undefined;
    if (this.isStateAffected(stateId)) {
      if (Imported.VisuMZ_1_SkillsStatesCore) this.clearStateDisplay(stateId);
      this.removeState(stateId);
    }
  } else if (value <= 0) {
    this._bleedStacks[stateId] = undefined;
    if (this.isStateAffected(stateId)) {
      if (Imported.VisuMZ_1_SkillsStatesCore) this.clearStateDisplay(stateId);
      this.removeState(stateId);
    }
  } else {
    if (this.isStateResist(stateId)) return;
    if (!this.isStateAffected(stateId)) this.addState(stateId);
    const roundVal = Math.round(value);
    this._bleedStacks[stateId] = roundVal;
    if (Imported.VisuMZ_1_SkillsStatesCore) this.setStateDisplay(stateId, roundVal);
  }
};

Game_BattlerBase.prototype.addBleed = function(stateId, value, ignoreRate) {
  if (!stateId) stateId = 0;
  if (typeof stateId !== 'number') stateId = 0;
  if (isNaN(stateId)) stateId = 0;
  if (!value) return;
  if (typeof value !== 'number') return;
  if (isNaN(value)) return;
  ignoreRate = !!ignoreRate;
  const stateRate = ((ignoreRate) ? (1) : (this.stateRate(stateId)));
  if (stateRate <= 0) return;
  let bleedToAdd = value;
  if (!ignoreRate) {
    if (this.isStateResist(stateId)) {
      bleedToAdd = 0;
    } else {
      bleedToAdd *= stateRate;
    }
  }
  bleedToAdd = Math.round(bleedToAdd);
  const startBleed = user.getBleed(stateId);
  user.setBleed(stateId, startBleed + bleedToAdd);
};

Game_Action.prototype.applyBleed = function(value, target, affUser) {
  if (!value) return value;
  if (typeof value !== 'number') return value;
  if (isNaN(value)) return value;
  if (value <= 0) return value;
  affUser = !!affUser;
  const item = this.item();
  const user = this.subject();
  let isSkillIgnoreBleed;
  if (!!item) {
    if (!!item.meta) {
      isSkillIgnoreBleed = !!item.meta['Ignore Bleed']
    } else {
      isSkillIgnoreBleed = false;
    }
  } else {
    isSkillIgnoreBleed = false;
  }
  const isUserIgnoreBleed = user.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    return !!obj.meta['Ignore Bleed as User'];
  });
  const isTargetIgnoreBleed = target.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    return !!obj.meta['Ignore Bleed as Target'];
  });
  if (isSkillIgnoreBleed || isUserIgnoreBleed || isTargetIgnoreBleed) return value;
  let bleedStates;
  if (affUser) {
    bleedStates = JsonEx.makeDeepCopy(user.bleedStates());
  } else {
    bleedStates = JsonEx.makeDeepCopy(target.bleedStates());
  }
  if (bleedStates.length <= 0) return value;
  let stateId, curBleed;
  value = Math.round(value);
  for (const state of bleedStates) {
    if (!state) continue;
    stateId = state.id;
    if (affUser) {
      curBleed = user.getBleed(stateId);
    } else {
      curBleed = target.getBleed(stateId);
    }
    if (curBleed <= 0) continue;
    const bleedLoss = Math.min(value, curBleed);
    value -= bleedLoss;
    if (affUser) {
      user.addBleed(stateId, -bleedLoss);
    } else {
      target.addBleed(stateId, -bleedLoss);
    }
    if (value <= 0) {
      value = 0;
      break;
    }
  }
  return value;
};
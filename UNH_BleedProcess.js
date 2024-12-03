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
  } else {
    if (this.isStateResist(stateId)) return;
    if (Math.random() >= this.stateRate(stateId)) return;
    if (!this.isStateAffected(stateId)) this.addState(stateId);
    const roundVal = Math.round(value);
    this._bleedStacks[stateId] = roundVal;
    if (Imported.VisuMZ_1_SkillsStatesCore) this.setStateDisplay(stateId, roundVal);
  }
};

Game_BattlerBase.prototype.addBleed = function(stateId, value) {
  if (!stateId) stateId = 0;
  if (typeof stateId !== 'number') stateId = 0;
  if (isNaN(stateId)) stateId = 0;
  if (!value) return;
  if (typeof value !== 'number') return;
  if (isNaN(value)) return;
  const startBleed = user.getBleed(stateId);
  user.setBleed(stateId, startBleed + value);
};

Game_Action.prototype.applyBleed = function(value) {
  if (!value) return value;
  if (typeof value !== 'number') return value;
  if (isNaN(value)) return value;
  if (value <= 0) return value;
  const isSkillIgnoreBleed = this.subject().traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    return !!obj.meta['Ignore Bleed'];
  });
  const isUserIgnoreBleed = this.subject().traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    return !!obj.meta['Ignore Bleed as User'];
  });
  const isTargetIgnoreBleed = this.subject().traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    return !!obj.meta['Ignore Bleed as Target'];
  });
  if (isSkillIgnoreBleed || isUserIgnoreBleed || isTargetIgnoreBleed) return value;
  const bleedStates = JsonEx(target.bleedStates());
  if (bleedStates.length <= 0) return value;
  let stateId, curBleed;
  value = Math.round(value);
  for (const state of bleedStates) {
    if (!state) continue;
    stateId = state.id;
    curBleed = target.getBleed(stateId);
    if (curBleed <= 0) continue;
    const bleedLoss = Math.min(value, curBleed);
    value -= bleedLoss;
    target.addBleed(stateId, -bleedLoss);
    if (value <= 0) {
      value = 0;
      break;
    }
  }
  return value;
};
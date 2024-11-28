//=============================================================================
// Unhinged Development - Planeshard's Skill Functions
// UNH_PlaneshardFunctions.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_PlaneshardFunctions = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [PlaneshardFunctions]
 * @author Unhinged Developer
 * @base UNH_MiscFunc
 * @orderAfter UNH_MiscFunc
 *
 * @help
 */
//=============================================================================

const UNH_PlaneshardFunctions = {};
UNH_PlaneshardFunctions.pluginName = 'UNH_PlaneshardFunctions';

Game_BattlerBase.prototype.tempStates = function(note) {
  if (!Imported.UNH_PlaneshardResources) return [];
  if (!Imported.VisuMZ_1_SkillsStatesCore) return [];
  return this.states().filter(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    return !!state.meta[note];
  });
};

Game_BattlerBase.prototype.tempMpStates = function() {
  return this.tempStates('Temporary MP');
};

Game_BattlerBase.prototype.tempFpStates = function() {
  return this.tempStates('Temporary FP');
};

Game_BattlerBase.prototype.tempEpStates = function() {
  return this.tempStates('Temporary EP');
};

Game_BattlerBase.prototype.tempPpStates = function() {
  return this.tempStates('Temporary PP');
};

Game_BattlerBase.prototype.tempQpStates = function() {
  return this.tempStates('Temporary QP');
};

Game_BattlerBase.prototype.getTemp = function(states) {
  if (states === undefined) states = this.states();
  if (!Array.isArray(states)) states = this.states();
  if (states.length <= 0) return 0;
  return states.reduce(function(r, state) {
    if (!state) return r;
    if (isNaN(this.getStateDisplay(state.id))) return r;
    return r + Number(this.getStateDisplay(state.id));
  });
};

Game_BattlerBase.prototype.tempMp = function() {
  return this.getTemp(this.tempMpStates());
};

Game_BattlerBase.prototype.tempFp = function() {
  return this.getTemp(this.tempFpStates());
};

Game_BattlerBase.prototype.tempEp = function() {
  return this.getTemp(this.tempEpStates());
};

Game_BattlerBase.prototype.tempPp = function() {
  return this.getTemp(this.tempPpStates());
};

Game_BattlerBase.prototype.tempQp = function() {
  return this.getTemp(this.tempQpStates());
};

Game_BattlerBase.prototype.applyTemp = function(value, array) {
  if (array === undefined) array = this.states();
  if (!Array.isArray(array)) array = this.states();
  const states = JsonEx.makeDeepCopy(array);
  if (states.length <= 0) return value;
  let stateDisp;
  let temp;
  for (const state of states) {
    if (!state) continue;
    if (isNaN(this.getStateDisplay(state.id))) continue;
    stateDisp = Number(this.getStateDisplay(state.id));
    temp = Math.min(value, stateDisp);
    value -= temp;
    if (temp == stateDisp) {
      this.removeState(state.id);
    } else {
      this.setStateDisplay(state.id, stateDisp - temp);
    }
  }
  return value;
};

Game_BattlerBase.prototype.applyTempMp = function(value) {
  return this.applyTemp(value, this.tempMpStates());
};

Game_BattlerBase.prototype.applyTempFp = function(value) {
  return this.applyTemp(value, this.tempFpStates());
};

Game_BattlerBase.prototype.applyTempEp = function(value) {
  return this.applyTemp(value, this.tempEpStates());
};

Game_BattlerBase.prototype.applyTempPp = function(value) {
  return this.applyTemp(value, this.tempPpStates());
};

Game_BattlerBase.prototype.applyTempQp = function(value) {
  return this.applyTemp(value, this.tempQpStates());
};
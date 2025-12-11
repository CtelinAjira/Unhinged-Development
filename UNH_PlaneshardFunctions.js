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
 * @orderAfter UNH_PlaneshardResources
 *
 * @help
 */
//=============================================================================

const UNH_PlaneshardFunctions = {};
UNH_PlaneshardFunctions.pluginName = 'UNH_PlaneshardFunctions';

Object.defineProperties(Game_BattlerBase.prototype, {
  tempHp: {
    get: function() {
      return this.tempHp();
    }, configurable: true
  }, tempMp: {
    get: function() {
      return this.tempMp();
    }, configurable: true
  }
});

Game_BattlerBase.prototype.tempStates = function(note) {
  if (!UNH_MiscFunc.hasPlugin('UNH_PlaneshardResources')) return [];
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_SkillsStatesCore')) return [];
  return this.states().filter(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    return !!state.meta[note];
  });
};

Game_BattlerBase.prototype.getTemp = function(states) {
  if (!states) return 0;
  if (!Array.isArray(states)) return 0;
  if (states.length <= 0) return 0;
  return states.reduce(function(r, state) {
    if (!state) return r;
    if (!this.getStateDisplay(state.id)) return r;
    if (isNaN(this.getStateDisplay(state.id))) return r;
    return r + Number(this.getStateDisplay(state.id));
  });
};

Game_BattlerBase.prototype.applyTemp = function(value, array) {
  if (!value) return 0;
  if (typeof value !== 'number') return 0;
  if (isNaN(value)) return 0;
  if (!array) return value;
  if (!Array.isArray(array)) return value;
  if (array.length <= 0) return value;
  const states = JsonEx.makeDeepCopy(array);
  if (states.length <= 0) return value;
  let stateDisp;
  let temp;
  for (const state of states) {
    if (!state) continue;
    if (!this.getStateDisplay(state.id)) continue;
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

Game_BattlerBase.prototype.tempHpStates = function() {
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_3_AntiDmgBarriers')) return [];
  return this.getAntiDamageBarrierStates().filter(function(state) {
    const match = state.note.match(VisuMZ.AntiDmgBarriers.RegExp.AbsorbBarrier)
    if (!match) return false;
    if (match.length <= 0) return false;
    return true;
  });
};

Game_BattlerBase.prototype.tempHp = function() {
  return this.getTemp(this.tempHpStates());
};

Game_BattlerBase.prototype.tempMpStates = function() {
  return this.tempStates('Temporary MP');
};

Game_BattlerBase.prototype.tempMp = function() {
  return this.getTemp(this.tempMpStates());
};

Game_BattlerBase.prototype.applyTempMp = function(value) {
  return this.applyTemp(value, this.tempMpStates());
};

if (UNH_MiscFunc.hasPlugin('UNH_PlaneshardResources')) {
  for (const param of UNH_PlaneshardResources.NewParams) {
    const funcParam = param.Name.charAt(0).toUpperCase() + param.Name.slice(1).toLowerCase();
    const paramName = 'temp' + funcParam;
    const statesName = 'temp' + funcParam + 'States';
    const applyName = 'applyTemp' + funcParam;
    const tempName = 'Temporary ' + param.Name.toUpperCase();
    Object.defineProperty(Game_BattlerBase.prototype, paramName, {
      get: function() {
        return this[paramName]();
      },
      configurable: true
    });
    
    Game_BattlerBase.prototype[statesName] = function() {
      return this.tempStates(tempName);
    };
    
    Game_BattlerBase.prototype[paramName] = function() {
      return this.getTemp(this[statesName]());
    };
    
    Game_BattlerBase.prototype[applyName] = function(value) {
      return this.applyTemp(value, this[statesName]());
    };
  }
}
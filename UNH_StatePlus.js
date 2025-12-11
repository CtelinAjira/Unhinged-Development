//=============================================================================
// Unhinged Development - State Rate Plus
// UNH_StatePlus.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_StatePlus = true;

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter VisuMZ_0_CoreEngine
 * @orderAfter VisuMZ_1_SkillsStatesCore
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [StatePlus]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * Notetag Reminder
 * ============================================================================
 * 
 * Order of operations is Plus, then Rate, then Flat
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Unh State X Plus:Y>
 * - Use for Actors/Classes/Weapons/Armors/Enemies/States
 *   - Adds Y (JS Eval) to infliction chance for State X (Number)
 *   - If X is "All", instead applies to ALL states
 * 
 * <Unh State X Rate:Y>
 * - Use for Actors/Classes/Weapons/Armors/Enemies/States
 * - Multiplies infliction chance for State X (Number) by Y (JS Eval)
 *   - If X is "All", instead applies to ALL states
 * 
 * <Unh State X Flat:Y>
 * - Use for Actors/Classes/Weapons/Armors/Enemies/States
 * - Adds Y (JS Eval) to infliction chance for State X (Number)
 *   - If X is "All", instead applies to ALL states
 */
//=============================================================================

const UNH_StatePlus = {};
UNH_StatePlus.pluginName = 'UNH_StatePlus';

Game_BattlerBase.prototype.unhClearStateEff = function(type) {
  if (type === undefined) {
    this._unhCache = {};
  } else {
    if (this._unhCache === undefined) this._unhCache = {};
    if ((typeof type === 'number') || (typeof type === 'string')) {
      this._unhCache[type] = {};
    }
  }
};

Game_BattlerBase.prototype.unhInitStateEff = function(type) {
  if (this._unhCache === undefined) this.unhClearStateEff();
  if (this._unhCache[type] === undefined) this.unhClearStateEff(type);
};

Game_BattlerBase.prototype.unhHasStateEff = function(type, stateId) {
  this.unhInitStateEff(type);
  const eff = this._unhCache[type][stateId] || 0;
  if (typeof eff !== 'number') return false;
  if (isNaN(eff)) return false;
  return (eff !== 0);
};

Game_BattlerBase.prototype.unhGetStateEff = function(type, stateId) {
  this.unhInitStateEff(type);
  if (!this.unhHasStateEff(type, stateId)) return 0;
  return this._unhCache[type][stateId];
};

Game_BattlerBase.prototype.unhSetStateEff = function(type, stateId, value) {
  this.unhInitStateEff(type);
  if (value === undefined) {
    this._unhCache[type][stateId] = 0;
  } else if (isNaN(value)) {
    this._unhCache[type][stateId] = 0;
  } else {
    this._unhCache[type][stateId] = Number(value);
  }
};

Game_BattlerBase.prototype.unhStatePlus = function(stateId) {
  const type = '_statePlus';
  if (this.unhHasStateEff(type, stateId)) return this.unhGetStateEff(type, stateId);
  const metaStr = 'Unh State ' + stateId + ' Plus';
  const metaStr2 = 'Unh State All Plus';
  let stateMeta;
  const oneState = this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    try {
      stateMeta = eval(obj.meta[metaStr].trim());
      if ((typeof stateMeta !== 'number') || isNaN(stateMeta)) throw new Error('Not a Number');
      return r + stateMeta;
    } catch (e) {
      return r;
    }
  }, 0);
  const allState = this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    try {
      stateMeta = eval(obj.meta[metaStr2].trim());
      if ((typeof stateMeta !== 'number') || isNaN(stateMeta)) throw new Error('Not a Number');
      return r + stateMeta;
    } catch (e) {
      return r;
    }
  }, 0);
  this.unhSetStateEff(type, stateId, oneState + allState);
  return this.unhGetStateEff(type, stateId);
};

Game_BattlerBase.prototype.unhStateRate = function(stateId) {
  const type = '_stateRate';
  if (this.unhHasStateEff(type, stateId)) return this.unhGetStateEff(type, stateId);
  const metaStr = 'Unh State ' + stateId + ' Rate';
  const metaStr2 = 'Unh State All Rate';
  let stateMeta;
  const oneState = this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    try {
      stateMeta = eval(obj.meta[metaStr].trim());
      if ((typeof stateMeta !== 'number') || isNaN(stateMeta)) throw new Error('Not a Number');
      return r * stateMeta;
    } catch (e) {
      return r;
    }
  }, 1);
  const allState = this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    try {
      stateMeta = eval(obj.meta[metaStr2].trim());
      if ((typeof stateMeta !== 'number') || isNaN(stateMeta)) throw new Error('Not a Number');
      return r * stateMeta;
    } catch (e) {
      return r;
    }
  }, 1);
  this.unhSetStateEff(type, stateId, oneState * allState);
  return this.unhGetStateEff(type, stateId);
};

Game_BattlerBase.prototype.unhStateFlat = function(stateId) {
  const type = '_stateFlat';
  if (this.unhHasStateEff(type, stateId)) return this.unhGetStateEff(type, stateId);
  const metaStr = 'Unh State ' + stateId + ' Flat';
  const metaStr2 = 'Unh State All Flat';
  let stateMeta;
  const oneState = this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    try {
      stateMeta = eval(obj.meta[metaStr].trim());
      if ((typeof stateMeta !== 'number') || isNaN(stateMeta)) throw new Error('Not a Number');
      return r * stateMeta;
    } catch (e) {
      return r;
    }
  }, 0);
  const allState = this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    try {
      stateMeta = eval(obj.meta[metaStr2].trim());
      if ((typeof stateMeta !== 'number') || isNaN(stateMeta)) throw new Error('Not a Number');
      return r + stateMeta;
    } catch (e) {
      return r;
    }
  }, 0);
  this.unhSetStateEff(type, stateId, oneState + allState);
  return this.unhGetStateEff(type, stateId);
};

UNH_StatePlus.BattlerBase_refresh = Game_BattlerBase.prototype.refresh;
Game_BattlerBase.prototype.refresh = function() {
  UNH_StatePlus.BattlerBase_refresh.call(this);
  this.unhClearStateEff();
};

UNH_StatePlus.BattlerBase_stateRate = Game_BattlerBase.prototype.stateRate;
Game_BattlerBase.prototype.stateRate = function(stateId) {
  let stateRate = UNH_StatePlus.BattlerBase_stateRate.call(this, stateId);
  stateRate += this.unhStatePlus(stateId);
  stateRate *= this.unhStateRate(stateId);
  stateRate += this.unhStateFlat(stateId);
  return stateRate;
};
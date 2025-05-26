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

Game_BattlerBase.prototype.unhStatePlus = function(stateId) {
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
  return oneState + allState;
};

Game_BattlerBase.prototype.unhStateRate = function(stateId) {
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
  return oneState + allState;
};

Game_BattlerBase.prototype.unhStateFlat = function(stateId) {
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
  return oneState + allState;
};

UNH_StatePlus.BattlerBase_stateRate = Game_BattlerBase.prototype.stateRate;
Game_BattlerBase.prototype.stateRate = function(stateId) {
  let stateRate = UNH_StatePlus.BattlerBase_stateRate.call(this, stateId);
  stateRate += this.unhStatePlus(stateId);
  stateRate *= this.unhStateRate(stateId);
  stateRate += this.unhStateFlat(stateId);
  return stateRate;
};
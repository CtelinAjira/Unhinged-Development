//=============================================================================
// Unhinged Development - Variance Effects
// UNH_VarianceEffects.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VarianceEffects]
 * @author Unhinged Developer
 * @base UNH_MiscFunc
 * @orderAfter UNH_MiscFunc
 *
 * @help
 * ============================================================================
 * New Notetags
 * ============================================================================
 *
 * <Amplify Damage>
 * - Use for States
 * - Increases all variance for damage, using the old maximum as the new 
 *   average
 *   - Example: amplifying a skill w/ 100 damage and 20% variance deals 80-160 
 *     damage
 *
 * <Amplify Damage:X>
 * - Use for States
 * - As <Amplify Damage>, but accepts X as a JS Eval to determine conditions
 *   - X must eval to a boolean value
 *
 * <Maximize Damage>
 * - Use for States
 * - Removes all variance for damage, and gives you the maximum value instead
 *   - Example: maximizing a skill w/ 100 damage and 20% variance deals 120 
 *     damage
 *   - Stacks with <Amplify Damage> by using the *amplified* maximum
 *
 * <Maximize Damage:X>
 * - Use for States
 * - As <Maximize Damage>, but accepts X as a JS Eval to determine conditions
 *   - X must eval to a boolean value
 *
 * <Reckless Damage:X>
 * - Use for States
 * - Rolls variance multiple times
 *   - If X evals to a positive number, roll X times and take the highest value
 *   - If X evals to a negative number, roll -X times and take the lowest value
 *
 * ============================================================================
 * Note from Unhinged Development
 * ============================================================================
 *
 * If you intend to use this, please be wary of the following function:
 *
 * action.applyVariance(damage, variance)
 *
 * Place this plugin before any other plugins that alias this function, and 
 * after any that overwrite it entirely.
 */
//=============================================================================

const UNH_VarianceEffects = {};
UNH_VarianceEffects.pluginName = 'UNH_VarianceEffects';

Game_Action.prototype.unhIsVarMeta = function(note) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  let meta;
  return user.traitObjects().some(function(obj) {
    if (!obj) return false;
    meta = obj.meta;
    if (!meta) return false;
    if (!meta[note]) return false;
    return !!eval(meta[note]);
  });
};

Game_Action.prototype.unhIsMaxCast = function() {
  const note = 'Maximize Damage';
  return this.unhIsVarMeta(note);
};

Game_Action.prototype.unhIsAmpCast = function() {
  const note = 'Amplify Damage';
  return this.unhIsVarMeta(note);
};

Game_Action.prototype.unhRecklessCheck = function() {
  const note = 'Reckless Damage';
  const item = this.item();
  const user = this.subject();
  let meta, noteEval;
  return user.traitObjects().some(function(obj) {
    if (!obj) return 0;
    meta = obj.meta;
    if (!meta) return 0;
    if (!meta[note]) return 0;
    try {
      noteEval = eval(meta[note]);
      if (typeof noteEval !== 'number') return 0;
      if (isNaN(noteEval)) return 0;
      return Math.round(noteEval);
    } catch (e) {
      return 0;
    }
  });
};

Game_Action.prototype.applyVariance = function(damage, variance) {
  const retArr = [];
  const maximizeCheck = this.unhIsMaxCast();
  const amplifyCheck = this.unhIsAmpCast();
  const recklessCheck = this.unhRecklessCheck();
  const recklessCount = Math.abs(recklessCheck) + 1;
  const amp = Math.floor(Math.max((Math.abs(damage) * variance) / 100, 0));
  let v;
  if (maximizeCheck && amplifyCheck) {
    if (damage >= 0) {
      return (damage + (amp * 3));
    } else {
      return (damage - (amp * 3));
    }
  } else if (maximizeCheck) {
    if (damage >= 0) {
      return (damage + amp);
    } else {
      return (damage - amp);
    }
  } else if (amplifyCheck) {
    for (let i = 0; i < recklessCount; i++) {
      v = Math.randomInt((2 * amp) + 1) + Math.randomInt((2 * amp) + 1) - amp;
      retArr.push(damage >= 0 ? damage + v : damage - v);
    }
    if (recklessCheck > 0) {
      return Math.max(...retArr);
    } else {
      return Math.min(...retArr);
    }
  } else {
    for (let i = 0; i < recklessCount; i++) {
      v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
      retArr.push(damage >= 0 ? damage + v : damage - v);
    }
    if (recklessCheck > 0) {
      return Math.max(...retArr);
    } else {
      return Math.min(...retArr);
    }
  }
};
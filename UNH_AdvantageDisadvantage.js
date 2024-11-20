//=============================================================================
// Unhinged Development - Advantage and Disadvantage
// UNH_AdvantageDisadvantage.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [AdvantageDisadvantage]
 * @author Unhinged Developer
 * @orderBefore VisuMZ_0_CoreEngine
 *
 * @param IncludeRemoval
 * @text Include Removal?
 * @desc Apply RNG to the removal of effects too?
 * @type boolean
 * @on Include
 * @off Exclude
 * @default false
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 *
 * For those familiar with D&D 5e, you might already be familiar with Advantage 
 * and Disadvantage.  For everyone else, Advantage is roll-twice-take-better, 
 * and Disadvantage is roll-twice-take-worse.  This plugin adds that idea to 
 * RPG Maker specifically when it comes to resisting status effects.
 * 
 * Advantage and Disadvantage will force an action to check against state rates 
 * multiple times.  If the user has Advantage on infliction and/or the target 
 * has Disadvantage on resistance, only one of the checks needs to pass.  If 
 * the user has Disadvantage on infliction and/or the target has Advantage on 
 * resistance, ALL of the checks must pass.
 *
 * ============================================================================
 * Deviation - Stacking Advantage/Disadvantage
 * ============================================================================
 * 
 * In D&D, this is a binary, but I'll be building this so that they stack 
 * instead.  For example, 2 sources of advantage on resistance will make your 
 * attacker's infliction harder than only 1 source would.
 *
 * Similarly, Advantage and Disadvantage usually cancel out if both are applied 
 * simultaneously, but I'll be building this so that they only cancel out per 
 * source.  For example, 3 sources of advantage and 1 source of disadvantage on 
 * resistance will roughly equate to 2 sources of advantage.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * <AdvInflict:X>
 * - Use for States
 * - This state is now X sources of advantage on status infliction (Javascript)
 *   - user - the battler doing actions
 *   - target - the battler taking hits
 * - CASE SENSITIVE
 *
 * <AdvResist:X>
 * - Use for States
 * - This state is now X sources of advantage on status resistance (Javascript)
 *   - user - the battler doing actions
 *   - target - the battler taking hits
 * - CASE SENSITIVE
 *
 * <DisInflict:X>
 * - Use for States
 * - This state is now X sources of disadvantage on status infliction (Javascript)
 *   - user - the battler doing actions
 *   - target - the battler taking hits
 * - CASE SENSITIVE
 *
 * <DisResist:X>
 * - Use for States
 * - This state is now X sources of disadvantage on status resistance (Javascript)
 *   - user - the battler doing actions
 *   - target - the battler taking hits
 * - CASE SENSITIVE
 */
//=============================================================================

const UNH_AdvantageDisadvantage = {};
UNH_AdvantageDisadvantage.pluginName = 'UNH_AdvantageDisadvantage';
UNH_AdvantageDisadvantage.parameters = PluginManager.parameters(UNH_AdvantageDisadvantage.pluginName);
UNH_AdvantageDisadvantage.IncludeRemoval = !!UNH_AdvantageDisadvantage.parameters['IncludeRemoval'];

/*Game_BattlerBase.prototype.targetAdvCount = function() {
  let advCount = 0;
  if (this.states().length > 0) {
    for (const state in this.states()) {
      if (!!state.meta) {
        if (!!state.meta.AdvResist) {
          if (typeof state.meta.AdvResist === 'number') {
            advCount += state.meta.AdvResist;
          } else {
            advCount++;
          }
        }
        if (!!state.meta.DisResist) {
          if (typeof state.meta.DisResist === 'number') {
            advCount -= state.meta.DisResist;
          } else {
            advCount--;
          }
        }
      }
    }
  }
  return advCount;
};

Game_BattlerBase.prototype.userAdvCount = function() {
  let advCount = 0;
  if (this.states().length > 0) {
    for (const state in this.states()) {
      if (!!state.meta) {
        if (!!state.meta.AdvInflict) {
          if (typeof state.meta.AdvInflict === 'number') {
            advCount += state.meta.AdvInflict;
          } else {
            advCount++;
          }
        }
        if (!!state.meta.DisInflict) {
          if (typeof state.meta.DisInflict === 'number') {
            advCount -= state.meta.DisInflict;
          } else {
            advCount--;
          }
        }
      }
    }
  }
  return advCount;
};

Game_BattlerBase.prototype.advCount = function(target) {
  return this.userAdvCount() - target.targetAdvCount();
};*/

Game_BattlerBase.prototype.advCount = function(target) {
  const user = this;
  let advCount = 0;
  const userAdvStates = this.states().filter(function(state) {
    if (!state.meta) return false;
    if (!!state.meta.AdvInflict) return true;
    if (!!state.meta.DisInflict) return true;
    return false;
  });
  const targetAdvStates = target.states().filter(function(state) {
    if (!state.meta) return false;
    if (!!state.meta.AdvResist) return true;
    if (!!state.meta.DisResist) return true;
    return false;
  });
  if (userAdvStates.length > 0) {
    for (const state in userAdvStates) {
      const evalAdv = eval(state.meta.AdvInflict);
      const evalDis = eval(state.meta.DisInflict);
      if (!!evalAdv) {
        if (typeof evalAdv === 'number') {
          advCount += Math.max(evalAdv, 0);
        } else {
          advCount++;
        }
      }
      if (!!evalDis) {
        if (typeof evalDis === 'number') {
          advCount -= Math.max(evalDis, 0);
        } else {
          advCount--;
        }
      }
    }
  }
  if (targetAdvStates.length > 0) {
    for (const state in targetAdvStates) {
      const evalAdv = eval(state.meta.AdvResist);
      const evalDis = eval(state.meta.DisResist);
      if (!!evalAdv) {
        if (typeof evalAdv === 'number') {
          advCount -= Math.max(evalAdv, 0);
        } else {
          advCount--;
        }
      }
      if (!!evalDis) {
        if (typeof evalDis === 'number') {
          advCount += Math.max(evalDis, 0);
        } else {
          advCount++;
        }
      }
    }
  }
  return advCount;
};

UNH_AdvantageDisadvantage.Action_itemEffectAddAttackState = Game_Action.prototype.itemEffectAddAttackState;
Game_Action.prototype.itemEffectAddAttackState = function(target, effect) {
  const user = this.subject();
  const advCount = user.advCount(target);
  for (const stateId of user.attackStates()) {
    let chance = effect.value1;
    chance *= target.stateRate(stateId);
    chance *= this.subject().attackStatesRate(stateId);
    chance *= this.lukEffectRate(target);
    if (advCount > 0) {
      chance = 1 - Math.pow(1 - chance, advCount + 1);
    } else if (advCount < 0) {
      chance = Math.pow(chance, Math.abs(advCount) + 1);
    }
    if (Math.random() < chance) {
      target.addState(stateId);
      this.makeSuccess(target);
    }
  }
};

UNH_AdvantageDisadvantage.Action_itemEffectAddNormalState = Game_Action.prototype.itemEffectAddNormalState;
Game_Action.prototype.itemEffectAddNormalState = function(target, effect) {
  const user = this.subject();
  const advCount = user.advCount(target);
  let chance = effect.value1;
  chance *= target.stateRate(effect.dataId);
  chance *= this.lukEffectRate(target);
  if (advCount > 0) {
    chance = 1 - Math.pow(1 - chance, advCount + 1);
  } else if (advCount < 0) {
    chance = Math.pow(chance, Math.abs(advCount) + 1);
  }
  if (Math.random() < chance) {
    target.addState(effect.dataId);
    this.makeSuccess(target);
  }
};

Game_Action.prototype.itemEffectAddDebuff = function(target, effect) {
  const user = this.subject();
  const advCount = user.advCount(target);
  let chance = target.debuffRate(effect.dataId) * this.lukEffectRate(target);
  if (advCount > 0) {
    chance = 1 - Math.pow(1 - chance, advCount + 1);
  } else if (advCount < 0) {
    chance = Math.pow(chance, Math.abs(advCount) + 1);
  }
  if (Math.random() < chance) {
    target.addDebuff(effect.dataId, effect.value1);
    this.makeSuccess(target);
  }
};

if (!!UNH_AdvantageDisadvantage.IncludeRemoval) {

UNH_AdvantageDisadvantage.Action_itemEffectRemoveState = Game_Action.prototype.itemEffectRemoveState;
Game_Action.prototype.itemEffectRemoveState = function(target, effect) {
  const user = this.subject();
  const advCount = user.advCount(target);
  let chance = effect.value1;
  chance *= this.lukEffectRate(target);
  if (advCount > 0) {
    chance = 1 - Math.pow(1 - chance, advCount + 1);
  } else if (advCount < 0) {
    chance = Math.pow(chance, Math.abs(advCount) + 1);
  }
  if (Math.random() < chance) {
    target.removeState(effect.dataId);
    this.makeSuccess(target);
  }
};

Game_Action.prototype.itemEffectRemoveBuff = function(target, effect) {
  const user = this.subject();
  const advCount = user.advCount(target);
  if (target.isBuffAffected(effect.dataId)) {
    let chance = target.debuffRate(effect.dataId) * this.lukEffectRate(target);
    if (advCount > 0) {
      chance = 1 - Math.pow(1 - chance, advCount + 1);
    } else if (advCount < 0) {
      chance = Math.pow(chance, Math.abs(advCount) + 1);
    }
    if (Math.random() < chance) {
      target.removeBuff(effect.dataId);
      this.makeSuccess(target);
    }
  }
};

}

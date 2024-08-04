//=============================================================================
// Unhinged Development - Aggro Levels
// UNH_AggroLevels.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter UNH_BleedStacks
 * @orderAfter VisuMZ_0_CoreEngine
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [AggroLevels]
 * @author Unhinged Developer
 *
 * @param BaseAggro
 * @text Base Aggro
 * @desc The aggro value that corresponds to 100% TGR
 * @type string
 * @default 50 * user.mhp / currentClass.params[0][1]
 *
 * @param HurtingAggro
 * @text Hurting Aggro
 * @desc The amount of aggro each point of damage generates
 * @type number
 * @default 1
 *
 * @param HealingAggro
 * @text Healing Aggro
 * @desc The amount of aggro each point of healing generates
 * @type number
 * @default 2
 *
 * @param HPMult
 * @text HP Damage Multiplier
 * @desc The multiplier applied to aggro from HP damage
 * @type number
 * @default 1
 *
 * @param MPMult
 * @text MP Damage Multiplier
 * @desc The multiplier applied to aggro from MP damage
 * @type number
 * @default 1
 *
 * @param isTaunt
 * @text Include Taunts
 * @desc Should this plugin include taunts?
 * @type boolean
 * @default false
 *
 * @param isVoke
 * @text Include Provocation
 * @desc Should this plugin include provoke effects?
 * @type boolean
 * @default false
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Have you ever wanted your attacks to get the enemy's attention?  VS too 
 * opaque for you?  Here's an answer!
 *
 * Damage and healing now dynamically alter your TGR via a new variable called 
 * Base Aggro!  And you can manipulate how it accumulates.
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <unhAggroPlus:X>
 * <unhAggroRate:X>
 * <unhAggroFlat:X>
 * - Use for Actors/Skills/Weapons/Armors/Enemies/States
 * - Manipulates TGR changes (X is a Number)
 *   - delta_TGR = ((damage_dealt + unhAggroPlus) * unhAggroRate) + unhAggroFlat
 * <unhAddUserAggro:X>
 * - Use for Skills
 * - Adds X to the user's aggro (X is a JS formula)
 *   - user - the user
 * <unhAddTargetAggro:X>
 * - Use for Skills
 * - Adds X to the target's aggro (X is a JS formula)
 *   - user - the user
 *   - target - the target
 * <unhTaunt>
 * - Use for States
 * - Forces all enemy attacks to target the battler afflicted with this state
 * <unhProvoke>
 * - Use for States
 * - Forces all the afflicted battler's attacks to target the state's source
 * 
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * $gameParty.unhMaxAggro()
 * $gameTroop.unhMaxAggro()
 * - returns the highest aggro total for the chosen unit
 * battler.unhAggroBase()
 * - returns the current aggro total for the battler
 * battler.unhAggroPlus(target)
 * action.unhAggroPlus(target)
 * - returns the current total for (unhAggroPlus)
 * battler.unhAggroRate(target)
 * action.unhAggroRate(target)
 * - returns the current total for (unhAggroRate)
 * battler.unhAggroFlat(target)
 * action.unhAggroFlat(target)
 * - returns the current total for (unhAggroFlat)
 * battler.unhHpMult()
 * - returns the multiplier for aggro from HP damage
 * battler.unhMpMult()
 * - returns the multiplier for aggro from MP damage
 * battler.unhSetAggro()
 * - resets the target's TGR to 100%
 * battler.unhSetAggro(X)
 * - sets the target's Base Aggro to X (Number)
 * battler.unhAddAggro(target, X)
 * battler.unhAddAggro(target, X, false)
 * - increases the target's Base Aggro by X (Number)
 *   - value is modified by plus/rate/flat
 * battler.unhAddAggro(target, X, true)
 * - increases the target's Base Aggro by X (Number)
 *   - value is NOT modified by plus/rate/flat
 */
//=============================================================================

const UNH_AggroLevels = {};
UNH_AggroLevels.pluginName = 'UNH_AggroLevels';
UNH_AggroLevels.parameters = PluginManager.parameters(UNH_AggroLevels.pluginName);
UNH_AggroLevels.BaseAggro = String(UNH_AggroLevels.parameters['BaseAggro'] || '0');
UNH_AggroLevels.HurtingAggro = Number(UNH_AggroLevels.parameters['HurtingAggro'] || 0);
UNH_AggroLevels.HealingAggro = Number(UNH_AggroLevels.parameters['HealingAggro'] || 0);
UNH_AggroLevels.HPMult = Number(UNH_AggroLevels.parameters['HPMult'] || 0);
UNH_AggroLevels.MPMult = Number(UNH_AggroLevels.parameters['MPMult'] || 0);
UNH_AggroLevels.isTaunt = !!UNH_AggroLevels.parameters['isTaunt'];
UNH_AggroLevels.isVoke = !!UNH_AggroLevels.parameters['isVoke'];

if (!!UNH_AggroLevels.isTaunt) {
  UNH_AggroLevels.BattlerManager_startAction_taunt = BattleManager.startAction;
  BattleManager.startAction = function() {
    const subject = this._subject;
    const action = subject.currentAction();
    const foes = action.opponentsUnit().aliveMembers();
    UNH_AggroLevels.BattlerManager_startAction_taunt.call(this);
    if (action.isForOpponent() && action.needsSelection()) {
      const tauntTargets = [];
      for (const member of foes) {
        const tauntStates = JsonEx.makeDeepCopy(member.states()).filter(function() {
          if (!state.meta) return false;
          if (!state.meta.unhTaunt) return false;
          return true;
        });
        if (tauntStates.length > 0) {
          tauntTargets.push(member.index());
        }
      }
      if (tauntTargets.length > 0) {
        action.setTarget(tauntTargets[Math.randomInt(tauntTargets.length)]);
      }
    }
  };
}

if (!!UNH_AggroLevels.isVoke) {
  if (!Imported.VisuMZ_1_SkillsStatesCore) {
    UNH_AggroLevels.Battler_onBattleEnd = Game_Battler.prototype.onBattleEnd;
    Game_Battler.prototype.onBattleEnd = function () {
      UNH_AggroLevels.Battler_onBattleEnd.call(this);
      this.clearAllStateOrigins();
    };

    UNH_AggroLevels.Action_itemEffectAddAttackState = Game_Action.prototype.itemEffectAddAttackState;
    Game_Action.prototype.itemEffectAddAttackState = function(target, effect) {
      for (const stateId of this.subject().attackStates()) {
        target.setStateOrigin(stateId, this.subject());
      }
      UNH_AggroLevels.Action_itemEffectAddAttackState.call(this, target, effect);
    };

    UNH_AggroLevels.Action_itemEffectAddNormalState = Game_Action.prototype.itemEffectAddNormalState;
    Game_Action.prototype.itemEffectAddNormalState = function(target, effect) {
      target.setStateOrigin(effect.dataId, this.subject());
      UNH_AggroLevels.Action_itemEffectAddNormalState.call(this, target, effect);
    };

    Game_BattlerBase.prototype.getStateOrigin = function (stateId) {
      this._stateOrigin = this._stateOrigin || {};
      this._stateOrigin[stateId] = this._stateOrigin[stateId] || this;
      return this._stateOrigin[stateId];
    };

    Game_BattlerBase.prototype.setStateOrigin = function (stateId, origin) {
      this._stateOrigin = this._stateOrigin || {};
      this._stateOrigin[stateId] = !!origin ? this : origin;
    };

    Game_BattlerBase.prototype.clearStateOrigin = function (stateId) {
      this._stateOrigin = this._stateOrigin || {};
      this._stateOrigin[stateId] = undefined;
    };

    Game_BattlerBase.prototype.clearAllStateOrigins = function () {
      this._stateOrigin = {};
    };
  }

  UNH_AggroLevels.BattlerManager_startAction_voke = BattleManager.startAction;
  BattleManager.startAction = function() {
    const subject = this._subject;
    const action = subject.currentAction();
    const foes = action.opponentsUnit().aliveMembers();
    UNH_AggroLevels.BattlerManager_startAction_voke.call(this);
    if (action.isForOpponent() && action.needsSelection()) {
      const vokeOrigins = [];
      const vokeStates = JsonEx.makeDeepCopy(subject.states()).filter(function(state) {
        if (!state.meta) return false;
        if (!state.meta.unhProvoke) return false;
        return true;
      });
      for (const state of vokeStates) {
        const origin = subject.getStateOrigin(state.id);
        if (origin.isActor() === subject.isActor()) continue;
        vokeOrigins.push(origin.index());
      }
      if (vokeOrigins.length > 0) {
        action.setTarget(vokeOrigins[Math.randomInt(vokeOrigins.length)]);
      }
    }
  };
}

Game_BattlerBase.prototype.unhDefaultAggro = function() {
  const user = this;
  const currentClass = user.currentClass();
  return eval(UNH_AggroLevels.BaseAggro);
};

Game_BattlerBase.prototype.unhDamageMult = function(value) {
  if (value < 0) {
    return UNH_AggroLevels.HealingAggro;
  } else {
    return UNH_AggroLevels.HealingAggro;
  }
};

Game_BattlerBase.prototype.unhInitAggro = function() {
  this._unhAggroBase = this.unhDefaultAggro();
};

Game_BattlerBase.prototype.unhAggroBase = function() {
  if (this._unhAggroBase === undefined) this.unhInitAggro();
  return this._unhAggroBase;
};

Game_Unit.prototype.unhMaxAggro = function() {
  let maxAggro = 0;
  for (const member of this.aliveMembers()) {
    maxAggro = Math.max(member.unhAggroBase(), maxAggro);
  }
  return maxAggro;
};

Game_BattlerBase.prototype.unhAggroPlus = function(target) {
  const user = this;
  let aggroPlus = 0;
  for (const state of this.states()) {
    if (!state.meta) continue;
    if (!state.meta.unhAggroPlus) continue;
    aggroPlus += eval(state.meta.unhAggroPlus);
  }
  return aggroPlus;
};

Game_Enemy.prototype.unhAggroPlus = function(target) {
  const user = this;
  let aggroPlus = Game_BattlerBase.prototype.unhAggroPlus.call(this);
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.unhAggroPlus) {
      aggroPlus += eval(this.enemy().meta.unhAggroPlus);
    }
  }
  return aggroPlus;
};

Game_Actor.prototype.unhAggroPlus = function(target) {
  const user = this;
  let aggroPlus = Game_BattlerBase.prototype.unhAggroPlus.call(this);
  if (!!this.actor().meta) {
    if (!!this.actor().meta.unhAggroPlus) {
      aggroPlus += eval(this.actor().meta.unhAggroPlus);
    }
  }
  for (const equip of this.equips()) {
    if (!equip.meta) continue;
    if (!equip.meta.unhAggroPlus) continue;
    aggroPlus += eval(equip.meta.unhAggroPlus);
  }
  return aggroPlus;
};

Game_Action.prototype.unhAggroPlus = function(target) {
  const user = this.subject();
  let aggroPlus = user.unhAggroPlus();
  const item = this.item();
  if (!!item.meta) {
    if (!!item.meta.unhAggroPlus) {
      aggroPlus += eval(item.meta.unhAggroPlus);
    }
  }
  return aggroPlus;
};

Game_BattlerBase.prototype.unhAggroRate = function(target) {
  const user = this;
  let aggroRate = 1;
  for (const state of this.states()) {
    if (!state.meta) continue;
    if (!state.meta.unhAggroRate) continue;
    aggroRate *= eval(state.meta.unhAggroRate);
  }
  return aggroRate;
};

Game_Enemy.prototype.unhAggroRate = function(target) {
  const user = this;
  let aggroRate = Game_BattlerBase.prototype.unhAggroRate.call(this);
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.unhAggroRate) {
      aggroRate *= eval(this.enemy().meta.unhAggroRate);
    }
  }
  return aggroRate;
};

Game_Actor.prototype.unhAggroRate = function(target) {
  const user = this;
  let aggroRate = Game_BattlerBase.prototype.unhAggroRate.call(this);
  if (!!this.actor().meta) {
    if (!!this.actor().meta.unhAggroRate) {
      aggroRate *= eval(this.actor().meta.unhAggroRate);
    }
  }
  for (const equip of this.equips()) {
    if (!equip.meta) continue;
    if (!equip.meta.unhAggroRate) continue;
    aggroRate *= eval(equip.meta.unhAggroRate);
  }
  return aggroRate;
};

Game_Action.prototype.unhAggroRate = function(target) {
  const user = this.subject();
  let aggroRate = user.unhAggroRate();
  const item = this.item();
  if (!!item.meta) {
    if (!!item.meta.unhAggroRate) {
      aggroRate *= eval(item.meta.unhAggroRate);
    }
  }
  return aggroRate;
};

Game_BattlerBase.prototype.unhAggroFlat = function(target) {
  const user = this;
  let aggroFlat = 0;
  for (const state of this.states()) {
    if (!state.meta) continue;
    if (!state.meta.unhAggroFlat) continue;
    aggroFlat += eval(state.meta.unhAggroFlat);
  }
  return aggroFlat;
};

Game_Enemy.prototype.unhAggroFlat = function(target) {
  const user = this;
  let aggroFlat = Game_BattlerBase.prototype.unhAggroFlat.call(this);
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.unhAggroFlat) {
      aggroFlat += eval(this.enemy().meta.unhAggroFlat);
    }
  }
  return aggroFlat;
};

Game_Actor.prototype.unhAggroFlat = function(target) {
  const user = this;
  let aggroFlat = Game_BattlerBase.prototype.unhAggroFlat.call(this);
  if (!!this.actor().meta) {
    if (!!this.actor().meta.unhAggroFlat) {
      aggroFlat += eval(this.actor().meta.unhAggroFlat);
    }
  }
  for (const equip of this.equips()) {
    if (!equip.meta) continue;
    if (!equip.meta.unhAggroFlat) continue;
    aggroFlat += eval(equip.meta.unhAggroFlat);
  }
  return aggroFlat;
};

Game_Action.prototype.unhAggroFlat = function(target) {
  const user = this.subject();
  let aggroFlat = user.unhAggroFlat();
  const item = this.item();
  if (!!item.meta) {
    if (!!item.meta.unhAggroFlat) {
      aggroFlat += eval(item.meta.unhAggroFlat);
    }
  }
  return aggroFlat;
};

Game_BattlerBase.prototype.unhSetAggro = function(value) {
  if (value === undefined) value = UNH_AggroLevels.BaseAggro;
  if (typeof value !== 'number') value = UNH_AggroLevels.BaseAggro;
  this._unhAggroBase = Math.max(Math.round(value), 0);
};

Game_BattlerBase.prototype.unhAddAggro = function(target, value, ignoreRates) {
  if (value === undefined) value = 0;
  if (typeof value !== 'number') value = 0;
  if (!ignoreRates) {
    value += this.unhAggroPlus(target);
    value *= this.unhAggroRate(target);
    value += this.unhAggroFlat(target);
  }
  value = Math.round(value);
  this.unhSetAggro(value + this.unhAggroBase());
};

Game_Action.prototype.unhAddAggro = function(target, value, ignoreRates) {
  if (value === undefined) value = 0;
  if (typeof value !== 'number') value = 0;
  if (!ignoreRates) {
    value += this.unhAggroPlus(target);
    value *= this.unhAggroRate(target);
    value += this.unhAggroFlat(target);
  }
  value = Math.round(value);
  this.subject().unhSetAggro(value + this.unhAggroBase());
};

Game_BattlerBase.prototype.unhHpMult = function() {
  return UNH_AggroLevels.HPMult;
};

Game_BattlerBase.prototype.unhMpMult = function() {
  return UNH_AggroLevels.MPMult;
};

Game_BattlerBase.prototype.unhAggroMult = function() {
  return this.unhAggroBase() / this.unhDefaultAggro();
};

UNH_AggroLevels.Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function(advantageous) {
  UNH_AggroLevels.Battler_onBattleStart.call(this, advantageous);
  this.unhInitAggro();
};

UNH_AggroLevels.Battler_onBattleEnd = Game_Battler.prototype.onBattleEnd;
Game_Battler.prototype.onBattleEnd = function() {
  UNH_AggroLevels.Battler_onBattleEnd.call(this);
  this.unhInitAggro();
};

UNH_AggroLevels.Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  UNH_AggroLevels.Action_apply.call(this);
  if (!!item.meta) {
    if (!!item.meta.unhAddUserAggro) {
      user.unhAddAggro(target, eval(item.meta.unhAddUserAggro), false);
    }
    if (!!item.meta.unhAddTargetAggro) {
      target.unhAddAggro(target, eval(item.meta.unhAddTargetAggro), false);
    }
  }
};

UNH_AggroLevels.Action_executeHpDamage = Game_Action.prototype.executeHpDamage;
Game_Action.prototype.executeHpDamage = function(target, value) {
  let aggro = value;
  aggro *= this.subject().unhHpMult();
  aggro *= this.subject().unhDamageMult(aggro);
  if (this.isDrain()) aggro *= 2;
  this.unhAddAggro(target, Math.abs(aggro));
  UNH_AggroLevels.Action_executeHpDamage.call(this, target, value);
};

UNH_AggroLevels.Action_executeMpDamage = Game_Action.prototype.executeMpDamage;
Game_Action.prototype.executeMpDamage = function(target, value) {
  let aggro = value;
  aggro *= this.subject().unhMpMult();
  aggro *= this.subject().unhDamageMult(aggro);
  if (this.isDrain()) aggro *= 2;
  this.unhAddAggro(target, Math.abs(aggro));
  UNH_AggroLevels.Action_executeMpDamage.call(this, target, value);
};

UNH_AggroLevels.Action_itemEffectRecoverHp = Game_Action.prototype.itemEffectRecoverHp;
Game_Action.prototype.itemEffectRecoverHp = function(target, effect) {
  let aggro = (target.mhp * effect.value1 + effect.value2) * target.rec;
  if (!!UNH_RecoveryElements) {
    if (UNH_RecoveryElements.RecHpEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecHpEle);
    if (this.isItem()) {
      aggro *= this.subject().pha;
      if (UNH_RecoveryElements.RecItEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecItEle);
    } else {
      if (UNH_RecoveryElements.RecSkEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecSkEle);
    }
  } else {
    if (this.isItem()) {
      aggro *= this.subject().pha;
    }
  }
  aggro = Math.floor(aggro);
  aggro *= this.subject().unhHpMult();
  aggro *= this.subject().unhDamageMult(-aggro);
  this.unhAddAggro(target, Math.abs(aggro));
  UNH_AggroLevels.Action_itemEffectRecoverHp.call(this, target, effect);
};

UNH_AggroLevels.Action_itemEffectRecoverMp = Game_Action.prototype.itemEffectRecoverMp;
Game_Action.prototype.itemEffectRecoverMp = function(target, effect) {
  let aggro = (target.mmp * effect.value1 + effect.value2) * target.rec;
  if (!!UNH_RecoveryElements) {
    if (UNH_RecoveryElements.RecMpEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecMpEle);
    if (this.isItem()) {
      aggro *= this.subject().pha;
      if (UNH_RecoveryElements.RecItEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecItEle);
    } else {
      if (UNH_RecoveryElements.RecSkEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecSkEle);
    }
  } else {
    if (this.isItem()) {
      aggro *= this.subject().pha;
    }
  }
  aggro = Math.floor(aggro);
  aggro *= this.subject().unhHpMult();
  aggro *= this.subject().unhDamageMult(-aggro);
  this.unhAddAggro(target, Math.abs(aggro));
  UNH_AggroLevels.Action_itemEffectRecoverMp.call(this, target, effect);
};

UNH_AggroLevels.BattlerBase_sparam = Game_BattlerBase.prototype.sparam;
Game_BattlerBase.prototype.sparam = function(sparamId) {
  let baseVal = UNH_AggroLevels.BattlerBase_sparam.call(this, sparamId);
  if (sparamId === 0) {
    baseVal *= this.unhAggroMult();
  }
  return baseVal;
};

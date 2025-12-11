//=============================================================================
// Unhinged Development - Aggro Levels
// UNH_AggroLevels.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter UNH_BleedStacks
 * @orderAfter VisuMZ_1_BattleCore
 * @orderAfter VisuMZ_3_BattleAI
 * @plugindesc [RPG Maker MZ] [Version 1.04] [Unhinged] [AggroLevels]
 * @author Unhinged Developer
 *
 * @param BaseAggro
 * @text Base Aggro
 * @desc The aggro value that corresponds to 100% TGR
 * @type string
 * @default 50
 *
 * @param HurtingAggro
 * @text Hurting Aggro
 * @desc The amount of aggro each point of damage generates
 * @type string
 * @default 1
 *
 * @param HealingAggro
 * @text Healing Aggro
 * @desc The amount of aggro each point of healing generates
 * @type string
 * @default 2
 *
 * @param HPMult
 * @text HP Damage Multiplier
 * @desc The multiplier applied to aggro from HP damage
 * @type string
 * @default 1
 *
 * @param MPMult
 * @text MP Damage Multiplier
 * @desc The multiplier applied to aggro from MP damage
 * @type string
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
 * @param autoCalc
 * @text Automatic Calculation
 * @desc Should this plugin automatically change TGR?
 * @type boolean
 * @default true
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
 * <unhHide>
 * - Use for States
 * - Forces all attacks AWAY from the battler afflicted with this state
 * - Player attacks will not even recognize afflicted battler as a valid target
 * <unhHide:X>
 * - Use for States
 * - As <unhHide>, but with boolean condition X (JS Eval)
 *   - Variables: action, item, user, target
 * <unhFilter:X>
 * - Use for Skills
 * - Forces this skill to NOT target battlers that satisfy X (JS Eval)
 *   - X should evaluate to a boolean
 *   - Variables: action, item, user, target
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
 * 
 * ============================================================================
 * Altered Functions
 * ============================================================================
 * 
 * action.decideRandomTarget()
 * action.randomTargets(unit)
 * - ignores party's TGR values for actual random-target skills
 * 
 * action.makeTargets()
 * action.itemTargetCandidates()
 * - now checks <unhHide> notetag
 */
//=============================================================================

const UNH_AggroLevels = {};
UNH_AggroLevels.pluginName = 'UNH_AggroLevels';
UNH_AggroLevels.parameters = PluginManager.parameters(UNH_AggroLevels.pluginName);
UNH_AggroLevels.BaseAggro = String(UNH_AggroLevels.parameters['BaseAggro'] || '0');
UNH_AggroLevels.HurtingAggro = String(UNH_AggroLevels.parameters['HurtingAggro'] || '0');
UNH_AggroLevels.HealingAggro = String(UNH_AggroLevels.parameters['HealingAggro'] || '0');
UNH_AggroLevels.HPMult = String(UNH_AggroLevels.parameters['HPMult'] || '0');
UNH_AggroLevels.MPMult = String(UNH_AggroLevels.parameters['MPMult'] || '0');
UNH_AggroLevels.isTaunt = !!UNH_AggroLevels.parameters['isTaunt'];
UNH_AggroLevels.isVoke = !!UNH_AggroLevels.parameters['isVoke'];
UNH_AggroLevels.autoCalc = !!UNH_AggroLevels.parameters['autoCalc'];

UNH_AggroLevels.isSkillTagged = function(action, target, note) {
  if (!action) return false;
  if (!target) return false;
  const user = action.subject();
  if (!user) return false;
  const item = action.item();
  if (!item) return false;
  if (!item.meta) return false;
  if (!item.meta[note]) return false;
  if (item.meta[note] === true) return true;
  return !!eval(item.meta[note]);
};

UNH_AggroLevels.isTargetTagged = function(action, target, note) {
  if (!action) return false;
  if (!target) return false;
  const user = action.subject();
  if (!user) return false;
  const item = action.item();
  if (!item) return false;
  return target.states().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    if (!obj.meta[note]) return false;
    if (obj.meta[note] === true) return true;
    return !!eval(obj.meta[note]);
  });
};

Game_Action.prototype.randomTargets = function (unit) {
  const targets = [];
  for (let i = 0; i < this.numTargets(); i++) {
    targets.push(unit.trueRandomTarget(this));
  }
  return targets;
};

Game_Unit.prototype.trueRandomTarget = function (action) {
  const aliveMembers = this.aliveMembers();
  const filtered = aliveMembers.filter(function(target) {
    if (!target) return false;
    if (UNH_AggroLevels.isSkillTagged(action, target, 'unhFilter')) return false;
    if (UNH_AggroLevels.isTargetTagged(action, target, 'unhHide')) return false;
    return true;
  });
  if (filtered.length < aliveMembers.length) {
    return filtered[Math.randomInt(filtered.length)];
  }
  return aliveMembers[Math.randomInt(aliveMembers.length)];
};

UNH_AggroLevels.Action_itemTargetCandidates = Game_Action.prototype.itemTargetCandidates;
Game_Action.prototype.itemTargetCandidates = function() {
  const action = this;
  const origTargets = UNH_AggroLevels.Action_itemTargetCandidates.call(this);
  return origTargets.filter(function(target) {
    if (!target) return false;
    if (UNH_AggroLevels.isSkillTagged(action, target, 'unhFilter')) return false;
    if (UNH_AggroLevels.isTargetTagged(action, target, 'unhHide')) return false;
    return true;
  });
};

UNH_AggroLevels.Action_makeTargets = Game_Action.prototype.makeTargets;
Game_Action.prototype.makeTargets = function() {
  const baseTargets = UNH_AggroLevels.Action_makeTargets.call(this);
  return baseTargets.filter(function(target) {
    if (!target) return false;
    if (UNH_AggroLevels.isSkillTagged(action, target, 'unhFilter')) return false;
    if (UNH_AggroLevels.isTargetTagged(action, target, 'unhHide')) return false;
    return true;
  });
};

UNH_AggroLevels.Action_decideRandomTarget = Game_Action.prototype.decideRandomTarget;
Game_Action.prototype.decideRandomTarget = function() {
  const action = this;
  if (action.isForRandom()) {
    let tgGroup;
    let target;
    if (action.isForDeadFriend()) {
      target = action.friendsUnit().randomDeadTarget(this);
    } else if (action.isForFriend()) {
      target = action.friendsUnit().randomTarget(this);
    } else {
      target = action.opponentsUnit().randomTarget(this);
    }
    if (target) {
      this._targetIndex = target.index();
    } else {
      this.clear();
    }
  } else {
    UNH_AggroLevels.Action_decideRandomTarget.call(this);
  }
};

UNH_AggroLevels.Action_randomTarget = Game_Action.prototype.randomTarget;
Game_Unit.prototype.randomTarget = function(action) {
  if (Imported.VisuMZ_3_BattleAI && AIManager.hasForcedTargets()) {
    if (AIManager.hasForcedTargets()) {
      this._applyAIForcedTargetFilters = true;
    }
  }
  const origTg = UNH_AggroLevels.Action_randomTarget.call(this);
  if (!action) return origTg;
  const aliveMembers = this.aliveMembers();
  const filterMembers = aliveMembers.filter(function(target) {
    if (!target) return false;
    if (UNH_AggroLevels.isSkillTagged(action, target, 'unhFilter')) return false;
    if (UNH_AggroLevels.isTargetTagged(action, target, 'unhHide')) return false;
    return true;
  });
  let tgGroup;
  if (filterMembers.length < aliveMembers.length) {
    tgGroup = filterMembers;
  } else {
    tgGroup = aliveMembers;
  }
  let target = null;
  if (this.isForRandom()) {
    target = tgGroup[Math.randomInt(tgGroup.length)];
  } else {
    let tgrRand = Math.random() * this.tgrSum();
    for (const member of tgGroup) {
      tgrRand -= member.tgr;
      if (tgrRand <= 0 && !target) {
        target = member;
      }
    }
  }
  if (Imported.VisuMZ_3_BattleAI) this._applyAIForcedTargetFilters = false;
  return target;
};

UNH_AggroLevels.Action_randomDeadTarget = Game_Action.prototype.randomDeadTarget;
Game_Unit.prototype.randomDeadTarget = function(action) {
  const origTg = UNH_AggroLevels.Action_randomDeadTarget.call(this);
  if (!action) return origTg;
  const deadMembers = this.deadMembers();
  const filterMembers = members.filter(function(target) {
    if (!target) return false;
    if (UNH_AggroLevels.isSkillTagged(action, target, 'unhFilter')) return false;
    if (UNH_AggroLevels.isTargetTagged(action, target, 'unhHide')) return false;
    return true;
  });
  const isFilter = (filterMembers.length < deadMembers.length);
  const isAnyone = (members.length > 0);
  if (!isFilter && !isAnyone) return origTg;
  let members;
  if (isFilter) {
    members = filterMembers;
  } else {
    members = deadMembers;
  }
  if (isAnyone) {
    return members[Math.randomInt(members.length)];
  } else {
    return null;
  }
};

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
          if (!state.meta['unhTaunt']) return false;
          if (state.meta['unhTaunt'] === true) return true;
          return !!eval(state.meta['unhTaunt']);
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
        if (!state.meta['unhProvoke']) return false;
        if (state.meta['unhProvoke'] === true) return true;
        return !!eval(state.meta['unhProvoke']);
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
  //try {
    return eval(UNH_AggroLevels.BaseAggro);
  //} catch(e) {
  //  return 100;
  //}
};

Game_BattlerBase.prototype.unhDamageMult = function(value) {
  if (value < 0) {
    //try {
      return eval(UNH_AggroLevels.HealingAggro);
    //} catch(e) {
    //  return 100;
    //}
  }
  if (value > 0) {
    //try {
      return eval(UNH_AggroLevels.HurtingAggro);
    //} catch(e) {
    //  return 100;
    //}
  }
  return 1;
};

Game_BattlerBase.prototype.unhInitAggro = function() {
  this._unhAggroBase = 0;
};

Game_BattlerBase.prototype.unhAggroBase = function() {
  if (this._unhAggroBase === undefined) this.unhInitAggro();
  if (this._unhAggroBase < 0) this._unhAggroBase = 0;
  return this._unhAggroBase;
};

Game_Unit.prototype.unhMaxAggro = function() {
  return this.aliveMembers().reduce(function(r, member) {
    return Math.max(r, member.unhAggroBase());
  }, 0);
};

Game_BattlerBase.prototype.unhAggroPlus = function(target) {
  const user = this;
  let aggroPlus = 0;
  for (const obj of this.traitObjects()) {
    if (!obj.meta) continue;
    if (!obj.meta.unhAggroPlus) continue;
    aggroPlus += eval(obj.meta.unhAggroPlus);
  }
  return aggroPlus;
};

Game_Action.prototype.unhAggroPlus = function(target) {
  const user = this.subject();
  let aggroPlus = user.unhAggroPlus(target);
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
  for (const obj of this.traitObjects()) {
    if (!obj.meta) continue;
    if (!obj.meta.unhAggroRate) continue;
    aggroRate *= eval(obj.meta.unhAggroRate);
  }
  return aggroRate;
};

Game_Action.prototype.unhAggroRate = function(target) {
  const user = this.subject();
  let aggroRate = user.unhAggroRate(target);
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
  for (const obj of this.traitObjects()) {
    if (!obj.meta) continue;
    if (!obj.meta.unhAggroFlat) continue;
    aggroFlat += eval(obj.meta.unhAggroFlat);
  }
  return aggroFlat;
};

Game_Action.prototype.unhAggroFlat = function(target) {
  const user = this.subject();
  let aggroFlat = user.unhAggroFlat(target);
  const item = this.item();
  if (!!item.meta) {
    if (!!item.meta.unhAggroFlat) {
      aggroFlat += eval(item.meta.unhAggroFlat);
    }
  }
  return aggroFlat;
};

Game_BattlerBase.prototype.unhSetAggro = function(value) {
  if (value === undefined) value = 0;
  if (typeof value !== 'number') value = 0;
  this._unhAggroBase = Math.max(Math.round(value), 0);
};

UNH_AggroLevels.Func_AddAggro = function(user, target, value, ignoreRates) {
  if (value === undefined) value = 0;
  if (typeof value !== 'number') value = 0;
  if (!ignoreRates) {
    value += this.unhAggroPlus(target);
    value *= this.unhAggroRate(target);
    value += this.unhAggroFlat(target);
  }
  value = Math.round(value);
  this.unhSetAggro(value + user.unhAggroBase());
};

Game_BattlerBase.prototype.unhAddAggro = function(target, value, ignoreRates) {
  UNH_AggroLevels.Func_AddAggro.call(this, this, target, value, ignoreRates);
};

Game_Action.prototype.unhAddAggro = function(target, value, ignoreRates) {
  UNH_AggroLevels.Func_AddAggro.call(this, this.subject(), target, value, ignoreRates);
};

Game_BattlerBase.prototype.unhHpMult = function() {
  const user = this;
  try {
    return eval(UNH_AggroLevels.HPMult);
  } catch(e) {
    return 1;
  }
};

Game_BattlerBase.prototype.unhMpMult = function() {
  try {
    return eval(UNH_AggroLevels.MPMult);
  } catch(e) {
    return 1;
  }
};

Game_BattlerBase.prototype.unhAggroMult = function() {
  if (this._unhAggroBase === undefined) this.unhInitAggro();
  return ((this.unhDefaultAggro() + this.unhAggroBase()) / (this.unhDefaultAggro()));
};

UNH_AggroLevels.Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function(advantageous) {
  UNH_AggroLevels.Battler_onBattleStart.call(this, advantageous);
  this.unhInitAggro();
};

UNH_AggroLevels.Battler_onBattleEnd = Game_Battler.prototype.onBattleStart;
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

if (!!UNH_AggroLevels.autoCalc) {
UNH_AggroLevels.BattlerBase_sparam = Game_BattlerBase.prototype.sparam;
  Game_BattlerBase.prototype.sparam = function(sparamId) {
    let baseVal = UNH_AggroLevels.BattlerBase_sparam.call(this, sparamId);
    if (sparamId === 0) return baseVal * this.unhAggroMult();
    return baseVal;
  };
}
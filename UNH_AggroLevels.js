//=============================================================================
// Unhinged Development - Aggro Levels
// UNH_AggroLevels.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter UNH_BleedStacks
 * @orderAfter VisuMZ_0_CoreEngine
 * @plugindesc [RPG Maker MZ] [Version 1.01] [Unhinged] [AggroLevels]
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
 * 
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * battler.unhAggroPlus()
 * action.unhAggroPlus()
 * - returns the current total for (unhAggroPlus)
 * battler.unhAggroRate()
 * action.unhAggroRate()
 * - returns the current total for (unhAggroRate)
 * battler.unhAggroFlat()
 * action.unhAggroFlat()
 * - returns the current total for (unhAggroFlat)
 * battler.unhHpMult()
 * - returns the multiplier for aggro from HP damage
 * battler.unhMpMult()
 * - returns the multiplier for aggro from MP damage
 * battler.unhSetAggro()
 * - resets the target's TGR to 100%
 * battler.unhSetAggro(X)
 * - sets the target's Base Aggro to X (Number)
 * battler.unhAddAggro(X)
 * battler.unhAddAggro(X, false)
 * - increases the target's Base Aggro by X (Number)
 *   - value is modified by plus/rate/flat
 * battler.unhAddAggro(X, true)
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

Game_BattlerBase.prototype.unhAggroPlus = function() {
  let aggroPlus = 0;
  for (const state of this.states()) {
    if (!state.meta) continue;
    if (!state.meta.unhAggroPlus) continue;
    if (typeof state.meta.unhAggroPlus !== 'number') continue;
    aggroPlus += state.meta.unhAggroPlus;
  }
  return aggroPlus;
};

Game_Enemy.prototype.unhAggroPlus = function() {
  let aggroPlus = Game_BattlerBase.prototype.unhAggroPlus.call(this);
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.unhAggroPlus) {
      if (typeof this.enemy().meta.unhAggroPlus !== 'number') {
        aggroPlus += this.enemy().meta.unhAggroPlus;
      }
    }
  }
  return aggroPlus;
};

Game_Actor.prototype.unhAggroPlus = function() {
  let aggroPlus = Game_BattlerBase.prototype.unhAggroPlus.call(this);
  if (!!this.actor().meta) {
    if (!!this.actor().meta.unhAggroPlus) {
      if (typeof this.actor().meta.unhAggroPlus !== 'number') {
        aggroPlus += this.actor().meta.unhAggroPlus;
      }
    }
  }
  for (const equip of this.equips()) {
    if (!equip.meta) continue;
    if (!equip.meta.unhAggroPlus) continue;
    if (typeof equip.meta.unhAggroPlus !== 'number') continue;
    aggroPlus += equip.meta.unhAggroPlus;
  }
  return aggroPlus;
};

Game_Action.prototype.unhAggroPlus = function() {
  let aggroPlus = this.subject().unhAggroPlus();
  const item = this.item();
  if (!!item.meta) {
    if (!!item.meta.unhAggroPlus) {
      if (typeof item.meta.unhAggroPlus !== 'number'){
        aggroPlus += item.meta.unhAggroPlus;
      }
    }
  }
  return aggroPlus;
};

Game_BattlerBase.prototype.unhAggroRate = function() {
  let aggroRate = 1;
  for (const state of this.states()) {
    if (!state.meta) continue;
    if (!state.meta.unhAggroRate) continue;
    if (typeof state.meta.unhAggroRate !== 'number') continue;
    aggroRate *= state.meta.unhAggroRate;
  }
  return aggroRate;
};

Game_Enemy.prototype.unhAggroRate = function() {
  let aggroRate = Game_BattlerBase.prototype.unhAggroRate.call(this);
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.unhAggroRate) {
      if (typeof this.enemy().meta.unhAggroRate !== 'number') {
        aggroRate *= this.enemy().meta.unhAggroRate;
      }
    }
  }
  return aggroRate;
};

Game_Actor.prototype.unhAggroRate = function() {
  let aggroRate = Game_BattlerBase.prototype.unhAggroRate.call(this);
  if (!!this.actor().meta) {
    if (!!this.actor().meta.unhAggroRate) {
      if (typeof this.actor().meta.unhAggroRate !== 'number') {
        aggroRate *= this.actor().meta.unhAggroRate;
      }
    }
  }
  for (const equip of this.equips()) {
    if (!equip.meta) continue;
    if (!equip.meta.unhAggroRate) continue;
    if (typeof equip.meta.unhAggroRate !== 'number') continue;
    aggroRate *= equip.meta.unhAggroRate;
  }
  return aggroRate;
};

Game_Action.prototype.unhAggroRate = function() {
  let aggroRate = this.subject().unhAggroRate();
  const item = this.item();
  if (!!item.meta) {
    if (!!item.meta.unhAggroRate) {
      if (typeof item.meta.unhAggroRate !== 'number'){
        aggroRate *= item.meta.unhAggroRate;
      }
    }
  }
  return aggroRate;
};

Game_BattlerBase.prototype.unhAggroFlat = function() {
  let aggroFlat = 0;
  for (const state of this.states()) {
    if (!state.meta) continue;
    if (!state.meta.unhAggroFlat) continue;
    if (typeof state.meta.unhAggroFlat !== 'number') continue;
    aggroFlat += state.meta.unhAggroFlat;
  }
  return aggroFlat;
};

Game_Enemy.prototype.unhAggroFlat = function() {
  let aggroFlat = Game_BattlerBase.prototype.unhAggroFlat.call(this);
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.unhAggroFlat) {
      if (typeof this.enemy().meta.unhAggroFlat !== 'number') {
        aggroFlat += this.enemy().meta.unhAggroFlat;
      }
    }
  }
  return aggroFlat;
};

Game_Actor.prototype.unhAggroFlat = function() {
  let aggroFlat = Game_BattlerBase.prototype.unhAggroFlat.call(this);
  if (!!this.actor().meta) {
    if (!!this.actor().meta.unhAggroFlat) {
      if (typeof this.actor().meta.unhAggroFlat !== 'number') {
        aggroFlat += this.actor().meta.unhAggroFlat;
      }
    }
  }
  for (const equip of this.equips()) {
    if (!equip.meta) continue;
    if (!equip.meta.unhAggroFlat) continue;
    if (typeof equip.meta.unhAggroFlat !== 'number') continue;
    aggroFlat += equip.meta.unhAggroFlat;
  }
  return aggroFlat;
};

Game_Action.prototype.unhAggroFlat = function() {
  let aggroFlat = this.subject().unhAggroFlat();
  const item = this.item();
  if (!!item.meta) {
    if (!!item.meta.unhAggroFlat) {
      if (typeof item.meta.unhAggroFlat !== 'number'){
        aggroFlat += item.meta.unhAggroFlat;
      }
    }
  }
  return aggroFlat;
};

Game_BattlerBase.prototype.unhSetAggro = function(value) {
  if (value === undefined) value = UNH_AggroLevels.BaseAggro;
  if (typeof value !== 'number') value = UNH_AggroLevels.BaseAggro;
  this._unhAggroBase = Math.max(Math.round(value), 0);
};

Game_BattlerBase.prototype.unhAddAggro = function(value, ignoreRates) {
  if (value === undefined) value = 0;
  if (typeof value !== 'number') value = 0;
  if (!ignoreRates) {
    value += this.unhAggroPlus();
    value *= this.unhAggroRate();
    value += this.unhAggroFlat();
  }
  value = Math.round(value);
  this.unhSetAggro(value + this.unhAggroBase());
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
  if (!!item.meta) {
    if (!!item.meta.unhAddUserAggro) {
      user.unhAddAggro(eval(item.meta.unhAddUserAggro));
    }
    if (!!item.meta.unhAddTargetAggro) {
      target.unhAddAggro(eval(item.meta.unhAddTargetAggro));
    }
  }
  UNH_AggroLevels.Action_apply.call(this);
};

UNH_AggroLevels.Action_executeHpDamage = Game_Action.prototype.executeHpDamage;
Game_Action.prototype.executeHpDamage = function(target, value) {
  let aggro = value;
  aggro *= this.subject().unhHpMult();
  aggro *= this.subject().unhDamageMult(aggro);
  this.subject().unhAddAggro(Math.abs(aggro));
  UNH_AggroLevels.Action_executeHpDamage.call(this, target, value);
};

UNH_AggroLevels.Action_executeMpDamage = Game_Action.prototype.executeMpDamage;
Game_Action.prototype.executeMpDamage = function(target, value) {
  let aggro = value;
  aggro *= this.subject().unhMpMult();
  aggro *= this.subject().unhDamageMult(aggro);
  this.subject().unhAddAggro(Math.abs(aggro));
  UNH_AggroLevels.Action_executeMpDamage.call(this, target, value);
};

UNH_AggroLevels.Action_gainDrainedHp = Game_Action.prototype.gainDrainedHp;
Game_Action.prototype.gainDrainedHp = function(value) {
  let aggro = value;
  aggro *= this.subject().unhHpMult();
  aggro *= this.subject().unhDamageMult(-aggro);
  this.subject().unhAddAggro(Math.abs(aggro));
  UNH_AggroLevels.Action_gainDrainedHp.call(this, value);
};

UNH_AggroLevels.Action_gainDrainedMp = Game_Action.prototype.gainDrainedMp;
Game_Action.prototype.gainDrainedMp = function(value) {
  let aggro = value;
  aggro *= this.subject().unhMpMult();
  aggro *= this.subject().unhDamageMult(-aggro);
  this.subject().unhAddAggro(Math.abs(aggro));
  UNH_AggroLevels.Action_gainDrainedMp.call(this, value);
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
  this.subject().unhAddAggro(Math.abs(aggro));
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
  this.subject().unhAddAggro(Math.abs(aggro));
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

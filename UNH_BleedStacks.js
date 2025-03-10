//=============================================================================
// Unhinged Development - Bleed Stacks
// UNH_BleedStacks.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [BleedStacks]
 * @author Unhinged Developer
 *
 * @param LetVSCook
 * @text Offload to VisuStella
 * @desc If VisuStella Skills & States Core is installed, 
 * do you want to let it handle skill costs?
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * This adds three effects to your game.
 * 
 * The first, Overheal, is effectively temporary HP.  You have states give 
 * their target "overheal stacks".  Each overheal stack negates one point of 
 * incoming HP damage, then goes away.  Effectively it's VS Absorb Barriers.
 * 
 * The second, Overflow, functions as Overheal, but for MP instead of HP.
 * 
 * The last, Bleed, is the other way around.  You have states give their target 
 * "bleed stacks".  Each bleed stack negates one HP of healing, then goes away.  
 * Effectively it's Yanfly Heal Jammer.
 * 
 * Please don't tag a single state as both.
 * 
 * ============================================================================
 * Compatability
 * ============================================================================
 * 
 * This plugin should be compatable with the VisuStella MZ plugin suite.  In 
 * fact, for easier conveyance, I've put in code to automatically apply 
 * setStateDisplay if Skills & States Core is installed.
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <UnhOverheal:X>
 * - Use for States
 * - Sets the tagged state to give X overheal stacks (JavaScript)
 * <UnhRegenOverheal:X>
 * - Use for Skills/States
 * - Sets the tagged state to gain X overheal stacks per turn (JavaScript)
 *   - cannot exceed value for <UnhOverheal:X>
 * <UnhDecayOverheal:X>
 * - Use for Skills/States
 * - Sets the tagged state to lose X overheal stacks per turn (JavaScript)
 * <UnhIgnoreOverheal>
 * - Use for Actors/Enemies/Skills/Weapons/Armors/States
 * - Use this to give ways to bypass Overheal
 * <UnhOverflow:X>
 * - Use for States
 * - Sets the tagged state to give X overflow stacks (JavaScript)
 * <UnhRegenOverflow:X>
 * - Use for Skills/States
 * - Sets the tagged state to gain X overflow stacks per turn (JavaScript)
 *   - cannot exceed value for <UnhOverflow:X>
 * <UnhDecayOverflow:X>
 * - Use for Skills/States
 * - Sets the tagged state to lose X overflow stacks per turn (JavaScript)
 * <UnhIgnoreOverflow>
 * - Use for Actors/Enemies/Skills/Weapons/Armors/States
 * - Use this to give ways to bypass Overflow
 * <UnhBleed:X>
 * - Use for States
 * - Sets the tagged state to give X bleed stacks (JavaScript)
 * <UnhRegenBleed:X>
 * - Use for Skills/States
 * - Sets the tagged state to gain X bleed stacks per turn (JavaScript)
 *   - cannot exceed value for <UnhBleed:X>
 * <UnhDecayBleed:X>
 * - Use for Skills/States
 * - Sets the tagged state to lose X bleed stacks per turn (JavaScript)
 * <UnhIgnoreBleed>
 * - Use for Actors/Enemies/Skills/Weapons/Armors/States
 * - Use this to give ways to ignore Bleed
 * 
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * battler.unhOverheal()
 * - returns the battler's current overheal count
 * battler.unhOverheal(stateId)
 * - returns the overheal stacks tied to a specific state
 * battler.unhSetOverheal(stateId, value)
 * - sets one state's overheal stacks to the given value
 *   - With VS Skills & States Core, also sets the State Display to the 
 *     overheal for that state
 * battler.unhAddOverheal(stateId, value)
 * - increases one state's overheal stacks by the given value
 *   - With VS Skills & States Core, also sets the State Display to the 
 *     overheal for that state
 * battler.unhIgnoreOverheal()
 * - returns whether the battler is set to bypass overheal
 * battler.unhOverflow()
 * - returns the battler's current overflow count
 * battler.unhOverflow(stateId)
 * - returns the overflow stacks tied to a specific state
 * battler.unhSetOverflow(stateId, value)
 * - sets one state's overflow stacks to the given value
 *   - With VS Skills & States Core, also sets the State Display to the 
 *     overflow for that state
 * battler.unhAddOverflow(stateId, value)
 * - increases one state's overflow stacks by the given value
 *   - With VS Skills & States Core, also sets the State Display to the 
 *     overflow for that state
 * battler.unhIgnoreOverflow()
 * - returns whether the battler is set to bypass overflow
 * battler.unhBleed()
 * - returns the battler's current bleed count
 * battler.unhBleed(stateId)
 * - returns the bleed stacks tied to a specific state
 * battler.unhSetBleed(stateId, value)
 * - sets one state's bleed stacks to the given value
 *   - With VS Skills & States Core, also sets the State Display to the bleed 
 *     for that state
 * battler.unhAddBleed(stateId, value)
 * - increases one state's bleed stacks by the given value
 *   - With VS Skills & States Core, also sets the State Display to the bleed 
 *     for that state
 * battler.unhIgnoreBleed()
 * - returns whether the battler is set to ignore bleed
 */
//=============================================================================

const UNH_BleedStacks = {};
UNH_BleedStacks.pluginName = 'UNH_BleedStacks';
UNH_BleedStacks.parameters = PluginManager.parameters(UNH_BleedStacks.pluginName);
UNH_BleedStacks.LetVSCook = !!UNH_BleedStacks.parameters['LetVSCook'];

Game_Battler.prototype.initBleed = function() {
  this._unhBleed = [];
  this._unhMaxBleed = [];
  for (let i = 0; i < $dataStates.length; i++) {
    if (!this._unhBleed[i]) this._unhBleed[i] = 0;
    if (typeof this._unhBleed[i] !== 'number') this._unhBleed[i] = 0;
    if (!this._unhMaxBleed[i]) this._unhMaxBleed[i] = 0;
    if (typeof this._unhMaxBleed[i] !== 'number') this._unhMaxBleed[i] = 0;
  }
};

Game_Battler.prototype.initOverheal = function() {
  this._unhOverheal = [];
  this._unhMaxOverheal = [];
  for (let i = 0; i < $dataStates.length; i++) {
    if (!this._unhOverheal[i]) this._unhOverheal[i] = 0;
    if (typeof this._unhOverheal[i] !== 'number') this._unhOverheal[i] = 0;
    if (!this._unhMaxOverheal[i]) this._unhMaxOverheal[i] = 0;
    if (typeof this._unhMaxOverheal[i] !== 'number') this._unhMaxOverheal[i] = 0;
  }
};

Game_Battler.prototype.initOverflow = function() {
  this._unhOverflow = [];
  this._unhMaxOverflow = [];
  for (let i = 0; i < $dataStates.length; i++) {
    if (!this._unhOverflow[i]) this._unhOverflow[i] = 0;
    if (typeof this._unhOverflow[i] !== 'number') this._unhOverflow[i] = 0;
    if (!this._unhMaxOverflow[i]) this._unhMaxOverflow[i] = 0;
    if (typeof this._unhMaxOverflow[i] !== 'number') this._unhMaxOverflow[i] = 0;
  }
};

Game_Battler.prototype.unhIgnoreBleed = function() {
  return this.traitObjects().some(function(r, obj) {
    const meta = obj.meta;
    if (!meta) return false;
    return !!meta.UnhIgnoreBleed;
  }, false);
};

Game_Battler.prototype.unhIgnoreOverheal = function() {
  return this.traitObjects().some(function(r, obj) {
    const meta = obj.meta;
    if (!meta) return false;
    return !!meta.UnhIgnoreOverheal;
  }, false);
};

Game_Battler.prototype.unhIgnoreOverflow = function() {
  return this.traitObjects().some(function(r, obj) {
    const meta = obj.meta;
    if (!meta) return false;
    return !!meta.UnhIgnoreOverflow;
  }, false);
};

Game_Action.prototype.unhIgnoreBleed = function() {
  const item = this.item();
  const user = this.subject();
  if (!item) return false;
  const meta = item.meta;
  if (!meta) return false;
  return user.unhIgnoreBleed() && !!meta.UnhIgnoreBleed;
};

Game_Action.prototype.unhIgnoreOverheal = function() {
  const item = this.item();
  const user = this.subject();
  if (!item) return false;
  const meta = item.meta;
  if (!meta) return false;
  return user.unhIgnoreOverheal() && !!meta.UnhIgnoreOverheal;
};

Game_Action.prototype.unhIgnoreOverflow = function() {
  const item = this.item();
  const user = this.subject();
  if (!item) return false;
  const meta = item.meta;
  if (!meta) return false;
  return user.unhIgnoreOverflow() && !!meta.UnhIgnoreOverflow;
};

Game_Battler.prototype.unhBleed = function(stateId) {
  if (this._unhBleed === undefined) this.initBleed();
  if (!Array.isArray(this._unhBleed)) this.initBleed();
  if (this._unhBleed.length !== $dataStates.length) this.initBleed();
  if (!stateId) return this._unhBleed.reduce(function(r, ele) {
    return r + (ele || 0);
  }, 0);
  return this._unhBleed[stateId] || 0;
};

Game_Battler.prototype.unhOverheal = function(stateId) {
  if (this._unhOverheal === undefined) this.initOverheal();
  if (!Array.isArray(this._unhOverheal)) this.initOverheal();
  if (this._unhOverheal.length !== $dataStates.length) this.initOverheal();
  if (!stateId) return this._unhOverheal.reduce(function(r, ele) {
    return r + (ele || 0);
  }, 0);
  return this._unhOverheal[stateId] || 0;
};

Game_Battler.prototype.unhOverflow = function(stateId) {
  if (this._unhOverflow === undefined) this.initOverflow();
  if (!Array.isArray(this._unhOverflow)) this.initOverflow();
  if (this._unhOverflow.length !== $dataStates.length) this.initOverflow();
  if (!stateId) return this._unhOverflow.reduce(function(r, ele) {
    return r + (ele || 0);
  }, 0);
  return this._unhOverflow[stateId] || 0;
};

Game_Battler.prototype.unhMaxBleed = function(stateId) {
  if (this._unhMaxBleed === undefined) this.initBleed();
  if (!Array.isArray(this._unhMaxBleed)) this.initBleed();
  if (this._unhMaxBleed.length !== $dataStates.length) this.initBleed();
  if (!stateId) return 0;
  return this._unhMaxBleed[stateId] || 0;
};

Game_Battler.prototype.unhMaxOverheal = function(stateId) {
  if (this._unhMaxOverheal === undefined) this.initOverheal();
  if (!Array.isArray(this._unhMaxOverheal)) this.initOverheal();
  if (this._unhMaxOverheal.length !== $dataStates.length) this.initOverheal();
  if (!stateId) return 0;
  return this._unhMaxOverheal[stateId] || 0;
};

Game_Battler.prototype.unhMaxOverflow = function(stateId) {
  if (this._unhMaxOverflow === undefined) this.initOverflow();
  if (!Array.isArray(this._unhMaxOverflow)) this.initOverflow();
  if (this._unhMaxOverflow.length !== $dataStates.length) this.initOverflow();
  if (!stateId) return 0;
  return this._unhMaxOverflow[stateId] || 0;
};

Game_Battler.prototype.unhSetBleed = function(stateId, value) {
  if (this._unhBleed === undefined) this.initBleed();
  if (!Array.isArray(this._unhBleed)) this.initBleed();
  if (this._unhBleed.length !== $dataStates.length) this.initBleed();
  if (!stateId) stateId = 0;
  if (!value) value = 0;
  if (typeof stateId !== 'number') stateId = 0;
  if (typeof value !== 'number') value = 0;
  if (value < 0) value = 0;
  this._unhBleed[stateId] = value;
  if (!!Imported.VisuMZ_1_SkillsStatesCore) {
    if (value > 0) {
      this.setStateDisplay(stateId, value);
    } else {
      this.clearStateDisplay(stateId);
    }
  }
};

Game_Battler.prototype.unhSetMaxBleed = function(stateId, value) {
  if (this._unhMaxBleed === undefined) this.initBleed();
  if (!Array.isArray(this._unhMaxBleed)) this.initBleed();
  if (this._unhMaxBleed.length !== $dataStates.length) this.initBleed();
  if (!stateId) stateId = 0;
  if (!value) value = 0;
  if (typeof stateId !== 'number') stateId = 0;
  if (typeof value !== 'number') value = 0;
  if (value < 0) value = 0;
  this._unhMaxBleed[stateId] = value;
};

Game_Battler.prototype.unhSetOverheal = function(stateId, value) {
  if (this._unhOverheal === undefined) this.initOverheal();
  if (!Array.isArray(this._unhOverheal)) this.initOverheal();
  if (this._unhOverheal.length !== $dataStates.length) this.initOverheal();
  if (!stateId) stateId = 0;
  if (!value) value = 0;
  if (typeof stateId !== 'number') stateId = 0;
  if (typeof value !== 'number') value = 0;
  if (value < 0) value = 0;
  this._unhOverheal[stateId] = value;
  if (!!Imported.VisuMZ_1_SkillsStatesCore) {
    if (value > 0) {
      this.setStateDisplay(stateId, value);
    } else {
      this.clearStateDisplay(stateId);
    }
  }
};

Game_Battler.prototype.unhSetMaxOverheal = function(stateId, value) {
  if (this._unhMaxOverheal=== undefined) this.initOverheal();
  if (!Array.isArray(this._unhMaxOverheal)) this.initOverheal();
  if (this._unhMaxOverheal.length !== $dataStates.length) this.initOverheal();
  if (!stateId) stateId = 0;
  if (!value) value = 0;
  if (typeof stateId !== 'number') stateId = 0;
  if (typeof value !== 'number') value = 0;
  if (value < 0) value = 0;
  this._unhMaxOverheal[stateId] = value;
};

Game_Battler.prototype.unhSetOverflow = function(stateId, value) {
  if (this._unhOverflow === undefined) this.initOverflow();
  if (!Array.isArray(this._unhOverflow)) this.initOverflow();
  if (this._unhOverflow.length !== $dataStates.length) this.initOverflow();
  if (!stateId) stateId = 0;
  if (!value) value = 0;
  if (typeof stateId !== 'number') stateId = 0;
  if (typeof value !== 'number') value = 0;
  if (value < 0) value = 0;
  if (stateId === 0) {
    this._unhOverflow[stateId] = value;
    if (!!Imported.VisuMZ_1_SkillsStatesCore) {
      if (value > 0) {
        this.setStateDisplay(stateId, value);
      } else {
        this.clearStateDisplay(stateId);
      }
    }
  }
};

Game_Battler.prototype.unhSetMaxOverflow = function(stateId, value) {
  if (this._unhMaxOverflow=== undefined) this.initOverflow();
  if (!Array.isArray(this._unhMaxOverflow)) this.initOverflow();
  if (this._unhMaxOverflow.length !== $dataStates.length) this.initOverflow();
  if (!stateId) stateId = 0;
  if (!value) value = 0;
  if (typeof stateId !== 'number') stateId = 0;
  if (typeof value !== 'number') value = 0;
  if (value < 0) value = 0;
  this._unhMaxOverflow[stateId] = value;
};

Game_Battler.prototype.unhAddBleed = function(stateId, value) {
  this.unhSetBleed(stateId, this.unhBleed() + value);
};

Game_Battler.prototype.unhAddOverheal = function(stateId, value) {
  this.unhSetOverheal(stateId, this.unhOverheal() + value);
};

Game_Battler.prototype.unhAddOverflow = function(stateId, value) {
  this.unhSetOverflow(stateId, this.unhOverflow() + value);
};

Game_BattlerBase.prototype.bleedStates = function() {
  return this.states().filter(function(state) {
    const meta = state.meta;
    if (!meta) return false;
    if (!meta.UnhBleed) return false;
    return true;
  });
};

Game_BattlerBase.prototype.overhealStates = function() {
  return this.states().filter(function(state) {
    const meta = state.meta;
    if (!meta) return false;
    if (!meta.UnhOverheal) return false;
    return true;
  });
};

Game_BattlerBase.prototype.overflowStates = function() {
  return this.states().filter(function(state) {
    const meta = state.meta;
    if (!meta) return false;
    if (!meta.UnhOverflow) return false;
    return true;
  });
};

Game_Battler.prototype.applyBleed = function(value, states) {
  if (states === undefined) states = JsonEx.makeDeepCopy(this.bleedStates());
  for (const state of states) {
    const offset = Math.min(target.unhBleed(state.id), Math.abs(value));
    value -= offset;
    target.unhAddBleed(state.id, -offset);
    if (value <= 0) break;
    if (target.unhBleed(state.id) <= 0) continue;
  }
  return value;
};

Game_Battler.prototype.applyOverheal = function(value, states) {
  if (states === undefined) states = JsonEx.makeDeepCopy(this.overhealStates());
  for (const state of states) {
    const offset = Math.min(target.unhOverheal(state.id), Math.abs(value));
    value -= offset;
    target.unhAddOverheal(state.id, -offset);
    if (value <= 0) break;
    if (target.unhOverheal(state.id) <= 0) continue;
  }
  return value;
};

Game_Battler.prototype.applyOverflow = function(value, states) {
  if (states === undefined) states = JsonEx.makeDeepCopy(this.overflowStates());
  for (const state of states) {
    const offset = Math.min(this.unhOverflow(state.id), Math.abs(value));
    value -= offset;
    this.unhAddOverflow(state.id, -offset);
    if (value <= 0) break;
    if (target.unhOverflow(state.id) <= 0) continue;
  }
  return value;
};

UNH_BleedStacks.Battler_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
  const user = this;
  UNH_BleedStacks.Battler_addState.call(this);
  const meta = $dataStates[stateId].meta;
  let counter;
  if (!!meta) {
    if (!!meta.UnhOverheal) {
      counter = eval(meta.UnhOverheal);
      this.unhSetOverheal(stateId, counter);
      this.unhSetMaxOverheal(stateId, Math.max(counter, this.unhOverheal()));
    }
    if (!!meta.UnhOverflow) {
      counter = eval(meta.UnhOverflow);
      this.unhSetOverflow(stateId, counter);
      this.unhSetMaxOverflow(stateId, Math.max(counter, this.unhOverflow()));
    }
    if (!!meta.UnhBleed) {
      counter = eval(meta.UnhBleed);
      this.unhSetBleed(stateId, counter);
      this.unhSetMaxBleed(stateId, Math.max(counter, this.unhBleed()));
    }
  }
};

UNH_BleedStacks.BattlerBase_eraseState = Game_BattlerBase.prototype.eraseState;
Game_BattlerBase.prototype.eraseState = function(stateId) {
  UNH_BleedStacks.BattlerBase_eraseState.call(this);
  const meta = $dataStates[stateId].meta;
  if (!!meta) {
    if (!!meta.UnhOverheal) {
      this.unhSetOverheal(stateId, 0);
      this.unhSetMaxOverheal(stateId, 0);
    }
    if (!!meta.UnhOverflow) {
      this.unhSetOverflow(stateId, 0);
      this.unhSetMaxOverflow(stateId, 0);
    }
    if (!!meta.UnhBleed) {
      this.unhSetBleed(stateId, 0);
      this.unhSetMaxBleed(stateId, 0);
    }
  }
};

UNH_BleedStacks.Action_executeHpDamage = Game_Action.prototype.executeHpDamage;
Game_Action.prototype.executeHpDamage = function(target, value) {
  const oldValue = value;
  const user = this.subject();
  const item = this.item();
  const bleedStates = target.bleedStates();
  const overhealStates = target.overhealStates();
  const bleedStatesTemp = JsonEx.makeDeepCopy(bleedStates);
  const overhealStatesTemp = JsonEx.makeDeepCopy(overhealStates);
  if (value > 0 && !this.unhIgnoreOverheal() && !user.unhIgnoreOverheal()) {
    value = target.applyOverheal(value, overhealStatesTemp);
  }
  if (value < 0 && !this.unhIgnoreBleed() && !user.unhIgnoreBleed()) {
    value = -target.applyBleed(-value, bleedStatesTemp);
  }
  UNH_BleedStacks.Action_executeHpDamage.call(this, target, value);
  if (bleedStatesTemp.length > 0) {
    for (const state of bleedStatesTemp) {
      if (target.unhBleed(state.id) <= 0) {
        target.removeState(state.id);
      }
    }
  }
  if (overhealStatesTemp.length > 0) {
    for (const state of overhealStatesTemp) {
      if (target.unhOverheal(state.id) <= 0) {
        target.removeState(state.id);
      }
    }
  }
};

UNH_BleedStacks.Action_executeMpDamage = Game_Action.prototype.executeMpDamage;
Game_Action.prototype.executeMpDamage = function(target, value) {
  const oldValue = value;
  const user = this.subject();
  const item = this.item();
  const overflowStates = target.overflowStates();
  const overflowStatesTemp = JsonEx.makeDeepCopy(overflowStates);
  if (value > 0 && !this.unhIgnoreOverflow() && !user.unhIgnoreOverflow()) {
    value = target.applyOverflow(value, overflowStatesTemp);
  }
  UNH_BleedStacks.Action_executeMpDamage.call(this, target, value);
  if (overflowStatesTemp.length > 0) {
    for (const state of overflowStatesTemp) {
      if (target.unhOverflow(state.id) <= 0) {
        target.removeState(state.id);
      }
    }
  }
};

UNH_BleedStacks.Action_gainDrainedHp = Game_Action.prototype.gainDrainedHp;
Game_Action.prototype.gainDrainedHp = function(value) {
  const oldValue = value;
  const user = this.subject();
  const item = this.item();
  const bleedStates = user.bleedStates();
  const overhealStates = user.overhealStates();
  const bleedStatesTemp = JsonEx.makeDeepCopy(bleedStates);
  const overhealStatesTemp = JsonEx.makeDeepCopy(overhealStates);
  if (value > 0 && !this.unhIgnoreOverheal() && !user.unhIgnoreOverheal()) {
    value = user.applyOverheal(value, overhealStatesTemp);
  }
  if (value < 0 && !this.unhIgnoreBleed() && !user.unhIgnoreBleed()) {
    value = -user.applyBleed(-value, bleedStatesTemp);
  }
  UNH_BleedStacks.Action_gainDrainedHp.call(this, value);
  if (bleedStatesTemp.length > 0) {
    for (const state of bleedStatesTemp) {
      if (user.unhBleed(state.id) <= 0) {
        user.removeState(state.id);
      }
    }
  }
  if (overhealStatesTemp.length > 0) {
    for (const state of overhealStatesTemp) {
      if (user.unhOverheal(state.id) <= 0) {
        user.removeState(state.id);
      }
    }
  }
};

UNH_BleedStacks.Action_gainDrainedMp = Game_Action.prototype.gainDrainedMp;
Game_Action.prototype.gainDrainedMp = function(value) {
  const oldValue = value;
  const user = this.subject();
  const item = this.item();
  const overflowStates = user.overflowStates();
  const overflowStatesTemp = JsonEx.makeDeepCopy(overflowStates);
  if (value > 0 && !this.unhIgnoreOverflow() && !user.unhIgnoreOverflow()) {
    value = user.applyOverflow(value, overflowStatesTemp);
  }
  UNH_BleedStacks.Action_gainDrainedMp.call(this, value);
  if (overflowStatesTemp.length > 0) {
    for (const state of overflowStatesTemp) {
      if (user.unhOverflow(state.id) <= 0) {
        user.removeState(state.id);
      }
    }
  }
};

UNH_BleedStacks.Battler_regenerateAll = Game_Battler.prototype.regenerateAll
Game_Battler.prototype.regenerateAll = function() {
  const user = this;
  const tempStates = JsonEx.makeDeepCopy(this.states());
  const bleedStates = target.bleedStates();
  const overhealStates = target.overhealStates();
  const overflowStates = target.overflowStates();
  const bleedStatesTemp = JsonEx.makeDeepCopy(bleedStates);
  const overhealStatesTemp = JsonEx.makeDeepCopy(overhealStates);
  const overflowStatesTemp = JsonEx.makeDeepCopy(overflowStates);
  UNH_BleedStacks.Battler_regenerateAll.call(this);
  if (bleedStatesTemp.length > 0) {
    for (const state of bleedStatesTemp) {
      const meta = state.meta;
      let unhDeltaBleed = 0;
      const unhMaxBleed = target.unhMaxBleed(state.id);
      if (!!meta.UnhRegenBleed) {
        unhDeltaBleed += eval(meta.UnhRegenBleed);
      }
      if (!!meta.UnhDecayBleed) {
        unhDeltaBleed -= eval(meta.UnhDecayBleed);
      }
      unhDeltaBleed = Math.min(unhDeltaBleed, unhMaxBleed);
      target.unhAddBleed(state.id, unhDeltaBleed);
      if (target.unhBleed(state.id) <= 0) {
        target.removeState(state.id);
      }
    }
  }
  if (overhealStatesTemp.length > 0) {
    for (const state of overhealStatesTemp) {
      const meta = state.meta;
      let unhDeltaOverheal = 0;
      const unhMaxOverheal = eval(target.unhMaxOverheal(state.id));
      if (!!meta.UnhRegenOverheal) {
        unhDeltaOverheal += eval(meta.UnhRegenOverheal);
      }
      if (!!meta.UnhDecayOverheal) {
        unhDeltaOverheal -= eval(meta.UnhDecayOverheal);
      }
      unhDeltaOverheal = Math.min(unhDeltaOverheal, unhMaxOverheal);
      target.unhAddOverheal(state.id, unhDeltaOverheal);
      if (target.unhOverheal(state.id) <= 0) {
        target.removeState(state.id);
      }
    }
  }
  if (overflowStatesTemp.length > 0) {
    for (const state of overflowStatesTemp) {
      const meta = state.meta;
      let unhDeltaOverflow = 0;
      const unhMaxOverflow = eval(target.unhMaxOverflow(state.id));
      if (!!meta.UnhRegenOverflow) {
        unhDeltaOverflow += eval(meta.UnhRegenOverflow);
      }
      if (!!meta.UnhDecayOverflow) {
        unhDeltaOverflow -= eval(meta.UnhDecayOverflow);
      }
      unhDeltaOverflow = Math.min(unhDeltaOverflow, unhMaxOverflow);
      target.unhAddOverflow(state.id, unhDeltaOverflow);
      if (target.unhOverflow(state.id) <= 0) {
        target.removeState(state.id);
      }
    }
  }
};

if (!!Imported.VisuMZ_1_SkillsStatesCore) {
  if (!UNH_BleedStacks.LetVSCook) {
    UNH_BleedStacks.BattlerBase_skillMpCost = Game_BattlerBase.prototype.skillMpCost;
    Game_BattlerBase.prototype.skillMpCost = function(skill) {
      if (!!skill.display) {
        return UNH_BleedStacks.BattlerBase_skillMpCost.call(this, skill)
      } else {
        return this.applyOverflow(UNH_BleedStacks.BattlerBase_skillMpCost.call(this, skill));
      }
    };

    UNH_BleedStacks.BattlerBase_paySkillCost = Game_BattlerBase.prototype.paySkillCost;
    Game_BattlerBase.prototype.paySkillCost = function(skill) {
      skill.display = false;
      UNH_BleedStacks.BattlerBase_paySkillCost.call(this, skill);
    };

    UNH_BleedStacks.skillList_drawSkillCost = Window_SkillList.prototype.drawSkillCost;
    Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
      skill.display = true;
      UNH_BleedStacks.skillList_drawSkillCost.call(this, skill, x, y, width);
    };
  }
}
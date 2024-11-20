//=============================================================================
// Unhinged Development - Parry & Break
// UNH_ParryBreak.js
//=============================================================================

var Imported = Imported || {};
var Ramza = Ramza || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter VisuMZ_0_CoreEngine
 * @orderAfter VisuMZ_1_BattleCore
 * @orderAfter UNH_Ramza_ExtWeapons
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [ParryBreak]
 * @author Unhinged Developer
 *
 * @param DodgeOrMit
 * @text Plugin Behavior
 * @desc Whether parrying means a miss or damage reduction
 * @type boolean
 * @on Dodge
 * @off Mitigate
 * @default true
 *
 * @param BaseDamageMult
 * @text Base Damage Multiplier
 * @desc The default damage multiplier from parrying (Mit Only)
 * @type string
 * @default 0.5
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <unhParryBreakEquip>
 * - Use for States
 * - Marks a state as an equipment surrogate for enemies
 *   - Weapons each roll their parry check individually against each attack
 *   - States not marked as equipment surrogates add their parry chance to each 
 *     parry check
 * <unhParryBreakSkip>
 * - Use for Skill/Items
 * - Marks a skill or item to bypass the parry system
 * <unhParryChancePhys:X>
 * - Use for Weapons/States
 * - Adds an X% chance (X is a JS Eval) to reduce or negate physical damage
 *   - user - the user
 *   - target - the target
 * <unhParryUnarmedPhys:X>
 * - Use for Actors/Enemies/States
 * - Adds an X% chance (X is a JS Eval) to parry physical while unarmed
 *   - user - the user
 *   - target - the target
 * <unhParryChanceMag:X>
 * - Use for Weapons/States
 * - Adds an X% chance (JS Eval) to reduce or negate magical damage
 *   - user - the user
 *   - target - the target
 * <unhBreakChancePhys:X>
 * - Use for Weapons/Skills/States
 * - Applies an X% reduction (JS Eval) to the target's Physical Parry chance
 *   - user - the user
 *   - target - the target
 * <unhBreakUnarmedPhys:X>
 * - Use for Actors/Enemies/States
 * - Adds an X% chance (X is a JS Eval) to break physical while unarmed
 *   - user - the user
 *   - target - the target
 * <unhBreakChanceMag:X>
 * - Use for Weapons/Skills/States
 * - Applies an X% reduction (JS Eval) to the target's Magical Parry chance
 *   - user - the user
 *   - target - the target
 * <unhParryPhysDR:X>
 * - Use for Weapons/States
 * - Applies a multiplier of X% (JS Eval) to physical damage on a successful 
 *   parry (Mit Only)
 *   - user - the user
 *   - target - the target
 * <unhParryMagDR:X>
 * - Use for Weapons/States
 * - Applies a multiplier of X% (JS Eval) to magical damage on a successful 
 *   parry (Mit Only)
 *   - user - the user
 *   - target - the target
 */
//=============================================================================

const UNH_ParryBreak = {};
UNH_ParryBreak.pluginName = 'UNH_ParryBreak';
UNH_ParryBreak.parameters = PluginManager.parameters(UNH_ParryBreak.pluginName);
UNH_ParryBreak.DodgeOrMit = !!UNH_ParryBreak.parameters['DodgeOrMit'];
UNH_ParryBreak.BaseDamageMult = String(UNH_ParryBreak.parameters['BaseDamageMult'] || "0");

Game_Battler.prototype.unhParryRelevantObjects = function() {
  const objects = [];
  for (const state of this.states()) {
    if (!state.meta) continue;
    if (!!state.meta.unhParryBreakEquip) objects.push(state);
  }
  if (this.isActor()) {
    for (const weapon of this.weapons()) {
      objects.push(weapon);
    }
  }
  return objects;
};

Game_Battler.prototype.unhParryBoostingObjects = function() {
  const objects = [];
  for (const state of this.states()) {
    if (!state.meta) continue;
    if (!state.meta.unhParryChancePhys) continue;
    if (!state.meta.unhParryChanceMag) continue;
    if (!state.meta.unhParryUnarmedPhys) continue;
    if (!state.meta.unhParryBreakEquip) objects.push(state);
  }
  return objects;
};

Game_Action.prototype.unhCanParry = function(target) {
  if (this.isCertainHit()) return false;
  const user = this.subject();
  return target.unhParryRelevantObjects().some(function(obj) {
    const meta = obj.meta;
    if (!meta) return false;
    let parryChance = 0;
	if (this.isPhysical() && !!meta.unhParryChancePhys) {
      parryChance = eval(meta.unhParryChancePhys);
    } else if (this.isMagical() && !!meta.unhParryChanceMag) {
      parryChance = eval(meta.unhParryChanceMag);
    }
    return parryChance > 0;
  });
};

Game_Action.prototype.unhBreakCheck = function(target) {
  const user = this.subject();
  let breakChecks = 1;
  for (const obj of user.unhParryRelevantObjects()) {
    const meta = obj.meta;
    if (!meta) continue;
    const breakChance = this.isPhysical() ? String(meta.unhBreakChancePhys) : String(meta.unhBreakChanceMag);
    if (!breakChance) continue;
    breakChecks *= 1 - (eval(breakChance) / 100);
  }
  for (const obj of user.unhParryBoostingObjects()) {
    const meta = obj.meta;
    if (!meta) continue;
    const breakPlus = this.isPhysical() ? String(meta.unhBreakChancePhys) : String(meta.unhBreakChanceMag);
    if (!breakPlus) continue;
    breakChecks += (eval(breakPlus) / 100);
  }
  return breakChecks;
};

Game_Action.prototype.unhBreakUnarmedCheck = function(target) {
  const user = this.subject();
  let breakChecks = 1;
  for (const obj of user.traitObjects()) {
    const meta = obj.meta;
    if (!meta) continue;
    const breakChance = this.isPhysical() ? String(meta.unhBreakUnarmedPhys) : '0';
    if (!breakChance) continue;
    breakChecks *= 1 - (eval(breakChance) / 100);
  }
  return breakChecks;
};

Game_Action.prototype.unhParryPlus = function(target) {
  const user = this.subject();
  let parryChecks = 0;
  for (const obj of user.unhParryBoostingObjects()) {
    const meta = obj.meta;
    if (!meta) continue;
    const parryPlus = this.isPhysical() ? String(meta.unhParryChancePhys) : String(meta.unhParryChanceMag);
    if (!parryPlus) continue;
    parryChecks += (eval(parryPlus) / 100);
  }
  return parryChecks;
};

Game_Action.prototype.unhParryChecks = function(target) {
  const user = this.subject();
  const parryChecks = [];
  for (const obj of target.unhParryRelevantObjects()) {
    const meta = obj.meta;
    if (!meta) continue;
    const parryChance = this.isPhysical() ? String(meta.unhBreakChancePhys).trim() : String(meta.unhBreakChanceMag).trim();
    if (!parryChance) continue;
    parryChecks.push(((eval(parryChance) / 100) + user.unhParryPlus(target)) * (1 - this.unhBreakCheck(target)));
  }
  return parryChecks;
};

Game_Action.prototype.unhUnarmedParryChecks = function(target) {
  const user = this.subject();
  const parryChecks = [];
  for (const obj of user.traitObjects()) {
    const meta = obj.meta;
    if (!meta) continue;
    const parryChance = this.isPhysical() ? String(meta.unhBreakUnarmedPhys).trim() : '0';
    if (!parryChance) continue;
    parryChecks.push((eval(parryChance) / 100) * (1 - this.unhBreakUnarmedCheck(target)));
  }
  return parryChecks;
};

Game_Action.prototype.unhIsParry = function(array) {
  if (this.isCertainHit()) return false;
  return array.some(function(parry) {
    return Math.random() < parry;
  });
};

if (!!UNH_ParryBreak.DodgeOrMit) {
  if (!!Imported.VisuMZ_0_CoreEngine) {
    UNH_ParryBreak.Action_itemHit = Game_Action.prototype.itemHit;
    Game_Action.prototype.itemHit = function(target) {
      if (!VisuMZ.CoreEngine.Settings.QoL.ImprovedAccuracySystem) return UNH_ParryBreak.Action_itemHit.call(this, target);
      if (this.isCertainHit()) return 1;
      if (!!this.item().meta) {
        if (!!this.item().meta.unhParryBreakSkip) return UNH_ParryBreak.Action_itemHit.call(this, target);
      }
      if (!!Ramza._loaded_WAF_Ext) {
        if (this.subject().isDisarmed()) {
          if (this.unhIsParry(this.unhUnarmedParryChecks(target))) return 0;
        } else {
          if (this.unhIsParry(this.unhParryChecks(target))) return 0;
        }
      } else {
        if (this.unhIsParry(this.unhParryChecks(target))) return 0;
      }
      return UNH_ParryBreak.Action_itemHit.call(this, target);
    };

    UNH_ParryBreak.Action_itemEva = Game_Action.prototype.itemEva;
    Game_Action.prototype.itemEva = function(target) {
      if (!!VisuMZ.CoreEngine.Settings.QoL.ImprovedAccuracySystem) return UNH_ParryBreak.Action_itemEva.call(this, target);
      if (this.isCertainHit()) return 0;
      if (!!this.item().meta) {
        if (!!this.item().meta.unhParryBreakSkip) return UNH_ParryBreak.Action_itemEva.call(this, target);
      }
      if (!!Ramza._loaded_WAF_Ext) {
        if (this.subject().isDisarmed()) {
          if (this.unhIsParry(this.unhUnarmedParryChecks(target))) return 1;
        } else {
          if (this.unhIsParry(this.unhParryChecks(target))) return 1;
        }
      } else {
        if (this.unhIsParry(this.unhParryChecks(target))) return 1;
      }
      return UNH_ParryBreak.Action_itemEva.call(this, target);
    };
  } else {
    UNH_ParryBreak.Action_itemEva = Game_Action.prototype.itemEva;
    Game_Action.prototype.itemEva = function(target) {
      if (this.isCertainHit()) return 0;
      if (!!this.item().meta) {
        if (!!this.item().meta.unhParryBreakSkip) return UNH_ParryBreak.Action_itemEva.call(this, target);
      }
      if (!!Ramza._loaded_WAF_Ext) {
        if (this.subject().isDisarmed()) {
          if (this.unhIsParry(this.unhUnarmedParryChecks(target))) return 1;
        } else {
          if (this.unhIsParry(this.unhParryChecks(target))) return 1;
        }
      } else {
        if (this.unhIsParry(this.unhParryChecks(target))) return 1;
      }
      return UNH_ParryBreak.Action_itemEva.call(this, target);
    };
  }
} else {
  Game_Action.prototype.unhParryBaseDamageMult = function(target) {
    const user = this.subject();
	const baseMult = String(UNH_ParryBreak.parameters['BaseDamageMult']);
	if (!baseMult) return 0;
    return eval(baseMult);
  };

  Game_Action.prototype.unhParryDR = function(target) {
    if (this.isCertainHit()) return 1;
    const user = this.subject();
    let mult = this.unhParryBaseDamageMult(target);
    if (this.unhCanParry()) {
      for (const obj of target.unhParryRelevantObjects()) {
        const meta = obj.meta;
        if (!meta) continue;
        const physDrString = (!!meta.unhParryPhysDR) ? String(meta.unhParryPhysDR) : "100";
        const magDrString = (!!meta.unhParryMagDR) ? String(meta.unhParryMagDR) : "100";
        const damageMult = this.isPhysical() ? physDrString : magDrString;
        if (!damageMult) continue;
        mult *= (eval(damageMult) / 100);
      }
    }
    return mult;
  };

  Game_Action.prototype.parryDamageMult = function(target) {
    if (this.isCertainHit()) return 1;
    if (!!Ramza._loaded_WAF_Ext) {
      if (this.subject().isDisarmed()) {
        if (this.unhIsParry(this.unhUnarmedParryChecks(target))) return this.unhParryDR(target);
      } else {
        if (this.unhIsParry(this.unhParryChecks(target))) return this.unhParryDR(target);
      }
    } else {
      if (this.unhIsParry(this.unhParryChecks(target))) return this.unhParryDR(target);
    }
    return 1;
  };

  UNH_ParryBreak.Action_evalDamageFormula = Game_Action.prototype.evalDamageFormula;
  Game_Action.prototype.evalDamageFormula = function(target) {
    let value = UNH_ParryBreak.Action_evalDamageFormula.call(this, target);
    if (!!this.item().meta) {
      if (!!this.item().meta.unhParryBreakSkip) return value;
    }
    const mult = this.parryDamageMult(target);
    return value * mult;
  };
}
//=============================================================================
// Unhinged Development - Skill Function Overwrites
// UNH_SkillFunctionOverwrites.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [SkillFunctionOverwrites]
 * @author Unhinged Developer
 *
 * @param applyOverload
 * @text action.apply() Overload
 * @desc 
 * @type note
 * @default "UNH_SkillFunctionOverwrites.Action_apply.call(this, target);"
 *
 * @param makeDamageValueOverload
 * @text action.makeDamageValue() Overload
 * @desc 
 * @type note
 * @default "return UNH_SkillFunctionOverwrites.Action_makeDamageValue.call(this, target, critical);"
 *
 * @param executeDamageOverload
 * @text action.executeDamage() Overload
 * @desc 
 * @type note
 * @default "UNH_SkillFunctionOverwrites.Action_executeDamage.call(this, target, value);"
 *
 * @param executeHpDamageOverload
 * @text action.executeHpDamage() Overload
 * @desc 
 * @type note
 * @default "UNH_SkillFunctionOverwrites.Action_executeHpDamage.call(this, target, value);"
 *
 * @param executeMpDamageOverload
 * @text action.executeMpDamage() Overload
 * @desc 
 * @type note
 * @default "UNH_SkillFunctionOverwrites.Action_executeMpDamage.call(this, target, value);"
 *
 * @param applyItemEffectOverload
 * @text action.applyItemEffect() Overload
 * @desc 
 * @type note
 * @default "UNH_SkillFunctionOverwrites.Action_applyItemEffect.call(this, target, effect);"
 *
 * @param applyItemUserEffectOverload
 * @text action.applyItemUserEffect() Overload
 * @desc 
 * @type note
 * @default "UNH_SkillFunctionOverwrites.Action_applyItemUserEffect.call(this, target);"
 *
 * @help
 * ============================================================================
 * Overridden Functions
 * ============================================================================
 *
 * Game_Action.prototype.apply()
 * Game_Action.prototype.executeDamage()
 * Game_Action.prototype.executeHpDamage()
 * Game_Action.prototype.executeMpDamage()
 * Game_Action.prototype.makeDamageValue()
 * Game_Action.prototype.applyItemEffect()
 * Game_Action.prototype.applyItemUserEffect()
 */
//=============================================================================

const UNH_SkillFunctionOverwrites = {};
UNH_SkillFunctionOverwrites.pluginName = 'UNH_SkillFunctionOverwrites';
UNH_SkillFunctionOverwrites.parameters = PluginManager.parameters(UNH_SkillFunctionOverwrites.pluginName);
UNH_SkillFunctionOverwrites.applyOverload = String(UNH_SkillFunctionOverwrites.parameters['applyOverload'] || "");
UNH_SkillFunctionOverwrites.makeDamageValueOverload = String(UNH_SkillFunctionOverwrites.parameters['makeDamageValueOverload'] || "");
UNH_SkillFunctionOverwrites.executeDamageOverload = String(UNH_SkillFunctionOverwrites.parameters['executeDamageOverload'] || "");
UNH_SkillFunctionOverwrites.executeHpDamageOverload = String(UNH_SkillFunctionOverwrites.parameters['executeHpDamageOverload'] || "");
UNH_SkillFunctionOverwrites.executeMpDamageOverload = String(UNH_SkillFunctionOverwrites.parameters['executeMpDamageOverload'] || "");
UNH_SkillFunctionOverwrites.applyItemEffectOverload = String(UNH_SkillFunctionOverwrites.parameters['applyItemEffectOverload'] || "");
UNH_SkillFunctionOverwrites.applyItemUserEffectOverload = String(UNH_SkillFunctionOverwrites.parameters['applyItemUserEffectOverload'] || "");

UNH_SkillFunctionOverwrites.Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  const codeString = UNH_SkillFunctionOverwrites.applyOverload;
  if (codeString.length <= 0) {
    UNH_SkillFunctionOverwrites.Action_apply.call(this, target);
	return;
  }
  const override = new Function('target', codeString);
  try {
    override.call(this, target);
  } catch (e) {
    UNH_SkillFunctionOverwrites.Action_apply.call(this, target);
  }
};

UNH_SkillFunctionOverwrites.Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
Game_Action.prototype.makeDamageValue = function(target, critical) {
  const codeString = UNH_SkillFunctionOverwrites.makeDamageValueOverload;
  if (codeString.length <= 0) {
    return UNH_SkillFunctionOverwrites.Action_makeDamageValue.call(this, target, critical);
  }
  const override = new Function('target', 'critical', codeString);
  let value = 0;
  try {
    value = override.call(this, target, critical);
  } catch (e) {
    return UNH_SkillFunctionOverwrites.Action_makeDamageValue.call(this, target, critical);
  }
  return value;
};

UNH_SkillFunctionOverwrites.Action_executeDamage = Game_Action.prototype.executeDamage;
Game_Action.prototype.executeDamage = function(target, value) {
  const codeString = UNH_SkillFunctionOverwrites.executeDamageOverload;
  if (codeString.length <= 0) {
    UNH_SkillFunctionOverwrites.Action_executeDamage.call(this);
	return;
  }
  const override = new Function('target', 'value', codeString);
  try {
    override.call(this, target, value);
  } catch (e) {
    UNH_SkillFunctionOverwrites.Action_executeDamage.call(this, target, value);
  }
};

UNH_SkillFunctionOverwrites.Action_executeHpDamage = Game_Action.prototype.executeHpDamage;
Game_Action.prototype.executeHpDamage = function(target, value) {
  const codeString = UNH_SkillFunctionOverwrites.executeHpDamageOverload;
  if (codeString.length <= 0) {
    UNH_SkillFunctionOverwrites.Action_executeHpDamage.call(this);
	return;
  }
  const override = new Function('target', 'value', codeString);
  try {
    override.call(this, target, value);
  } catch (e) {
    UNH_SkillFunctionOverwrites.Action_executeHpDamage.call(this);
  }
};

UNH_SkillFunctionOverwrites.Action_executeMpDamage = Game_Action.prototype.executeMpDamage;
Game_Action.prototype.executeMpDamage = function(target, value) {
  const codeString = UNH_SkillFunctionOverwrites.executeMpDamageOverload;
  if (codeString.length <= 0) {
    UNH_SkillFunctionOverwrites.Action_executeMpDamage.call(this);
	return;
  }
  const override = new Function('target', 'value', codeString);
  try {
    override.call(this, target, value);
  } catch (e) {
    UNH_SkillFunctionOverwrites.Action_executeMpDamage.call(this);
  }
};

UNH_SkillFunctionOverwrites.Action_applyItemEffect = Game_Action.prototype.applyItemEffect;
Game_Action.prototype.applyItemEffect = function(target, effect) {
  const codeString = UNH_SkillFunctionOverwrites.applyItemEffectOverload;
  if (codeString.length <= 0) {
    UNH_SkillFunctionOverwrites.Action_applyItemEffect.call(this, target, effect);
	return;
  }
  const override = new Function('target', 'effect', codeString);
  try {
    override.call(this, target, effect);
  } catch (e) {
    UNH_SkillFunctionOverwrites.Action_applyItemEffect.call(this, target, effect);
  }
};

UNH_SkillFunctionOverwrites.Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
Game_Action.prototype.applyItemUserEffect = function(target) {
  const codeString = UNH_SkillFunctionOverwrites.applyItemUserEffectOverload;
  if (codeString.length <= 0) {
    UNH_SkillFunctionOverwrites.Action_applyItemUserEffect.call(this, target);
	return;
  }
  const override = new Function('target', codeString);
  try {
    override.call(this, target);
  } catch (e) {
    UNH_SkillFunctionOverwrites.Action_applyItemUserEffect.call(this, target);
  }
};
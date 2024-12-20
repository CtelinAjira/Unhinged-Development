//=============================================================================
// Unhinged Development - VS Action Sequences: Enemy Weapons
// UNH_VS_EnemyWeapons.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_VS_EnemyWeapons = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_EnemyWeapons]
 * @author Unhinged Developer
 * @base VisuMZ_1_BattleCore
 * @orderAfter VisuMZ_1_BattleCore
 * @orderAfter VisuMZ_3_WeaponAnimation
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * <Disarm State>
 * - Marks this state to act as a disarming check.
 *   - Being disarmed means your weapons are treated as null.
 *
 * <Slot X:Y>
 * - Marks this enemy as equipped with this item.
 *   - X is the slot ID for that equipment slot.
 *     - Indexed at per Equipment Types in the System tab of your database
 *   - Y is the database ID for the armor/weapon being "given".
 *
 * ============================================================================
 * Adapted Functions
 * ============================================================================
 *
 * enemy.currentClass();
 * enemy.equips();
 * enemy.armors();
 * enemy.weapons();
 * enemy.hasNoWeapons();
 */
//=============================================================================

const UNH_VS_EnemyWeapons = {};
UNH_VS_EnemyWeapons.pluginName = 'UNH_VS_EnemyWeapons';

PluginManager.registerCommand("VisuMZ_1_BattleCore", "ActSeq_Weapon_ClearActiveWeapon", params => {
  if (!SceneManager.isSceneBattle()) {
    return;
  }
  VisuMZ.ConvertParams(params, params);
  const targets = VisuMZ.CreateActionSequenceTargets(params.Targets);
  for (const target of targets) {
    if (!target) {
      continue;
    }
    target.clearActiveWeaponSlot();
  }
});

PluginManager.registerCommand("VisuMZ_1_BattleCore", "ActSeq_Weapon_NextActiveWeapon", params => {
  if (!SceneManager.isSceneBattle()) {
    return;
  }
  VisuMZ.ConvertParams(params, params);
  const interpreter = $gameTemp.getLastPluginCommandInterpreter();
  let hasWeapons = false;
  const jumpTo = params.JumpToLabel;
  const targets = VisuMZ.CreateActionSequenceTargets(params.Targets);
  for (const target of targets) {
    if (!target) {
      continue;
    }
    target.nextActiveWeaponSlot();
    if (target.weapons().length > 0) {
      hasWeapons = true;
    } else {
      target.clearActiveWeaponSlot();
    }
  }
  if (hasWeapons && jumpTo.toUpperCase().trim() !== "UNTITLED") {
    interpreter.command119([jumpTo]);
  }
});

PluginManager.registerCommand("VisuMZ_1_BattleCore", "ActSeq_Weapon_SetActiveWeapon", params => {
  if (!SceneManager.isSceneBattle()) {
    return;
  }
  VisuMZ.ConvertParams(params, params);
  let slotId = params.SlotID;
  slotId--;
  slotId = Math.max(slotId, 0);
  const targets = VisuMZ.CreateActionSequenceTargets(params.Targets);
  for (const target of targets) {
    if (!target) {
      continue;
    }
    target.setActiveWeaponSlot(slotId);
  }
});

Game_Battler.prototype.setActiveWeaponSlot = function (slotIndex) {
  const weapons = this.weapons();
  if (weapons.length > 0) {
    const weapon = weapons[slotIndex];
    if (weapon) {
      slotIndex = this.equips().indexOf(weapon);
    }
  }
  this._activeWeaponSlot = slotIndex || 0;
  this._cache = {};
};

UNH_VS_EnemyWeapons.Enemy_setup = Game_Enemy.prototype.setup;
Game_Enemy.prototype.setup = function(enemyId, x, y) {
  UNH_VS_EnemyWeapons.Enemy_setup.call(this, enemyId, x, y);
  this.initEquips();
};

UNH_VS_EnemyWeapons.Actor_equips = Game_Actor.prototype.equips;
Game_Actor.prototype.equips = function() {
  const isDisarmed = this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    return !!state.meta['Disarm State'];
  });
  let object;
  if (isDisarmed) {
    return this._equips.map(function(item) {
      if (!item) {
        return null;
      }
      object = item.object();
      if (isDisarmed && DataManager.isWeapon(object)) {
        return null;
      }
      return object;
    });
  }
  return UNH_VS_EnemyWeapons.Actor_equips.call(this);
};

Game_Enemy.prototype.initEquips = function() {
  this._equips = [];
  let eqpEval;
  let slotName;
  let eqpId;
  for (let h = 0; h < $gameSystem.equipTypes.length; h++) {
    this._equips.push(null);
  }
  for (let i = 1; i <= $gameSystem.equipTypes.length; i++) {
    slotName = 'Slot ' + i;
    if (!this.enemy().meta) continue;
    if (!this.enemy().meta[slotName]) continue;
    try {
      eqpId = Number(eval(this.enemy().meta[slotName]));
      if (i === 1) {
        this._equips[i - 1] = $dataWeapons[eqpId];
      } else if (i === 2 && this.isDualWield()) {
        this._equips[i - 1] = $dataWeapons[eqpId];
      } else {
        this._equips[i - 1] = $dataArmors[eqpId];
      }
    } catch (e) {
      this._equips[i - 1] = null;
    }
  }
};

Game_Enemy.prototype.equipSlots = function() {
    const slots = [];
    for (let i = 1; i < $dataSystem.equipTypes.length; i++) {
        slots.push(i);
    }
    if (slots.length >= 2 && this.isDualWield()) {
        slots[1] = 1;
    }
    return slots;
};

Game_Enemy.prototype.equips = function() {
  if (!this._equips) this.initEquips();
  if (!Array.isArray(this._equips)) this.initEquips();
  if (this._equips.length <= 0) this.initEquips();
  const equips = this._equips;
  for (const state of this.states()) {
    if (!state) continue;
    if (!state.meta) continue;
    if (!state.meta['Disarm State']) continue;
	for (let i = 0; i < equips.length; i++) {
      if (DataManager.isWeapon(equips[i])) equips[i] = null;
    }
    break;
  }
  if (this._tempEquipCheck) {
    return equips;
  }
  if (this._activeWeaponSlot !== undefined) {
    this._tempEquipCheck = true;
    const equipSlots = this.equipSlots();
    for (let i = 0; i < equipSlots.length; i++) {
      if (equipSlots[i] === 1 && this._activeWeaponSlot !== i) {
        equips[i] = null;
      }
    }
    this._tempEquipCheck = undefined;
  }
  return equips;
};

Game_Enemy.prototype.weapons = function() {
  return this.equips().filter(function(item) {
    if (!item) return false;
    return DataManager.isWeapon(item);
  });
};

Game_Enemy.prototype.armors = function() {
  return this.equips().filter(function(item) {
    if (!item) return false;
    return DataManager.isArmor(item);
  });
};

Game_Enemy.prototype.hasNoWeapons = function() {
    return this.weapons().length === 0;
};

UNH_VS_EnemyWeapons.Enemy_traitObjects = Game_Enemy.prototype.traitObjects;
Game_Enemy.prototype.traitObjects = function() {
  const objects = UNH_VS_EnemyWeapons.Enemy_traitObjects.call(this);
  for (const item of this.equips()) {
    if (item) {
      objects.push(item);
    }
  }
  return objects;
};

UNH_VS_EnemyWeapons.Enemy_performWeaponAnimation = Game_Enemy.prototype.performWeaponAnimation;
Game_Enemy.prototype.performWeaponAnimation = function () {
  const defVal = UNH_VS_EnemyWeapons.Enemy_performWeaponAnimation.call(this);
  if (this.hasNoWeapons()) return defVal;
  const weapons = this.weapons().filter(function(weapon) {
    return !!weapon;
  });
  const weaponId = weapons[0] ? weapons[0].wtypeId : defVal;
  const motion = $dataSystem.attackMotions[weaponId];
  if (motion) {
    this.startWeaponAnimation(motion.weaponImageId);
  }
};

UNH_VS_EnemyWeapons.Enemy_attackAnimationIdSlot = Game_Enemy.prototype.attackAnimationIdSlot;
Game_Enemy.prototype.attackAnimationIdSlot = function (slotId) {
  const defVal = UNH_VS_EnemyWeapons.Enemy_attackAnimationIdSlot.call(this);
  if (this.hasNoWeapons()) return defVal;
  slotId = slotId || 1;
  slotId--;
  const weapons = this.weapons();
  return weapons[slotId] ? weapons[slotId].animationId : defVal;
};

UNH_VS_EnemyWeapons.Enemy_getAttackMotion = Game_Enemy.prototype.getAttackMotion;
Game_Enemy.prototype.getAttackMotion = function () {
  const defVal = UNH_VS_EnemyWeapons.Enemy_getAttackMotion.call(this);
  if (this.hasNoWeapons()) return defVal;
  const weapons = this.weapons();
  const weaponId = weapons[0] ? weapons[0].wtypeId : defVal;
  return $dataSystem.attackMotions[weaponId];
};

UNH_VS_EnemyWeapons.Enemy_getAttackMotionSlot = Game_Enemy.prototype.getAttackMotionSlot;
Game_Actor.prototype.getAttackMotionSlot = function (slotId) {
  const defVal = UNH_VS_EnemyWeapons.Enemy_getAttackMotionSlot.call(this);
  if (this.hasNoWeapons()) return defVal;
  slotId = slotId || 1;
  slotId--;
  const weapons = this.weapons();
  const weaponId = weapons[slotId] ? weapons[slotId].wtypeId : defVal;
  return $dataSystem.attackMotions[weaponId];
};

Game_Enemy.prototype.performAttackSlot = function (slotId) {
  slotId = slotId || 1;
  slotId--;
  const weapons = this.weapons();
  const weaponId = weapons[slotId] ? weapons[slotId].wtypeId : 0;
  const motion = $dataSystem.attackMotions[weaponId];
  if (motion) {
    if (motion.type === 0) {
      this.requestMotion("thrust");
    } else {
      if (motion.type === 1) {
        this.requestMotion("swing");
      } else if (motion.type === 2) {
        this.requestMotion("missile");
      }
    }
    this.startWeaponAnimation(motion.weaponImageId);
  }
};
//=============================================================================
// Unhinged Development - VS ActSeq + Items & Equip Core: Enemy Gear
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
 * @base VisuMZ_1_ItemsEquipsCore
 * @orderAfter VisuMZ_1_BattleCore
 * @orderAfter VisuMZ_1_ItemsEquipsCore
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
 * <Dual Wield>
 * - Marks this enemy as dual wielding.
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

UNH_VS_EnemyWeapons.Boot_process_VisuMZ_ItemsEquipsCore_EquipSlots = Scene_Boot.prototype.process_VisuMZ_ItemsEquipsCore_EquipSlots;
Scene_Boot.prototype.process_VisuMZ_ItemsEquipsCore_EquipSlots = function () {
  UNH_VS_EnemyWeapons.Boot_process_VisuMZ_ItemsEquipsCore_EquipSlots.call(this);
  for (const enemy of $dataEnemies) {
    if (!enemy) {
      continue;
    }
    VisuMZ.ItemsEquipsCore.Parse_Notetags_EquipSlots(enemy);
  }
};

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
  const fullEquips = UNH_VS_EnemyWeapons.Actor_equips.call(this);
  let object;
  if (this.isDisarmed()) {
    const partEquips = [];
    for (let i = 0; i < fullEquips.length; i++) {
      if (DataManager.isWeapon(fullEquips[i])) {
        partEquips.push(null);
      } else {
        partEquips.push(fullEquips[i]);
      }
    }
    return partEquips;
  }
  return fullEquips;
};

Game_Enemy.prototype.unhIsDualWield = function() {
  const user = this;
  const object = this.enemy();
  if (!object) return false;
  const meta = object.meta;
  if (!meta) return false;
  return !!eval(meta['Dual Wield']);
};

Game_BattlerBase.prototype.isDisarmed = function() {
  return this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    return !!state.meta['Disarm State'];
  });
};

Game_Enemy.prototype.getMatchingInitEquip = function (equips, equipType) {
  for (const item of equips) {
    if (!item) {
      continue;
    }
    if (item.etypeId === equipType) {
      equips.splice(equips.indexOf(item), 1);
      return item;
    }
  }
  return null;
};

Game_Enemy.prototype.equipSlots = function () {
  const slots = VisuMZ.ItemsEquipsCore.deepCopy(this._forcedSlots || this.enemy().equipSlots);
  if (slots.length >= 2 && this.isDualWield()) {
    slots[1] = 1;
  }
  return slots;
};

Game_Enemy.prototype.initEquips = function() {
  const slots = this.equipSlots();
  const maxSlots = slots.length;
  this._equips = [];
  let slotName;
  const equips = [];
  for (let h = 0; h < maxSlots; h++) {
    slotName = 'Slot ' + h;
    if (!this.enemy().meta) {
      equips[h] = 0;
    } else if (!this.enemy().meta[slotName]) {
      equips[h] = 0;
    } else if (isNaN(this.enemy().meta[slotName])) {
      equips[h] = 0;
    } else {
      equips[h] = Number(eval(this.enemy().meta[slotName]));
    }
  }
  for (let i = 0; i < maxSlots; i++) {
    this._equips[i] = new Game_Item();
  }
  for (let j = 0; j <= maxSlots; j++) {
    const slot = slots[j];
    const equip = this.getMatchingInitEquip(equips, slot);
    this._equips[j].setObject(equip);
  }
  this.refresh();
};

Game_Enemy.prototype.equips = function() {
  if (!this._equips) this.initEquips();
  if (!Array.isArray(this._equips)) this.initEquips();
  if (this._equips.length <= 0) this.initEquips();
  const equips = this._equips.map(function(item) {
    return item.object();
  });
  if (this.isDisarmed()) {
	for (let i = 0; i < equips.length; i++) {
      if (DataManager.isWeapon(equips[i])) equips[i] = null;
    }
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

Game_Enemy.prototype.isWtypeEquipped = function(wtypeId) {
  return this.weapons().some(function(weapon) {
    if (!weapon) return false;
    return (weapon.wtypeId === wtypeId);
  });
};

UNH_VS_EnemyWeapons.Actor_hasNoWeapons = Game_Actor.prototype.hasNoWeapons;
Game_Enemy.prototype.hasNoWeapons = function() {
  if (this.isDisarmed()) return true;
  return UNH_VS_EnemyWeapons.Actor_hasNoWeapons.call(this);
};

Game_Enemy.prototype.hasNoWeapons = function() {
  if (this.isDisarmed()) return true;
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
  if (!weapons[0]) return defVal;
  const weaponId = weapons[0].wtypeId;
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
  if (!weapons[slotId]) return defVal;
  return weapons[slotId].animationId;
};

UNH_VS_EnemyWeapons.Enemy_getAttackMotion = Game_Enemy.prototype.getAttackMotion;
Game_Enemy.prototype.getAttackMotion = function () {
  const defVal = UNH_VS_EnemyWeapons.Enemy_getAttackMotion.call(this);
  if (this.hasNoWeapons()) return defVal;
  const weapons = this.weapons();
  if (!weapons[0]) return defVal;
  const weaponId = weapons[0].wtypeId;
  return $dataSystem.attackMotions[weaponId];
};

UNH_VS_EnemyWeapons.Enemy_getAttackMotionSlot = Game_Enemy.prototype.getAttackMotionSlot;
Game_Enemy.prototype.getAttackMotionSlot = function (slotId) {
  const defVal = UNH_VS_EnemyWeapons.Enemy_getAttackMotionSlot.call(this, slotId);
  if (this.hasNoWeapons()) return defVal;
  slotId = slotId || 1;
  slotId--;
  const weapons = this.weapons();
  if (!weapons[slotId]) return defVal;
  const weaponId = weapons[slotId].wtypeId;
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
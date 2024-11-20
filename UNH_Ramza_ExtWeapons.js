//=============================================================================
// Unhinged Development - Ramza Weapon Attack Formulas: Extended Weapons
// UNH_Ramza_ExtWeapons.js
//=============================================================================

var Ramza = Ramza || {};

//=============================================================================
 /*:
 * @target MZ
 * @base Ramza_WeaponAttackFormulas
 * @orderAfter Ramza_WeaponAttackFormulas
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [Ramza_ExtWeapons]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <unhRamzaWeaponId:X>
 * - Use for Actors / Enemies / States
 * - Marks an enemy as using weapon X (Database ID)
 * 
 * <unhRamzaDisarm>
 * - Use for States
 * - Marks the afflicted as having no weapon.
 */
//=============================================================================

const UNH_Ramza_ExtWeapons = {};
UNH_Ramza_ExtWeapons.pluginName = 'UNH_Ramza_ExtWeapons';

UNH_Ramza_ExtWeapons.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_Ramza_ExtWeapons.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!Ramza._loaded_WAF_Ext) {
	Ramza._loaded_WAF_Ext = true;
  }
  return true;
};

Game_BattlerBase.prototype.isDisarmed = function() {
  return this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    return !!state.meta.unhRamzaDisarm;
  });
};

UNH_Ramza_ExtWeapons.Actor_attackElements = Game_Actor.prototype.attackElements;
Game_Actor.prototype.attackElements = function() {
  if (this.isDisarmed()) return [this.bareHandsElementId()];
  return UNH_Ramza_ExtWeapons.Actor_attackElements.call(this);
};

UNH_Ramza_ExtWeapons.Action_itemEffectAddAttackState = Game_Action.prototype.itemEffectAddAttackState;
Game_Action.prototype.itemEffectAddAttackState = function(target, effect) {
  if (this.subject().isDisarmed()) return;
  UNH_Ramza_ExtWeapons.Action_itemEffectAddAttackState.call(this, target, effect);
};

UNH_Ramza_ExtWeapons.Enemy_hasAttackReplacementFormula = Game_Enemy.prototype.hasAttackReplacementFormula;
Game_Enemy.prototype.hasAttackReplacementFormula = function() {
  if (this.isDisarmed()) return $gameSystem.getUnarmedFormula() !== '';
  for (const object of this.traitObjects()) {
    if (!object.meta) continue;
    if (object.meta.unhRamzaWeaponId !== undefined) {
      if (!isNaN(object.meta.unhRamzaWeaponId)) {
        const id = Number(object.meta.unhRamzaWeaponId) % $dataWeapons.length;
        if (id === 0) return $gameSystem.getUnarmedFormula() !== '';
        return $gameSystem.getWeaponFormula($dataWeapons[id]) !== '';
      }
    }
  }
  return UNH_Ramza_ExtWeapons.Enemy_hasAttackReplacementFormula.call(this);
};

UNH_Ramza_ExtWeapons.Enemy_getAttackReplacementFormula = Game_Enemy.prototype.getAttackReplacementFormula;
Game_Enemy.prototype.getAttackReplacementFormula = function() {
  if (this.isDisarmed()) return $gameSystem.getUnarmedFormula() !== '';
  for (const object of this.traitObjects()) {
    if (!object.meta) continue;
    if (object.meta.unhRamzaWeaponId !== undefined) {
      if (!isNaN(object.meta.unhRamzaWeaponId)) {
        const id = Number(object.meta.unhRamzaWeaponId) % $dataWeapons.length;
        if (id === 0) return $gameSystem.getUnarmedFormula();
        return $gameSystem.getWeaponFormula($dataWeapons[id]);
      }
    }
  }
  return UNH_Ramza_ExtWeapons.Enemy_getAttackReplacementFormula.call(this);
};

UNH_Ramza_ExtWeapons.Actor_getWeaponFormula = Game_Actor.prototype.getWeaponFormula;
Game_Actor.prototype.getWeaponFormula = function() {
  if (this.isDisarmed()) return $gameSystem.getUnarmedFormula() !== '';
  for (const object of this.traitObjects()) {
    if (!object.meta) continue;
    if (object.meta.unhRamzaWeaponId !== undefined) {
      if (!isNaN(object.meta.unhRamzaWeaponId)) {
        const id = Number(object.meta.unhRamzaWeaponId) % $dataWeapons.length;
        if (id === 0) return $gameSystem.getUnarmedFormula();
        return $gameSystem.getWtypeFormula($dataWeapons[id]);
      }
    }
  }
  return UNH_Ramza_ExtWeapons.Actor_getWeaponFormula.call(this);
};
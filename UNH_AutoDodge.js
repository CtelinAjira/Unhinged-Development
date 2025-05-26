//=============================================================================
// Unhinged Development - Automatic Dodging
// UNH_AutoDodge.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [AutoDodge]
 * @author Unhinged Developer
 * @orderAfter UNH_MiscFunc
 * @orderAfter VisuMZ_0_CoreEngine
 * @orderAfter VisuMZ_1_BattleCore
 *
 * @help
 */
//=============================================================================

const UNH_AutoDodge = {};
UNH_AutoDodge.pluginName = 'UNH_AutoDodge';

Game_Action.prototype.unhTruePEVA = function(target) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const chance = this.traitObjects().reduce(function(obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    if (!obj.meta['True PEVA']) return r;
    return r + Number(eval(obj.meta['True PEVA']));
  }, 0);
  return chance;
};

Game_Action.prototype.unhTrueMEVA = function(target) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const chance = target.traitObjects().reduce(function(obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    if (!obj.meta['True MEVA']) return r;
    return r + Number(eval(obj.meta['True MEVA']));
  }, 0);
  return chance;
};

Game_Action.prototype.unhTrueEVA = function(target, isMag) {
  let chance = 0;
  if (!!isMag) {
    chance = this.unhTrueMEVA(target);
  } else {
    chance = this.unhTruePEVA(target);
  }
  return ((Math.random() * 100) < chance);
};

UNH_AutoDodge.Action_itemEva = Game_Action.prototype.itemEva;
Game_Action.prototype.itemEva = function(target) {
  const baseVal = UNH_AutoDodge.Action_itemEva.call(this, target);
  if (this.isPhysical()) {
    if (this.unhTrueEVA(target, false)) return 1;
    return baseVal;
  } else if (this.isMagical()) {
    if (this.unhTrueEVA(target, true)) return 1;
    return baseVal;
  } else {
    return baseVal;
  }
};
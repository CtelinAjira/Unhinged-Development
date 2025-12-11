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

if (Imported.UNH_MiscFunc) {
  UNH_AutoDodge.targetTagCt = UNH_MiscFunc.targetTagCt;
} else {
  UNH_AutoDodge.targetTagCt = function(action, target, note) {
    const item = action.item();
    const user = action.subject();
    return target.traitObjects().reduce(function(r, obj) {
      if (!obj) return r;
      if (!obj.meta) return r;
      if (!obj.meta[note]) return r;
      const num = eval(obj.meta[note]);
      if (isNaN(num)) return r;
      return r + Number(num);
    }, 0);
  };
}

Game_Action.prototype.unhTruePEVA = function(target) {
  return UNH_AutoDodge.userTagCt(this, target, 'True PEVA');
};

Game_Action.prototype.unhTrueMEVA = function(target) {
  return UNH_AutoDodge.userTagCt(this, target, 'True MEVA');
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
  if (this.isCertainHit()) {
    return baseVal;
  } else {
    if (this.unhTrueEVA(target, this.isMagical())) return 1;
    return baseVal;
  }
};
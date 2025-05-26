//=============================================================================
// Unhinged Development - Elements & Status Menu Core: True Pierce
// UNH_VS_TruePierce.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_TruePierce]
 * @author Unhinged Developer
 * @base VisuMZ_1_ElementStatusCore
 * @orderAfter VisuMZ_1_ElementStatusCore
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * <Element True Pierce: x>
 *
 * - Used for: Actor/Class/Weapon/Armor/Enemy/State
 * - As the VS notetag <Element Pierce: x>, except it takes priority over 
     their reflect rules.
 */
//=============================================================================

const UNH_VS_TruePierce = {};
UNH_VS_TruePierce.pluginName = 'UNH_VS_TruePierce';

Game_BattlerBase.prototype.getTruePierceElements = function () {
  let eleIds = [];
  for (const obj of this.traitObjects()) {
    if (!obj) continue;
    const notetags = obj.note.match(/<ELEMENT TRUE PIERCE:[ ](.*)>/gi);
    if (notetags) {
      for (const note of notetags) {
        note.match(/<ELEMENT TRUE PIERCE:[ ](.*)>/i);
        const eleId = RegExp.$1;
        if (eleId.match(/(\d+(?:\s*,\s*\d+)*)/i)) {
          const ele = JSON.parse('[' + RegExp.$1.match(/\d+/g) + ']');
          eleIds = eleIds.concat(ele);
        } else {
          const eleList = eleId.split(',');
          for (const eleNum of eleList) {
            const eleCheck = DataManager.getElementIdWithName(eleNum);
            if (eleCheck) {
              eleIds.push(eleCheck);
            }
          }
        }
      }
    }
  }
  return eleIds;
};

UNH_VS_TruePierce.Action_itemMrf = Game_Action.prototype.itemMrf;
Game_Action.prototype.itemMrf = function (target) {
  const skillEle = this.elements() || [];
  const trueRefl = this.subject() ? this.subject().getTruePierceElements() : [];
  let isTruePierce = skillEle.every(function(eleId) {
    if (trueRefl.includes(eleId)) return false;
    return true;
  });
  if (!!isTruePierce) {
    return 0;
  } else {
    return UNH_VS_TruePierce.Action_itemMrf.call(this, target);
  }
};

UNH_VS_TruePierce.Action_calcElementRate = Game_Action.prototype.calcElementRate;
Game_Action.prototype.calcElementRate = function (target) {
  const baseRate = UNH_VS_TruePierce.Action_calcElementRate.call(this, target);
  const pierceEle = this.subject() ? this.subject().getTruePierceElements() : [];
  const hasEle = this.elements().some(function(eleId) {
    if (pierceEle.includes(eleId)) return true;
    return false;
  });
  if (!!hasEle) {
    return Math.max(1, baseRate);
  }
  return baseRate;
};
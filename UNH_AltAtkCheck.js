//=============================================================================
// Unhinged Development - Alternate isAttack Check
// UNH_AltAtkCheck.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [AltAtkCheck]
 * @author Unhinged Developer
 *
 * @help
 */
//=============================================================================

Game_Action.prototype.unhIsAttack = function(formula) {
  const item = this.item();
  if (item.damage.formula.includes(formula)) {
    return true;
  }
  return this.isAttack();
};
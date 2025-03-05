//=============================================================================
// Unhinged Development - Alternate isAttack Check
// UNH_AltAtkCheck.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.01] [Unhinged] [AltAtkCheck]
 * @author Unhinged Developer
 *
 * @param isAtkEff
 * @text Include Add State
 * @desc Check for if [Add State: Normal Attack] is in play?
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @help
 */
//=============================================================================

const UNH_AltAtkCheck = {};
UNH_AltAtkCheck.pluginName = 'UNH_AltAtkCheck';
UNH_AltAtkCheck.parameters = PluginManager.parameters(UNH_AltAtkCheck.pluginName);
UNH_AltAtkCheck.isAtkEff = !!UNH_AltAtkCheck.parameters['isAtkEff'];

Game_Action.prototype.unhIsAttack = function(formula) {
  const item = this.item();
  if (item.damage.formula.includes(formula)) {
    return true;
  }
  return this.isAttack();
};

if (UNH_AltAtkCheck.isAtkEff) {
  UNH_AltAtkCheck.Action_isAttack = Game_Action.prototype.isAttack;
  Game_Action.prototype.isAttack = function() {
    const hasAtkEff = item.effects.some(function(effect) {
      return (effect.code === 21 && effect.dataId === 0);
    });
    if (hasAtkEff) {
      return true;
    } else {
      return UNH_AltAtkCheck.Action_isAttack.call(this);
    }
  };
}
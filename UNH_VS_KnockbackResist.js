//=============================================================================
// Unhinged Development - VS Battle Grid System: Knockback Resistance
// UNH_VS_KnockbackResist.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_KnockbackResist]
 * @author Unhinged Developer
 * @base VisuMZ_2_BattleGridSystem
 * @orderAfter VisuMZ_2_BattleGridSystem
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * New notetags to allow for resistance to forced movement.
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Resist Knockback>
 * - Cancels forced movement, no questions asked.
 * 
 * <Resist Knockback: X%> (Number)
 * - X% chance to cancel forced movement.
 * 
 * <Resist Knockback: X.Y%> (Number, Number)
 * - X.Y% chance to cancel forced movement.
 * 
 * <Resist Knockback: X> (JS Eval)
 * - Cancels forced movement if X evals to true
 */
//=============================================================================

const UNH_VS_KnockbackResist = {};
UNH_VS_KnockbackResist.pluginName = 'UNH_VS_KnockbackResist';

UNH_VS_KnockbackResist.Action_applyBattleGridSystemTargetMovement = Game_Action.prototype.applyBattleGridSystemTargetMovement;
Game_Action.prototype.applyBattleGridSystemTargetMovement = function (target) {
  const regexp = UNH_VS_KnockbackResist.ResistKnockback;
  const note = this.item().note || '';
  if (note.match(/<RESIST KNOCKBACK>/i)) return;
  if (note.match(/<RESIST KNOCKBACK:[ ](\d+)([%％])>/i)) {
    const perChance = parseInt(RegExp.$1);
    const random = (Math.random() * 100);
    if (random < perChance) return;
  }
  if (note.match(/<RESIST KNOCKBACK:[ ](\d+).(\d+)([%％])>/i)) {
    const perChance = parseFloat(String(RegExp.$1) + '.' + String(RegExp.$2));
    const random = (Math.random() * 100);
    if (random < perChance) return;
  }
  if (note.match(/<RESIST KNOCKBACK:[ ](.*)>/i)) {
    const checkStr = String(RegExp.$1);
    const action = this;
    const user = this.subject();
    const item = this.item();
    const meta = item.meta;
    if (!!eval(checkStr)) return;
  }
  UNH_VS_KnockbackResist.Action_applyBattleGridSystemTargetMovement.call(this, target);
};
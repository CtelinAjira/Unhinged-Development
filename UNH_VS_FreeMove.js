//=============================================================================
// Unhinged Development - VS Battle Grid System: Freedom of Movement
// UNH_VS_FreeMove.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_FreeMove]
 * @author Unhinged Developer
 * @base VisuMZ_2_BattleGridSystem
 * @orderAfter VisuMZ_2_BattleGridSystem
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * New notetags to allow for resistance to movement sealing.
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Free Move>
 * - Unlocks otherwise sealed movement, no questions asked.
 * 
 * <Free Move: X%> (Number)
 * - X% chance to unlock otherwise sealed movement.
 * 
 * <Free Move: X.Y%> (Number, Number)
 * - X.Y% chance to unlock otherwise sealed movement.
 * 
 * <Free Move: X> (JS Eval)
 * - Unlocks otherwise sealed movement if X evals to true
 */
//=============================================================================

const UNH_VS_FreeMove = {};
UNH_VS_FreeMove.pluginName = 'UNH_VS_FreeMove';

UNH_VS_FreeMove.Battler_isNoGridMove = Game_Battler.prototype.isNoGridMove;
Game_Battler.prototype.isNoGridMove = function() {
  const userObj = ((this.isActor()) ? (this.actor()) : (this.enemy()));
  const note = (userObj.note || '');
  if (!note) return UNH_VS_FreeMove.Battler_isNoGridMove.call(this);
  if (note.match(/<FREE MOVE>/i)) return false;
  if (note.match(/<FREE MOVE:[ ](\d+)([%％])>/i)) {
    const perChance = parseInt(RegExp.$1);
    const random = (Math.random() * 100);
    return (random >= perChance);
  }
  if (note.match(/<FREE MOVE:[ ](\d+).(\d+)([%％])>/i)) {
    const perChance = parseFloat(String(RegExp.$1) + '.' + String(RegExp.$2));
    const random = (Math.random() * 100);
    return (random >= perChance);
  }
  if (note.match(/<FREE MOVE:[ ](.*)>/i)) {
    const checkStr = String(RegExp.$1);
    const action = this;
    const user = this.subject();
    const item = this.item();
    retutn !eval(checkStr);
  }
  return UNH_VS_FreeMove.Battler_isNoGridMove.call(this);
};

UNH_VS_FreeMove.Battler_isSealedGridMove = Game_Battler.prototype.isSealedGridMove;
Game_Battler.prototype.isSealedGridMove = function() {
  const userObj = ((this.isActor()) ? (this.actor()) : (this.enemy()));
  const note = (userObj.note || '');
  if (!note) return UNH_VS_FreeMove.Battler_isSealedGridMove.call(this);
  if (note.match(/<FREE MOVE>/i)) return false;
  if (note.match(/<FREE MOVE:[ ](\d+)([%％])>/i)) {
    const perChance = parseInt(RegExp.$1);
    const random = (Math.random() * 100);
    return (random >= perChance);
  }
  if (note.match(/<FREE MOVE:[ ](\d+).(\d+)([%％])>/i)) {
    const perChance = parseFloat(String(RegExp.$1) + '.' + String(RegExp.$2));
    const random = (Math.random() * 100);
    return (random >= perChance);
  }
  if (note.match(/<FREE MOVE:[ ](.*)>/i)) {
    const checkStr = String(RegExp.$1);
    const action = this;
    const user = this.subject();
    const item = this.item();
    retutn !eval(checkStr);
  }
  return UNH_VS_FreeMove.Battler_isSealedGridMove.call(this);
};
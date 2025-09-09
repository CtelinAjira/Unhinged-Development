//=============================================================================
// Unhinged Development - Parameter Swap
// UNH_ParamSwap.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [ParamSwap]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Swap x with y>
 * - Use for Actors/Skills/Weapons/Armors/Enemies/States
 * - Swaps stat X (string or number) with stat Y (string or number)
 *   - Only ATK (2), DEF (3), MAT (4), MDF (5), AGI (6), and LUK (7) are valid 
 *     to swap
 * 
 * ============================================================================
 * Altered Functions
 * ============================================================================
 * 
 * battler.param(paramId)
 * - added parameter "original" (boolean)
 *   - battler.param(paramId, true) bypasses the notetag functionality above
 *   - battler.param(paramId, false) parses the notetags normally
 *   - battler.param(paramId) parses the notetags normally
 */
//=============================================================================

const UNH_ParamSwap = {};
UNH_ParamSwap.pluginName = 'UNH_ParamSwap';

UNH_ParamSwap.BattlerBase_param = Game_BattlerBase.prototype.param;
Game_BattlerBase.prototype.param = function(paramId, original) {
  if (!!original) {
    return UNH_ParamSwap.BattlerBase_param.call(this, paramId);
  }
  const newParamId = this.getNewParamID(paramId);
  return UNH_ParamSwap.BattlerBase_param.call(this, newParamId);
};

Game_BattlerBase.prototype.getNewParamID = function(paramId) {
  const objects = this.traitObjects();
  let object;
  for (let i = 0; i < objects.length; i++) {
    object = objects[i];
    let index1 = 0;
    let index2 = 0;
    if (!!object && object.note.match(/<Swap (\d+) with (\d+)>/i)) {
      index1 = parseInt(RegExp.$1);
      index2 = parseInt(RegExp.$2);
    } else if (!!object && object.note.match(/<Swap (.*) with (.*)>/i)) {
      const parameters = ['mhp', 'mmp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];
      index1 = parameters.indexOf(String(RegExp.$1).toLowerCase().trim());
      index2 = parameters.indexOf(String(RegExp.$2).toLowerCase().trim());
    }
    if (index1 === undefined) continue;
    if (index2 === undefined) continue;
    if (index1 === null) continue;
    if (index2 === null) continue;
    if (isNaN(index1)) continue;
    if (isNaN(index2)) continue;
    if (index1 < 2) continue;
    if (index2 < 2) continue;
    if (index1 > 7) continue;
    if (index2 > 7) continue;
    if (index1 === index2) continue;
    if (index1 === paramId) {
      return index2;
    } else if (index2 === paramId) {
      return index1;
    }
  }
  return paramId;
};
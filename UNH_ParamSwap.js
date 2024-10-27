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
 */
//=============================================================================

const UNH_ParamSwap = {};
UNH_ParamSwap.pluginName = 'UNH_ParamSwap';

UNH_ParamSwap.BattlerBase_param = Game_BattlerBase.prototype.param;
Game_BattlerBase.prototype.param = function(paramId) {
  const newParamId = this.getNewParamID(paramId);
  return UNH_ParamSwap.BattlerBase_param.call(this, newParamId);
};

Game_BattlerBase.prototype.getNewParamID = function(paramId) {
  const objects = this.traitObjects();
  for (var i = 0; i < objects.length; i++) {
    var object = objects[i];
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
//=============================================================================
// Unhinged Development - Extra Parameters
// UNH_ExtraParam.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [ExtraParam]
 * @author Unhinged Developer
 *
 * @param CustParam
 * @text Custom Parameters
 * @desc The list of custom parameters
 * @type struct<ParamObj>[]
 * @default []
 *
 *~struct~ParamObj:
 * @param name
 * @text Parameter Name
 * @desc The name of this parameter
 * @type string
 * @default 
 *
 * @param code
 * @text Parameter Code
 * @desc The code for this parameter
 * @type note
 * @default "return 0;" 
 *
 * @param note
 * @text Parameter Note
 * @desc The notetag for this parameter
 * The variable 'note' in Parameter Code will reference this
 * @type string
 * @default 
 *
 * @help
 */
//=============================================================================

const UNH_ExtraParam = {};
UNH_ExtraParam.pluginName = 'UNH_ExtraParam';
UNH_ExtraParam.parameters = PluginManager.parameters(UNH_ExtraParam.pluginName);

UNH_ExtraParam.checkParams = function() {
  if (!UNH_ExtraParam.parameters['CustParam']) return false;
  if (!Array.isArray(UNH_ExtraParam.parameters['CustParam'])) return false;
  if (UNH_ExtraParam.parameters['CustParam'].length <= 0) return false;
  return true;
};

UNH_ExtraParam.defineParams = function() {
  if (!this.checkParams()) return {};
  const retParams = {};
  let paramEval;
  for (const param of this.parameters['CustParam']) {
    paramEval = Function(note, param.code);
    retParams[param.name] = {
      get: paramEval(param.note),
      configurable: true;
    }
  }
  return retParams;
};

if (UNH_ExtraParam.checkParams()) {
  Object.defineProperties(Game_BattlerBase.prototype, UNH_ExtraParam.defineParams());
}
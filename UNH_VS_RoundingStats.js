//=============================================================================
// Unhinged Development - VS Elements & Status Menu Core: Rounding Stats
// UNH_VS_RoundingStats.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [VS_RoundingStats]
 * @author Unhinged Developer
 * @base VisuMZ_1_ElementStatusCore
 * @orderAfter VisuMZ_1_ElementStatusCore
 *
 * @param Precision
 * @text Precision
 * @desc The number of digits to round to.
 * @type number
 * @default 2
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Round displayed stats appropriately
 */
//=============================================================================

const UNH_VS_RoundingStats = {};
UNH_VS_RoundingStats.pluginName = 'UNH_VS_RoundingStats';
UNH_VS_RoundingStats.parameters = PluginManager.parameters(UNH_VS_RoundingStats.pluginName);
UNH_VS_RoundingStats.Precision = Number(UNH_VS_RoundingStats.parameters['Precision'] || 0);

UNH_VS_RoundingStats.getPrecision = function() {
  return Math.max(Math.min(UNH_VS_RoundingStats.Precision, 8), 0);
};

UNH_VS_RoundingStats.roundResult = function(value, precision) {
  if (value === undefined) value = 0;
  if (precision === undefined) precision = UNH_VS_RoundingStats.getPrecision();
  return Number(Math.round(value + 'e' + precision) + 'e-' + precision);
};

UNH_VS_RoundingStats.StatusData_getParamValue = Window_StatusData.prototype.getParamValue;
Window_StatusData.prototype.getParamValue = function (paramText) {
  const baseValue = UNH_VS_RoundingStats.StatusData_getParamValue.call(this, paramText);
  const precision = UNH_VS_RoundingStats.getPrecision();
  return UNH_VS_RoundingStats.roundResult(baseValue, precision);
};
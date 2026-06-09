//=============================================================================
// Unhinged Development - VS Events Move + Overpass: No Dockable Bridges
// UNH_VS_YO_NoDockableBridges.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_VS_YO_NoDockableBridges = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_YO_NoDockableBridges]
 * @author Unhinged Developer
 * @base VisuMZ_1_EventsMoveCore
 * @base OverpassTile
 * @orderAfter VisuMZ_1_EventsMoveCore
 * @orderAfter OverpassTile
 *
 * @help
 */
//=============================================================================

const UNH_VS_YO_NoDockableBridges = {};
UNH_VS_YO_NoDockableBridges.pluginName = 'UNH_VS_YO_NoDockableBridges';

UNH_VS_YO_NoDockableBridges.Vehicle_isRegionDockable = Game_Vehicle.prototype.isRegionDockable;
Game_Map.prototype.isRegionDockable = function (x, y, speed, vehicle) {
  if ($gameMap.isGatewayOverPath(x, y) && $gameMap.isOverPath($gamePlayer.x, $gamePlayer.y)) return false;
  return UNH_VS_YO_NoDockableBridges.Vehicle_isRegionDockable.call(this);
};
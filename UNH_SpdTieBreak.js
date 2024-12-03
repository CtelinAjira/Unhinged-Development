//=============================================================================
// Unhinged Development - Speed-Tie Breaker
// UNH_SpdTieBreak.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderBefore VisuMZ_0_CoreEngine
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [SpdTieBreak]
 * @author Unhinged Developer
 *
 * @help
 */
//=============================================================================

const UNH_SpdTieBreak = {};
UNH_SpdTieBreak.pluginName = 'UNH_SpdTieBreak';

UNH_SpdTieBreak.BattleManager_makeActionOrders = BattleManager.makeActionOrders;
BattleManager.makeActionOrders = function() {
  UNH_SpdTieBreak.BattleManager_makeActionOrders.call(this);
  this._actionBattlers.sort(function(a, b) {
    const aSpd = a.speed();
    const bSpd = b.speed();
    if (aSpd === bSpd) return ((2 * (Math.randomInt(100) % 2)) - 1);
    return bSpd - aSpd;
  });
};
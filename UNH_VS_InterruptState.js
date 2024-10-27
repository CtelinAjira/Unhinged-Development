//=============================================================================
// Unhinged Development - VS ATB: Interrupt State
// UNH_VS_InterruptState.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_InterruptState]
 * @author Unhinged Developer
 * @base VisuMZ_2_BattleSystemATB
 * @orderAfter VisuMZ_2_BattleSystemATB
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <unhInterrupt>
 * - Use for States
 * - Sets the state to apply an ATB Interrupt when inflicted
 * <unhRestrict>
 * - Use for States
 * - Sets the state to make its interrupt remove states marked "Remove by 
 *   Restriction"
 */
//=============================================================================

const UNH_InterruptState = {};
UNH_InterruptState.pluginName = 'UNH_InterruptState';

UNH_InterruptState.atbInterrupt = Game_Battler.prototype.atbInterrupt;
Game_Battler.prototype.atbInterrupt = function (interrupt) {
  UNH_InterruptState.atbInterrupt.call(this);
  if (!!interrupt) {
    if (BattleManager.isATB()) {
      if (this._tpbCastTime === 0) {
        this.onRestrict();
      }
    }
  }
};

UNH_InterruptState.Battler_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
  UNH_InterruptState.Battler_addState.call(this, stateId);
  if (BattleManager.isATB()) {
    const state = $dataStates[stateId];
    const isInterrupt = (!!state.meta) ? (!!state.meta.unhInterrupt) : false;
    if (!!isInterrupt) {
      const isRestrict = (!!state.meta) ? (!!state.meta.unhRestrict) : false;
      this.atbInterrupt(isRestrict);
    }
  }
};

UNH_InterruptState.Battler_startTpbCasting = Game_Battler.prototype.startTpbCasting;
Game_Battler.prototype.startTpbCasting = function() {
  UNH_InterruptState.Battler_startTpbCasting.call(this);
  if (BattleManager.isATB()) {
    const interruptionStates = JsonEx.makeDeepCopy(this.states()).filter(function(state) {
      if (!!state.meta) return false;
      return !!state.meta.unhInterrupt;
    });
    for (const state of interruptionStates) {
      target.removeState(state.id);
    }
  }
};
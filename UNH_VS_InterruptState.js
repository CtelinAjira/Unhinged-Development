//=============================================================================
// Unhinged Development - VS ATB: Interrupt State
// UNH_VS_InterruptState.js
//=============================================================================

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
 * Plugin Description
 * ============================================================================
 * 
 * Have a state represent the ATB Interrupt
 * 
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

UNH_InterruptState.Battler_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
  UNH_InterruptState.Battler_addState.call(this, stateId);
  if (BattleManager.isAtb()) {
    const state = $dataStates[stateId];
    const isInterrupt = (!!state.meta) ? (!!state.meta.unhInterrupt) : false;
    if (!!isInterrupt) {
      const isRestrict = (!!state.meta) ? (!!state.meta.unhRestrict) : false;
      this.atbInterrupt();
      this.clearActions();
      this.clearTpbChargeTime();
      this._tpbCastTime = 0;
      if (!!isRestrict) this.onRestrict();
    }
  }
};

UNH_InterruptState.Battler_startTpbCasting = Game_Battler.prototype.startTpbCasting;
Game_Battler.prototype.startTpbCasting = function() {
  UNH_InterruptState.Battler_startTpbCasting.call(this);
  if (BattleManager.isAtb()) {
    const interruptionStates = JsonEx.makeDeepCopy(this.states()).filter(function(state) {
      if (!!state.meta) return false;
      return !!state.meta.unhInterrupt;
    });
    for (const state of interruptionStates) {
      target.removeState(state.id);
    }
  }
};

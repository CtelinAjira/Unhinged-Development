//=============================================================================
// Unhinged Development - Time Stop
// UNH_TimeStop.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_TimeStop = true;

//=============================================================================
 /*:
 * @target MZ
 * @orderBefore VisuMZ_0_CoreEngine
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [TimeStop]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Time Stop>
 * - Use for States
 * - Marks afflicted battler as timestopped
 *   - This stops all unmarked Turn End states to freeze.  Their state turns 
 *     will not count down until all marked states are removed.
 */
//=============================================================================

const UNH_TimeStop = {};
UNH_TimeStop.pluginName = 'UNH_TimeStop';

UNH_TimeStop.markedStates = function(state) {
  if (!state) return false;
  if (!state.meta) return false;
  return !!state.meta['Time Stop'];
};

Game_BattlerBase.prototype.stateTurnUpdate = function(stateId) {
  if (this._stateTurns[stateId] > 0) {
    this._stateTurns[stateId]--;
  }
};

Game_BattlerBase.prototype.stateStopUpdate = function(stateId) {
  const state = $dataStates[stateId];
  if (state.autoRemovalTiming !== 2) {
    this.stateTurnUpdate(stateId);
  } else if (UNH_TimeStop.markedStates(state)) {
    this.stateTurnUpdate(stateId);
  }
};

UNH_TimeStop.BattlerBase_updateTurns = Game_Battler.prototype.updateStateTurns;
Game_BattlerBase.prototype.updateStateTurns = function() {
  const states = this.states();
  if (!states.some(UNH_TimeStop.markedStates)) {
    UNH_TimeStop.BattlerBase_updateTurns.call(this);
  } else {
    let state;
    for (const stateId of this._states) {
      this.stateStopUpdate(stateId);
    }
  }
};

UNH_TimeStop.Battler_removeAuto = Game_Battler.prototype.removeStatesAuto;
Game_Battler.prototype.removeStatesAuto = function(timing) {
  if (timing === 2) {
    const states = this.states();
    if (states.some(UNH_TimeStop.markedStates)) {
      const markedStates = states.filter(UNH_TimeStop.markedStates);
      for (const state of markedStates) {
        if (this.isStateExpired(state.id) && state.autoRemovalTiming === timing) {
          this.removeState(state.id);
        }
      }
    } else {
      UNH_TimeStop.Battler_removeAuto.call(this, timing);
    }
  } else {
    UNH_TimeStop.Battler_removeAuto.call(this, timing);
  }
};
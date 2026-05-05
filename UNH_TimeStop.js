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

UNH_TimeStop.StateFunctions = {};

UNH_TimeStop.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_TimeStop.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_TimeStop._isLoaded) {
    DataManager.unhProcessTimeStopTags($dataStates);
    UNH_TimeStop._isLoaded = true;
  }
  return true;
};

DataManager.unhProcessTimeStopTags = function(group) {
  const note1 = /<(?:TIME STOP)>/i;
  const note2 = /<(?:TIME STOP):[ ](.*)>/i;
  let notedata, obj, line, noteStr, noteArr, noteLen, notePre, noteRet, code;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
	notedata = obj.note.split(/[\r\n]+/);
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      code = '';
      if (line.match(note1)) {
        UNH_TimeStop.StateFunctions['isState' + obj.id + 'Marked'] = function(user) {
          return true;
        };
	  } else if (line.match(note2)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code = notePre + ';\n';
        }
        code += 'return !!(' + noteRet + ');\n';
        UNH_TimeStop.StateFunctions['isState' + obj.id + 'Marked'] = new Function('user', code);
	  } else {
        UNH_TimeStop.StateFunctions['isState' + obj.id + 'Marked'] = function(user) {
          return false;
        };
	  }
    }
  }
};

UNH_TimeStop.markedStates = function(state) {
  if (!state) return false;
  return UNH_TimeStop.StateFunctions['isState' + state.id + 'Marked'](this);
  if (!state.meta) return false;
  if (!state.meta['Time Stop']) return false;
  return !!eval(state.meta['Time Stop']);
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
  const isStopped = states.some(UNH_TimeStop.markedStates);
  if (isStopped) {
    let state;
    for (const stateId of this._states) {
      this.stateStopUpdate(stateId);
    }
  } else {
    UNH_TimeStop.BattlerBase_updateTurns.call(this);
  }
};

UNH_TimeStop.Battler_removeAuto = Game_Battler.prototype.removeStatesAuto;
Game_Battler.prototype.removeStatesAuto = function(timing) {
  if (timing === 2) {
    const states = JsonEx.makeDeepCopy(this.states());
    if (states.some(UNH_TimeStop.markedStates, this)) {
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
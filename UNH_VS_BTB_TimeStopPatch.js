//=============================================================================
// Unhinged Development - VS Brave Turn Battle: Time Stop Patch
// UNH_VS_BTB_TimeStopPatch.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_VS_BTB_TimeStopPatch = true;

//=============================================================================
 /*:
 * @target MZ
 * @base UNH_TimeStop
 * @base VisuMZ_2_BattleSystemBTB
 * @orderAfter UNH_TimeStop
 * @orderAfter VisuMZ_2_BattleSystemBTB
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_BTB_TimeStopPatch]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <BP Regen Freeze>
 * - Use for States
 * - Marks afflicted battler as not regenerating BP
 */
//=============================================================================

const UNH_VS_BTB_TimeStopPatch = {};
UNH_VS_BTB_TimeStopPatch.pluginName = 'UNH_VS_BTB_TimeStopPatch';

UNH_VS_BTB_TimeStopPatch.StateFunctions = {};

UNH_VS_BTB_TimeStopPatch.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_VS_BTB_TimeStopPatch.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_VS_BTB_TimeStopPatch._isLoaded) {
    DataManager.unhProcessBpFreezeTags($dataStates);
    UNH_VS_BTB_TimeStopPatch._isLoaded = true;
  }
  return true;
};

DataManager.unhProcessBpFreezeTags = function(group) {
  const note1 = /<(?:BP REGEN FREEZE)>/i;
  const note2 = /<(?:BP REGEN FREEZE):[ ](.*)>/i;
  let notedata, obj, line, noteStr, noteArr, noteLen, notePre, noteRet, code;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
	notedata = obj.note.split(/[\r\n]+/);
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      code = '';
      if (line.match(note1)) {
        UNH_VS_BTB_TimeStopPatch.StateFunctions['isState' + obj.id + 'Marked'] = function(user) {
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
        UNH_VS_BTB_TimeStopPatch.StateFunctions['isState' + obj.id + 'Marked'] = new Function('user', code);
	  } else {
        UNH_VS_BTB_TimeStopPatch.StateFunctions['isState' + obj.id + 'Marked'] = function(user) {
          return false;
        };
	  }
    }
  }
};

UNH_VS_BTB_TimeStopPatch.markedStates = function(state) {
  if (!state) return false;
  return UNH_VS_BTB_TimeStopPatch.StateFunctions['isState' + obj.id + 'Marked'](this);
  if (!state.meta) return false;
  if (!state.meta['BP Regen Freeze']) return false;
  return !!eval(state.meta['BP Regen Freeze']);
};

UNH_VS_BTB_TimeStopPatch.Battler_regenerateBravePoints = Game_Battler.prototype.regenerateBravePoints;
Game_Battler.prototype.regenerateBravePoints = function () {
  const states = this.states();
  const isFrozen = states.some(UNH_VS_BTB_TimeStopPatch.markedStates, this);
  if (!isFrozen) UNH_VS_BTB_TimeStopPatch.Battler_regenerateBravePoints.call(this);
};
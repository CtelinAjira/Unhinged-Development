//=============================================================================
// Unhinged Development - Parameter as Other Class
// UNH_ParamAsOther.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_ParamAsOther = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [ParamAsOther]
 * @author Unhinged Developer
 * @orderAfter UNH_MiscFunc
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Param x as Class: y>
 * - Use for Actors/Weapons/Armors/Enemies/States
 * - Use Class Y (Database ID) to calculate Param X (JS Eval to Number)
 *   - Only MHP (0), MMP (1), ATK (2), DEF (3), MAT (4), MDF (5), AGI (6), and 
 *     LUK (7) are valid to use
 * 
 * <Param All as Class: X>
 * - Use for Actors/Weapons/Armors/Enemies/States
 * - Use Class X (Database ID) to calculate ALL stats
 * 
 * <Class Level: y>
 * - Use for Enemies
 * - Use Level X (JS Eval to Number) to calculate level in class
 */
//=============================================================================

const UNH_ParamAsOther = {};
UNH_ParamAsOther.pluginName = 'UNH_ParamAsOther';

UNH_ParamAsOther.hasPlugin = function(name) {
  return $plugins.some(function(plug) {
    if (!plug) return false;
    if (!plug.name) return false;
    if (!plug.status) return false;
    return plug.name === name;
  });
};

UNH_ParamAsOther.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_ParamAsOther.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_ParamAsOther._loaded) {
  	this.processParamAsOtherNotetags1($dataActors);
  	this.processParamAsOtherNotetags1($dataEnemies);
  	this.processParamAsOtherNotetags1($dataClasses);
  	this.processParamAsOtherNotetags1($dataWeapons);
  	this.processParamAsOtherNotetags1($dataArmors);
  	this.processParamAsOtherNotetags1($dataStates);
  	this.processParamAsOtherNotetags2($dataEnemies);
    UNH_ParamAsOther._loaded = true;
  }
  return true;
};

DataManager.processParamAsOtherNotetags1 = function(group) {
  const note1 = /<(?:PARAM)[ ](\d+)[ ](?:AS CLASS):[ ](\d+)>/i;
  const note2 = /<(?:PARAM)[ ](*.)[ ](?:AS CLASS):[ ](\d+)>/i;
  const note3 = /<(?:PARAM ALL AS CLASS):[ ](\d+)>/i;
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);
    obj.paramSet = [];
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(note3)) {
        for (let i = 0; i < 8; i++) {
          obj.paramSet.push({paramId:i,classId:parseInt(RegExp.$2)});
        }
      } else if (line.match(note1)) {
        obj.paramSet.push({paramId:parseInt(RegExp.$1),classId:parseInt(RegExp.$2)});
      } else if (line.match(note2)) {
        obj.paramSet.push({paramId:String(RegExp.$1),classId:parseInt(RegExp.$2)});
      }
    }
  }
};

DataManager.processParamAsOtherNotetags2 = function(group) {
  const note1 = /<(?:CLASS LEVEL):[ ](\d+)>/i;
  const note2 = /<(?:CLASS LEVEL):[ ](*.)>/i;
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);
    obj.classLevel = 1;
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(note1)) {
        obj.classLevel = parseInt(RegExp.$1);
      } else if (line.match(note2)) {
        obj.classLevel = String(RegExp.$1);
      }
    }
  }
};

if (!UNH_ParamAsOther.hasPlugin('VisuMZ_3_EnemyLevels') && !UNH_ParamAsOther.hasPlugin('UNH_MiscFunc')) {
  Object.defineProperty(Game_Enemy.prototype, "level", {
    get: function () {
      return this.getLevel();
    },
    configurable: true
  });

  Game_Enemy.prototype.getLevel = function() {
    if (this._level === undefined) this._level = this.createLevel(99);
    return this._level;
  };

  Game_Enemy.prototype.createLevel = function(max) {
    const user = this.enemy();
    if (!user) return 1;
    const level = user.classLevel;
    if (isNaN(level)) {
      return 1;
    } else if (typeof level === 'number') {
	  return Math.min(Math.max(Number(level), 1), max);
    } else {
      try {
        const dummy = eval(level);
        return Math.min(Math.max(Number(dummy), 1), max);
      } catch (e) {
        return 1;
      }
    }
  };
}

UNH_ParamAsOther.Actor_paramBase = Game_Actor.prototype.paramBase;
Game_Actor.prototype.paramBase = function(paramId) {
  return this.paramBaseAsClass(paramId, UNH_ParamAsOther.Actor_paramBase.call(this, paramId));
};

UNH_ParamAsOther.Enemy_paramBase = Game_Enemy.prototype.paramBase;
Game_Enemy.prototype.paramBase = function(paramId) {
  return this.paramBaseAsClass(paramId, UNH_ParamAsOther.Enemy_paramBase.call(this, paramId));
};

Game_Actor.prototype.paramBaseAsClass = function(paramId, origVal) {
  const user = this;
  const objects = this.traitObjects();
  for (const obj of objects) {
    const paramSet = obj.paramSet.filter(function(param) {
      if (!param) return false;
      if (typeof param.paramId === 'number') return (param.paramId === paramId);
      return (eval(param.paramId) === paramId);
    });
    if (paramSet.length > 0) {
      const classId = paramSet[0].classId;
      if ($dataClasses[classId]) return $dataClasses[classId].params[paramId][this._level];
    }
  }
  return origVal;
};

Game_Enemy.prototype.paramBaseAsClass = function(paramId, origVal) {
  const user = this;
  const objects = this.traitObjects();
  for (const obj of objects) {
    const paramSet = obj.paramSet.filter(function(param) {
      if (!param) return false;
      if (typeof param.paramId === 'number') return (param.paramId === paramId);
      return (eval(param.paramId) === paramId);
    });
    if (paramSet.length > 0) {
      const classId = paramSet[0].classId;
      if ($dataClasses[classId]) return $dataClasses[classId].params[paramId][this._level];
    }
  }
  return origVal;
};
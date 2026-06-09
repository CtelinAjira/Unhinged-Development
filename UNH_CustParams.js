//=============================================================================
// Unhinged Development - Custom Parameters
// UNH_CustParams.js
//=============================================================================

var Ramza = Ramza || {};
var Imported = Imported || {};
Imported.UNH_CustParams = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [CustParams]
 * @author Unhinged Developer
 * @base UNH_MiscFunc
 * @orderAfter UNH_MiscFunc
 *
 * @param LevelScale
 * @text Level Scaling Divisor
 * @desc The number of levels needed to double HP & damage
 * @type number
 * @default 10
 *
 * @param WeaponSkills
 * @text Weapon Skills
 * @desc The skills checked for weapons
 * @type string
 * @default 0
 *
 * @help
 */
//=============================================================================

const UNH_CustParams = {};
UNH_CustParams.pluginName = 'UNH_CustParams';
UNH_CustParams.parameters = PluginManager.parameters(UNH_CustParams.pluginName);
UNH_CustParams.LevelScale = Number(UNH_CustParams.parameters['LevelScale'] || 10);
UNH_CustParams.WeaponSkills = new Function('user', 'wtypeId', 'return (' + String(UNH_CustParams.parameters['WeaponSkills'] || '0') + ');');

if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_SkillsStatesCore')) {
  DataManager.getSkillTypes = function(skill) {
    if (!skill.stypeId) return [];
    return [skill.stypeId];
  };
}

UNH_CustParams.ConvertToBoolFunction = function(string) {
  let code = '';
  const noteStr = string;
  const noteArr = noteStr.split(';');
  const noteLen = noteArr.length;
  const notePre = noteArr.slice(0, -1).join(';\n');
  const noteRet = noteArr[noteLen - 1];
  if (notePre.length > 0) {
    code += notePre + ';\n';
  }
  code += 'return (' + noteRet + ');\n';
  return code;
};

UNH_CustParams.BasicFunctions = {
  Actor:{},
  Class:{},
  Skill:{},
  Item:{},
  Weapon:{},
  Armor:{},
  State:{},
  Enemy:{}
};

UNH_CustParams.ArmorFunctions = {
  Actor:{},
  Class:{},
  Skill:{},
  Item:{},
  Weapon:{},
  Armor:{},
  State:{},
  Enemy:{}
};

UNH_CustParams.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_CustParams.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_CustParams._isLoaded) {
    DataManager.unhProcessSpeedNotetags($dataSkills);
    DataManager.unhProcessSpeedNotetags($dataItems);
    DataManager.unhProcessFloorNotetags($dataActors);
    DataManager.unhProcessFloorNotetags($dataClasses);
    DataManager.unhProcessFloorNotetags($dataWeapons);
    DataManager.unhProcessFloorNotetags($dataArmors);
    DataManager.unhProcessFloorNotetags($dataStates);
    DataManager.unhProcessFloorNotetags($dataEnemies);
    DataManager.unhProcessKeyStatNotetags($dataActors);
    DataManager.unhProcessKeyStatNotetags($dataClasses);
    DataManager.unhProcessKeyStatNotetags($dataWeapons);
    DataManager.unhProcessKeyStatNotetags($dataStates);
    DataManager.unhProcessKeyStatNotetags($dataEnemies);
    DataManager.unhProcessDoublehandNotetags($dataStates);
    UNH_CustParams._isLoaded = true;
  }
  return true;
};

DataManager.unhProcessSpeedNotetags = function(group) {
  let groupKey = '';
  switch (group) {
    case $dataSkills:
      groupKey = 'Skill';
      break;
    case $dataItems:
      groupKey = 'Item';
      break;
  }
  let notedata, obj, line, noteStr, noteArr, noteLen, notePre, noteRet, code;
  const note1 = /<(?:SPEED):(?:\s*)(\d+)>/i;
  const note2 = /<(?:SPEED):(?:\s*)(.*)>/i;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    UNH_CustParams.BasicFunctions[groupKey][obj.id] = UNH_CustParams.BasicFunctions[groupKey][obj.id] || {};
    notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    code = 'if (!action) return 0;\nconst item = action.item();\nconst user = action.subject();\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        code += 'speed += ' + String(RegExp.$1) + ';\n';
      } else if (line.match(note2)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'speed += (' + noteRet + ');\n';
      }
    }
    code += 'return speed;';
    UNH_CustParams.BasicFunctions[groupKey][obj.id].unhBaseSpeed = new Function('action', 'speed', code);
  }
};

DataManager.unhProcessFloorNotetags = function(group) {
  let groupKey = '';
  switch (group) {
    case $dataActors:
      groupKey = 'Actor';
      break;
    case $dataClasses:
      groupKey = 'Class';
      break;
    case $dataWeapons:
      groupKey = 'Weapon';
      break;
    case $dataArmors:
      groupKey = 'Armor';
      break;
    case $dataStates:
      groupKey = 'State';
      break;
    case $dataEnemies:
      groupKey = 'Enemy';
      break;
  }
  const note1 = /<(?:FLOOR DAMAGE PLUS):[ ](.*)>/i;
  const note2 = /<(?:FLOOR DAMAGE RATE):[ ](.*)>/i;
  let notedata, obj, line, noteStr, noteArr, noteLen, notePre, noteRet, code;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    UNH_CustParams.BasicFunctions[groupKey][obj.id] = UNH_CustParams.BasicFunctions[groupKey][obj.id] || {};
    notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    code = 'const battler = user.actor();\nconst curClass = user.currentClass() || null;\nconst equips = user.equips() || [];\nconst states = user.states();\nif (!buffer) buffer = 1;\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note2)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'buffer *= (' + noteRet + ');\n';
      }
    }
    code += 'return buffer;';
    UNH_CustParams.BasicFunctions[groupKey][obj.id].unhFloorDamagePlus = new Function('user', 'buffer', code);
    code = 'const battler = user.actor();\nconst curClass = user.currentClass() || null;\nconst equips = user.equips() || [];\nconst states = user.states();\nif (!buffer) buffer = 0;\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'buffer += (' + noteRet + ');\n';
      }
    }
    code += 'return buffer;';
    UNH_CustParams.BasicFunctions[groupKey][obj.id].unhFloorDamageRate = new Function('user', 'buffer', code);
  }
};

DataManager.unhProcessKeyStatNotetags = function(group) {
  let groupKey = '';
  switch (group) {
    case $dataActors:
      groupKey = 'Actor';
      break;
    case $dataClasses:
      groupKey = 'Class';
      break;
    case $dataWeapons:
      groupKey = 'Weapon';
      break;
    case $dataArmors:
      groupKey = 'Armor';
      break;
    case $dataStates:
      groupKey = 'State';
      break;
    case $dataEnemies:
      groupKey = 'Enemy';
      break;
  }
  const note1 = /<(?:KEY STAT):[ ](.*)>/i;
  const note2 = /<(?:KEY STAT PLUS):[ ](.*)>/i;
  const note3 = /<(?:KEY STAT RATE):[ ](.*)>/i;
  const note4 = /<(?:KEY STAT FLAT):[ ](.*)>/i;
  let notedata, obj, line, noteStr, noteArr, noteLen, notePre, noteRet, code;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    UNH_CustParams.BasicFunctions[groupKey][obj.id] = UNH_CustParams.BasicFunctions[groupKey][obj.id] || {};
    notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    code = 'const battler = user.actor();\nconst curClass = user.currentClass() || null;\nconst equips = user.equips() || [];\nconst weapons = user.weapons() || [];\nconst armors = user.armors() || [];\nconst states = user.states();\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'return (' + noteRet + ');\n';
      }
    }
    code += 'return 0;\n';
    UNH_CustParams.BasicFunctions[groupKey][obj.id].unhKeyStatBase = new Function('user', code);
    code = 'const battler = user.actor();\nconst curClass = user.currentClass() || null;\nconst equips = user.equips() || [];\nconst weapons = user.weapons() || [];\nconst armors = user.armors() || [];\nconst states = user.states();\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note2)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'power += (' + noteRet + ');\n';
      }
    }
    code += 'return power;';
    UNH_CustParams.BasicFunctions[groupKey][obj.id].unhKeyStatPlus = new Function('user', 'power', code);
    code = 'const battler = user.actor();\nconst curClass = user.currentClass() || null;\nconst equips = user.equips() || [];\nconst weapons = user.weapons() || [];\nconst armors = user.armors() || [];\nconst states = user.states();\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note3)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'power *= (' + noteRet + ');\n';
      }
    }
    code += 'return power;';
    UNH_CustParams.BasicFunctions[groupKey][obj.id].unhKeyStatRate = new Function('user', 'power', code);
    code = 'const battler = user.actor();\nconst curClass = user.currentClass() || null;\nconst equips = user.equips() || [];\nconst weapons = user.weapons() || [];\nconst armors = user.armors() || [];\nconst states = user.states();\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note4)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'power += (' + noteRet + ');\n';
      }
    }
    code += 'return power;';
    UNH_CustParams.BasicFunctions[groupKey][obj.id].unhKeyStatFlat = new Function('user', 'power', code);
  }
};

DataManager.unhProcessDoublehandNotetags = function(group) {
  const note1 = /<(?:UNH DOUBLEHAND)>/i;
  const note2 = /<(?:UNH DOUBLEHAND):[ ](.*)>/i;
  let notedata, obj, line, noteStr, noteArr, noteLen, notePre, noteRet, code;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    UNH_CustParams.BasicFunctions.State[obj.id] = UNH_CustParams.BasicFunctions.State[obj.id] || {};
    UNH_CustParams.BasicFunctions.State[obj.id].unhIsDoublehand = function() {
      return false;
    };
    notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = 'State';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        UNH_CustParams.BasicFunctions.State[obj.id].unhIsDoublehand = function() {
          return true;
        };
      } else if (line.match(note2)) {
        code = 'const battler = user.actor();\nconst curClass = user.currentClass() || null;\nconst equips = user.equips() || [];\nconst weapons = user.weapons() || [];\nconst armors = user.armors() || [];\nconst states = user.states();\n';
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'return (' + noteRet + ');\n';
        UNH_CustParams.BasicFunctions.State[obj.id].unhIsDoublehand = new Function('user', code);
      }
    }
  }
};

UNH_CustParams.levelScaling = function(level) {
  const scaling = UNH_CustParams.LevelScale - 1;
  return ((scaling + level) / (scaling + 1));
};

Object.defineProperties(Game_Actor.prototype, {
  lvScale: {
    get: function() {
      return UNH_CustParams.levelScaling(this.level);
    }, configurable: true
  }, armCheck: {
    get: function() {
      return (this.lgtArmCheck() || this.medArmCheck() || this.hvyArmCheck());
    }, configurable: true
  }, floorDmg: {
    get: function() {
      const user = this;
      const battler = this.actor();
      const curClass = this.currentClass();
      const equips = this.equips();
      const states = this.states();
      let buffer = 1;
      const funcLib = UNH_CustParams.BasicFunctions;
      for (const state of states) {
        if (!state) continue;
        buffer = funcLib.State[state.id].unhFloorDamageRate(user, buffer);
      }
      for (const equip of equips) {
        if (!equip) continue;
        if (equip.isWeapon()) {
          buffer = funcLib.Weapon[equip.id].unhFloorDamageRate(user, buffer);
        } else if (equip.isArmor()) {
          buffer = funcLib.Armor[equip.id].unhFloorDamageRate(user, buffer);
        }
      }
      buffer = funcLib.Class[curClass.id].unhFloorDamageRate(user, buffer);
      buffer = funcLib.Actor[battler.id].unhFloorDamageRate(user, buffer);
      for (const state of states) {
        if (!state) continue;
        buffer = funcLib.State[state.id].unhFloorDamagePlus(user, buffer);
      }
      for (const equip of equips) {
        if (!equip) continue;
        if (equip.isWeapon()) {
          buffer = funcLib.Weapon[equip.id].unhFloorDamagePlus(user, buffer);
        } else if (equip.isArmor()) {
          buffer = funcLib.Armor[equip.id].unhFloorDamagePlus(user, buffer);
        }
      }
      buffer = funcLib.Class[curClass.id].unhFloorDamagePlus(user, buffer);
      buffer = funcLib.Actor[battler.id].unhFloorDamagePlus(user, buffer);
      return buffer;
    }, configurable: true
  }, kPar: {
    get: function() {
      const user = this;
      const battler = this.actor();
      const curClass = this.currentClass();
      const equips = this.equips();
      const weapons = this.weapons();
      const armors = this.armors();
      const states = this.states();
      let power = 0;
      const funcLib = UNH_CustParams.BasicFunctions;
      for (const state of states) {
        if (!state) continue;
        power = funcLib.State[state.id].unhKeyStatBase(user);
      }
      if (power <= 0) {
        if (UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) {
          const weapon = this.equips()[this._activeWeaponSlot || 0];
          if (DataManager.isWeapon(weapon)) {
            power = funcLib.Weapon[weapon.id].unhKeyStatBase(user);
          }
        } else if (weapons.length > 0) {
          const weaponSum = weapons.reduce(function(r, weapon) {
            if (!weapon) return r;
            return r + funcLib.Weapon[weapon.id].unhKeyStatBase(user);
          }, 0);
          power = (weaponSum / weapons.length);
        }
        if (power <= 0) {
          power = armors.reduce(function(r, armor) {
            if (!armor) return r;
            return Math.max(r, funcLib.Armor[armor.id].unhKeyStatBase(user));
          }, 0);
          if (power <= 0) {
            power = funcLib.Class[curClass.id].unhKeyStatBase(user);
            if (power <= 0) {
              power = funcLib.Actor[battler.id].unhKeyStatBase(user);
            }
          }
        }
      }
      power = user.traitObjects().reduce(function(r, object) {
        return UNH_CustParams.BasicFunctions[object.groupKey][obj.id].unhKeyStatPlus(user, r);
      }, power);
      power = user.traitObjects().reduce(function(r, object) {
        return UNH_CustParams.BasicFunctions[object.groupKey][obj.id].unhKeyStatRate(user, r);
      }, power);
      power = user.traitObjects().reduce(function(r, object) {
        return UNH_CustParams.BasicFunctions[object.groupKey][obj.id].unhKeyStatFlat(user, r);
      }, power);
      return power;
    }, configurable: true
  }, pArm: {
    get: function() {
      const note = 'Physical Armor';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, mArm: {
    get: function() {
      const note = 'Magical Armor';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, pBrk: {
    get: function() {
      const note = 'Physical Drop';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, mBrk: {
    get: function() {
      const note = 'Magical Drop';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, pRes: {
    get: function() {
      const note = 'Physical Resist';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, mRes: {
    get: function() {
      const note = 'Magical Resist';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, pBuf: {
    get: function() {
      const note = 'Physical Buffer';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, mBuf: {
    get: function() {
      const note = 'Magical Buffer';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, pEnh: {
    get: function() {
      const note = 'Physical Enhance';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, mEnh: {
    get: function() {
      const note = 'Magical Enhance';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, spdBoost: {
    get: function() {
      const note = 'Speed Boost';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, physDmgPlus: {
    get: function() {
      const note = 'Physical Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, tekDmgPlus: {
    get: function() {
      const note = 'Techno Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, acnDmgPlus: {
    get: function() {
      const note = 'Arcane Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, psiDmgPlus: {
    get: function() {
      const note = 'Psionic Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, auraDmgPlus: {
    get: function() {
      const note = 'Aura Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, domDmgPlus: {
    get: function() {
      const note = 'Domain Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }
});
Object.defineProperties(Game_Enemy.prototype, {
  lvScale: {
    get: function() {
      const scaling = UNH_CustParams.LevelScale - 1;
      return ((scaling + this.level) / (scaling + 1));
    }, configurable: true
  }, armCheck: {
    get: function() {
      return (this.lgtArmCheck() || this.medArmCheck() || this.hvyArmCheck());
    }, configurable: true
  }, floorDmg: {
    get: function() {
      const user = this;
      const battler = this.enemy();
      const curClass = ((this.currentClass()) ? (this.currentClass()) : (null));
      const equips = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.equips()) : ([]));
      const states = this.states();
      let buffer = 1;
      const funcLib = UNH_CustParams.BasicFunctions;
      for (const state of states) {
        if (!state) continue;
        buffer = funcLib.State[state.id].unhFloorDamageRate(user, buffer);
      }
      if (equips.length > 0) {
        for (const equip of equips) {
          if (!equip) continue;
          if (equip.isWeapon()) {
            buffer = funcLib.Weapon[equip.id].unhFloorDamageRate(user, buffer);
          } else if (equip.isArmor()) {
            buffer = funcLib.Armor[equip.id].unhFloorDamageRate(user, buffer);
          }
        }
      }
      if (!!curClass) buffer = funcLib.Class[curClass.id].unhFloorDamageRate(user, buffer);
      buffer = funcLib.Enemy[battler.id].unhFloorDamageRate(user, buffer);
      for (const state of states) {
        if (!state) continue;
        buffer = funcLib.State[state.id].unhFloorDamagePlus(user, buffer);
      }
      if (equips.length > 0) {
        for (const equip of equips) {
          if (!equip) continue;
          if (equip.isWeapon()) {
            buffer = funcLib.Weapon[equip.id].unhFloorDamagePlus(user, buffer);
          } else if (equip.isArmor()) {
            buffer = funcLib.Armor[equip.id].unhFloorDamagePlus(user, buffer);
          }
        }
      }
      if (!!curClass) buffer = funcLib.Class[curClass.id].unhFloorDamagePlus(user, buffer);
      buffer = funcLib.Enemy[battler.id].unhFloorDamagePlus(user, buffer);
      return buffer;
    }, configurable: true
  }, kPar: {
    get: function() {
      const user = this;
      const battler = this.enemy();
      const curClass = ((this.currentClass()) ? (this.currentClass()) : (null));
      const equips = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.equips()) : ([]));
      const weapons = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.weapons()) : ([]));
      const armors = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.armors()) : ([]));
      const states = this.states();
      let power = 0;
      for (const state of states) {
        if (!state) continue;
        power = funcLib.State[state.id].unhKeyStatBase(user);
      }
      if (power <= 0) {
        if (weapons.length > 0) {
          if (UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) {
            const weapon = this.equips()[this._activeWeaponSlot || 0];
            if (DataManager.isWeapon(weapon)) {
              power = funcLib.Weapon[weapon.id].unhKeyStatBase(user);
            }
          } else if (weapons.length > 0) {
            const weaponSum = weapons.reduce(function(r, weapon) {
              if (!weapon) return r;
              return r + funcLib.Weapon[weapon.id].unhKeyStatBase(user);
            }, 0);
            power = (weaponSum / weapons.length);
          }
        }
        if (power <= 0) {
          power = armors.reduce(function(r, armor) {
            if (!armor) return r;
            return Math.max(r, funcLib.Armor[armor.id].unhKeyStatBase(user));
          }, 0);
          if (power <= 0) {
            if (!!curClass) power = funcLib.Class[curClass.id].unhKeyStatBase(user);
            if (power <= 0) {
              power = funcLib.Enemy[battler.id].unhKeyStatBase(user);
            }
          }
        }
      }
      power = user.traitObjects().reduce(function(r, object) {
        return UNH_CustParams.BasicFunctions[object.groupKey][obj.id].unhKeyStatPlus(user, r);
      }, power);
      power = user.traitObjects().reduce(function(r, object) {
        return UNH_CustParams.BasicFunctions[object.groupKey][obj.id].unhKeyStatRate(user, r);
      }, power);
      power = user.traitObjects().reduce(function(r, object) {
        return UNH_CustParams.BasicFunctions[object.groupKey][obj.id].unhKeyStatFlat(user, r);
      }, power);
      return power;
    }, configurable: true
  }, pArm: {
    get: function() {
      const note = 'Physical Armor';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, mArm: {
    get: function() {
      const note = 'Magical Armor';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, pBrk: {
    get: function() {
      const note = 'Physical Drop';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, mBrk: {
    get: function() {
      const note = 'Magical Drop';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, pRes: {
    get: function() {
      const note = 'Physical Resist';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, mRes: {
    get: function() {
      const note = 'Magical Resist';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, pBuf: {
    get: function() {
      const note = 'Physical Buffer';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, mBuf: {
    get: function() {
      const note = 'Magical Buffer';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, pEnh: {
    get: function() {
      const note = 'Physical Enhance';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, mEnh: {
    get: function() {
      const note = 'Magical Enhance';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, spdBoost: {
    get: function() {
      const note = 'Speed Boost';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, physDmgPlus: {
    get: function() {
      const note = 'Physical Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, tekDmgPlus: {
    get: function() {
      const note = 'Techno Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, acnDmgPlus: {
    get: function() {
      const note = 'Arcane Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, psiDmgPlus: {
    get: function() {
      const note = 'Psionic Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, auraDmgPlus: {
    get: function() {
      const note = 'Aura Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }, domDmgPlus: {
    get: function() {
      const note = 'Domain Damage';
      return UNH_MiscFunc.stateTagCt(this, note);
    }, configurable: true
  }
});

UNH_CustParams.weaponSkill = function(user, wtypeId) {
  if (!UNH_MiscFunc.hasPlugin('UNH_SkillLevels')) return 0;
  const wtypes = $dataSystem.weaponTypes;
  let note = "Unarmed Master";
  if (wtypeId > 0 && wtypeId < wtypes.length) note = wtypes[wtypeId] + " Master";
  const skillId = UNH_CustParams.WeaponSkills(user, wtypeId);
  const isMaster = UNH_MiscFunc.isStateTagged(user, note);
  if (!!isMaster) {
    user.unhSkillLevel(skillId);
  } else {
    return 0;
  }
};

Game_Action.prototype.tLv = function(target) {
  const note = 'UnhLevelPlus';
  return UNH_MiscFunc.skillTagCt(this, target, note) + UNH_MiscFunc.userTagCt(this, target, note) - UNH_MiscFunc.targetTagCt(this, target, note);
};

Game_Action.prototype.tLvScl = function(target) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  return UNH_CustParams.levelScaling(user.level + this.tLv(target));
};

Game_BattlerBase.prototype.bossScale = function() {
  const note = 'UnhLevelPlus';
  const level = user.level + UNH_MiscFunc.stateTagCt(this, note);
  return UNH_CustParams.levelScaling(level);
};

UNH_CustParams.Action_isPhysical = Game_Action.prototype.isPhysical;
Game_Action.prototype.isPhysical = function(origFunc) {
  if (this.isCertainHit()) return false;
  const original = UNH_CustParams.Action_isPhysical.call(this);
  if (!!origFunc) return original;
  if (UNH_MiscFunc.isSkillTagged(this, target, 'Unh Invert Damage')) return !original;
  if (UNH_MiscFunc.isUserTagged(this, target, 'Unh Invert Damage')) return !original;
  return original;
};

UNH_CustParams.Action_isMagical = Game_Action.prototype.isMagical;
Game_Action.prototype.isMagical = function(origFunc) {
  if (this.isCertainHit()) return false;
  const original = UNH_CustParams.Action_isMagical.call(this);
  if (!!origFunc) return original;
  if (UNH_MiscFunc.isSkillTagged(this, target, 'Unh Invert Damage')) return !original;
  if (UNH_MiscFunc.isUserTagged(this, target, 'Unh Invert Damage')) return !original;
  return original;
};

Game_Action.prototype.itemCnt = function(target) {
  if (this.isPhysical(true) && target.canMove()) {
    return target.cnt;
  } else {
    return 0;
  }
};

Game_Action.prototype.itemMrf = function(target) {
  if (this.isMagical(true)) {
    return target.mrf;
  } else {
    return 0;
  }
};

Game_Action.prototype.itemHit = function(target) {
  const successRate = this.item().successRate;
  if (this.isPhysical(true)) {
    return successRate * 0.01 * this.subject().hit;
  } else {
    return successRate * 0.01;
  }
};

Game_Action.prototype.itemEva = function(target) {
    if (this.isPhysical(true)) {
        return target.eva;
    } else if (this.isMagical(true)) {
        return target.mev;
    } else {
        return 0;
    }
};

Game_Action.prototype.wPow = function(target, handDex) {
  const note = 'Weapon Power';
  const power = Math.max(UNH_MiscFunc.skillTagMax(this, target, note), UNH_MiscFunc.userTagMax(this, target, note));
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (!!Ramza._loaded_DW) {
    if (!!item) {
      if (item._isMHAction) {
        handDex = 0;
      } else if (item._isOHAction) {
        handDex = 1;
      }
    }
  }
  if (handDex < 0) handDex = 0;
  if (handDex >= equips.length) handDex = equips.length - 1;
  const isDoublehand = user.unhIsDoublehand();
  if (handDex > 0) {
    return power / 2;
  } else {
    return power;
  }
};

Game_BattlerBase.prototype.lgtArmCheck = function() {
  const user = this;
  const note = 'Light Armor';
  return UNH_MiscFunc.isStateTagged(user, note);
};

Game_BattlerBase.prototype.medArmCheck = function() {
  const user = this;
  const note = 'Medium Armor';
  return UNH_MiscFunc.isStateTagged(user, note);
};

Game_BattlerBase.prototype.hvyArmCheck = function() {
  const user = this;
  const note = 'Heavy Armor';
  return UNH_MiscFunc.isStateTagged(user, note);
};

Game_BattlerBase.prototype.nullifyTpGain = function() {
  const user = this;
  const note = 'Unh TP Nullify';
  return UNH_MiscFunc.isStateTagged(user, note);
};

Game_BattlerBase.prototype.tpHpDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage by HP';
  return UNH_MiscFunc.stateTagRate(user, note);
};

Game_BattlerBase.prototype.tpMpDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage by MP';
  return UNH_MiscFunc.stateTagRate(user, note);
};

Game_BattlerBase.prototype.tpTakeDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage In';
  return UNH_MiscFunc.stateTagRate(user, note);
};

Game_BattlerBase.prototype.tpDealDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage Out';
  return UNH_MiscFunc.stateTagRate(user, note);
};

Game_BattlerBase.prototype.tpGainRegen = function() {
  const user = this;
  const note = 'Unh TP Regen';
  return Math.round(UNH_MiscFunc.stateTagCt(user, note));
};

Game_BattlerBase.prototype.tpGainDeadMembers = function() {
  const user = this;
  const note = 'Unh TP Per Dead Ally';
  const tpGain = UNH_MiscFunc.stateTagCt(user, note);
  if (this.isActor()) {
    return Math.round(tpGain * $gameParty.deadMembers().length);
  } else {
    return Math.round(tpGain * $gameTroop.deadMembers().length);
  }
};

Game_BattlerBase.prototype.tpGainEvade = function() {
  const user = this;
  const note = 'Unh TP Evasion';
  return Math.round(UNH_MiscFunc.stateTagCt(user, note));
};

Game_BattlerBase.prototype.tpGainSolo = function() {
  const user = this;
  const note = 'Unh TP Last Standing';
  return Math.round(UNH_MiscFunc.stateTagCt(user, note));
};

Game_Actor.prototype.tpGainSolo = function() {
  if ($gameParty.deadMembers().length <= 0) return 0;
  return Game_BattlerBase.prototype.tpGainSolo.call(this);
};

Game_Enemy.prototype.tpGainSolo = function() {
  if ($gameTroop.deadMembers().length <= 0) return 0;
  return Game_BattlerBase.prototype.tpGainSolo.call(this);
};

Game_BattlerBase.prototype.tpGainAllyDeath = function() {
  const user = this;
  const note = 'Unh TP Ally Death';
  return Math.round(UNH_MiscFunc.stateTagCt(user, note));
};

Game_BattlerBase.prototype.tpGainEnemyDeath = function() {
  const user = this;
  const note = 'Unh TP Enemy Death';
  return Math.round(UNH_MiscFunc.stateTagCt(user, note));
};

Game_BattlerBase.prototype.tpGainSkill = function() {
  const user = this;
  const action = this.currentAction();
  if (!action) return 0;
  if (action.isItem()) return 0;
  if (action.isGuard()) return 0;
  if (action.isAttack()) return 0;
  const item = action.item();
  if (item.tpCost !== 0) return 0;
  const note = 'Unh TP Skill';
  return Math.round(UNH_MiscFunc.stateTagCt(user, note));
};

Game_BattlerBase.prototype.tpGainAttack = function() {
  const user = this;
  const action = this.currentAction();
  if (!action) return 0;
  if (!action.isAttack()) return 0;
  const item = action.item();
  if (item.tpCost !== 0) return 0;
  const note = 'Unh TP Attack';
  return Math.round(UNH_MiscFunc.stateTagCt(user, note));
};

Game_BattlerBase.prototype.tpGainGuard = function() {
  const user = this;
  const action = this.currentAction();
  if (!action) return 0;
  if (!action.isGuard()) return 0;
  const item = action.item();
  if (item.tpCost !== 0) return 0;
  const note = 'Unh TP Guard';
  return Math.round(UNH_MiscFunc.stateTagCt(user, note));
};

Game_BattlerBase.prototype.tpGainSkillType = function() {
  const user = this;
  const action = this.currentAction();
  if (!action) return 0;
  if (action.isItem()) return 0;
  if (action.isGuard()) return 0;
  if (action.isAttack()) return 0;
  const item = action.item();
  if (item.tpCost !== 0) return 0;
  let tpGain = this.tpGainSkill();
  const stypes = DataManager.getSkillTypes(item);
  if (stypes.length <= 0) return tpGain;
  let note;
  for (const stypeId of stypes) {
    note = 'Unh TP %1 Skill Type'.format(stypeId);
    tpGain += UNH_MiscFunc.stateTagCt(user, note);
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.unhProne = function() {
  const user = this;
  const note = 'Prone';
  return UNH_MiscFunc.isStateTagged(user, note);
};

Game_BattlerBase.prototype.unhTwoHanding = function() {
  const user = this;
  return user.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.note) return false;
    return obj.note.match(/<(?:TWOHANDED)>/i);
  });
};

Game_BattlerBase.prototype.unhIsDoublehand = function() {
  return this.states().some(function(state) {
    if (!state) return false;
    return UNH_CustParams.BasicFunctions.State[obj.id].unhIsDoublehand(this);
  });
  /*const user = this;
  const note = 'unhDoublehand';
  return this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });*/
};

Game_BattlerBase.prototype.unhIsSkyward = function() {
  const user = this;
  const note = 'unhSkyward';
  return UNH_MiscFunc.isStateTagged(user, note);
};

Game_Action.prototype.isWeapon = function(target) {
  return this.item().damage.formula.includes('this.wpnPow(b)');
};

Game_Action.prototype.wpnPow = function(target) {
  const user = this.subject();
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) return ((this.wPow(target, 0) + this.wPow(target, 1)));
  const weaponSlot = user._activeWeaponSlot || 0;
  const dblWpn = user.unhDblWpn(weaponSlot) ? 0.5 : 1;
  return (this.wPow(target, Math.max(Math.min(weaponSlot, 1), 0)) * dblWpn);
};

Game_BattlerBase.prototype.wpnTr = function(index) {
  const retArr = $dataSystem.weaponTypes.map(function(wtype, id) {
    return UNH_CustParams.weaponSkill(this, id);
  }, this);
  if (!index) index = 0;
  if (typeof index !== 'number') index = 0;
  if (isNaN(index)) index = 0;
  index = index % retArr.length;
  return retArr[index];
};

Game_BattlerBase.prototype.unhNoFist = function() {
  return UNH_MiscFunc.isStateTagged(this, 'No Fist');
};

Game_BattlerBase.prototype.unhDblWpn = function(index) {
  const user = this;
  if (user.isActor() || UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) {
    if (user.hasNoWeapons()) {
      return false;
    } else {
      return UNH_MiscFunc.isStateTagged(user, 'Double Weapon');
    }
  } else {
    return UNH_MiscFunc.isStateTagged(user, 'Double Weapon');
  }
};

Game_Action.prototype.physBlock = function(target) {
  if (this.isCertainHit() || this.isMagical()) return false;
  const note = 'Physical Block';
  return (Math.randomInt(10000) < UNH_MiscFunc.targetTagCt(this, target, note));
};

Game_Action.prototype.magBlock = function(target) {
  if (this.isCertainHit() || this.isPhysical()) return false;
  const note = 'Magical Block';
  return (Math.randomInt(10000) < UNH_MiscFunc.targetTagCt(this, target, note));
};

Game_Action.prototype.physParry = function(target) {
  const action = this;
  if (!action.isAttack(target)) return false;
  if (action.isCertainHit() || action.isMagical()) return false;
  const note1 = 'Physical Parry';
  const note2 = 'Physical Parry Plus';
  const note3 = 'Physical Parry Rate';
  const note4 = 'Physical Parry Flat';
  const wpnPry = [];
  let weapons;
  if (target.isActor()) {
    if (target.hasNoWeapons()) {
      weapons = [target.actor()];
    } else if (target.hasNoWeapons()) {
      weapons = target.weapons();
    }
  } else if (UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) {
    if (target.hasNoWeapons()) {
      weapons = [target.enemy()];
    } else if (target.hasNoWeapons()) {
      weapons = target.weapons();
    }
  } else {
    weapons = [target.enemy()];
  }
  const states = target.states();
  let prry;
  for (const weapon of weapons) {
    if (!!weapon) {
      if (!!UNH_MiscFunc.tagFuncs.Target[weapon.groupKey][weapon.id][note1]) {
        prry = UNH_MiscFunc.tagFuncs.Target[weapon.groupKey][weapon.id][note1](action, target);
        if (isNaN(prry)) {
          if (!weapon.meta) continue;
          if (weapon.meta[note1] === undefined) continue;
          wpnPry.push(eval(weapon.meta[note1]));
        } else {
          wpnPry.push(Number(prry));
        }
      } else {
        if (!weapon.meta) continue;
        if (weapon.meta[note1] === undefined) continue;
        wpnPry.push(eval(weapon.meta[note1]));
      }
    }
  }
  for (const state of states) {
    if (!!state) {
      if (!!UNH_MiscFunc.tagFuncs.Target.State[state.id][note1]) {
        prry = UNH_MiscFunc.tagFuncs.Target.State[state.id][note1](action, target);
        if (isNaN(prry)) {
          if (!state.meta) continue;
          if (state.meta[note1] === undefined) continue;
          wpnPry.push(eval(state.meta[note1]));
        } else {
          wpnPry.push(Number(prry));
        }
      } else {
        if (!state.meta) continue;
        if (state.meta[note1] === undefined) continue;
        wpnPry.push(eval(state.meta[note1]));
      }
    }
  }
  if (wpnPry.length < 0) return false;
  for (let parry of wpnPry) {
    parry += UNH_MiscFunc.targetTagCt(action, target, note2);
  }
  for (let parry of wpnPry) {
    parry *= UNH_MiscFunc.targetTagRate(action, target, note3);
  }
  for (let parry of wpnPry) {
    parry += UNH_MiscFunc.targetTagCt(action, target, note4);
  }
  return wpnPry.some(function(pry) {
    const random = Math.randomInt(10000);
    return random < pry;
  });
};

Game_Action.prototype.magParry = function(target) {
  const action = this;
  if (!action.isAttack(target)) return false;
  if (action.isCertainHit() || action.isPhysical()) return false;
  const note1 = 'Magical Parry';
  const note2 = 'Magical Parry Plus';
  const note3 = 'Magical Parry Rate';
  const note4 = 'Magical Parry Flat';
  const wpnPry = [];
  let weapons;
  if (target.isActor()) {
    if (target.hasNoWeapons()) {
      weapons = [target.actor()];
    } else if (target.hasNoWeapons()) {
      weapons = target.weapons();
    }
  } else if (UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) {
    if (target.hasNoWeapons()) {
      weapons = [target.enemy()];
    } else if (target.hasNoWeapons()) {
      weapons = target.weapons();
    }
  } else {
    weapons = [target.enemy()];
  }
  const states = target.states();
  let prry;
  for (const weapon of weapons) {
    if (!!weapon) {
      if (!!UNH_MiscFunc.tagFuncs.Target[weapon.groupKey][weapon.id][note1]) {
        prry = UNH_MiscFunc.tagFuncs.Target[weapon.groupKey][weapon.id][note1](action, target);
        if (isNaN(prry)) {
          if (!weapon.meta) continue;
          if (weapon.meta[note1] === undefined) continue;
          wpnPry.push(eval(weapon.meta[note1]));
        } else {
          wpnPry.push(Number(prry));
        }
      } else {
        if (!weapon.meta) continue;
        if (weapon.meta[note1] === undefined) continue;
        wpnPry.push(eval(weapon.meta[note1]));
      }
    }
  }
  for (const state of states) {
    if (!!state) {
      if (!!UNH_MiscFunc.tagFuncs.Target.State[state.id][note1]) {
        prry = UNH_MiscFunc.tagFuncs.Target.State[state.id][note1](action, target);
        if (isNaN(prry)) {
          if (!state.meta) continue;
          if (state.meta[note1] === undefined) continue;
          wpnPry.push(eval(state.meta[note1]));
        } else {
          wpnPry.push(Number(prry));
        }
      } else {
        if (!state.meta) continue;
        if (state.meta[note1] === undefined) continue;
        wpnPry.push(eval(state.meta[note1]));
      }
    }
  }
  if (wpnPry.length < 0) return false;
  for (let parry of wpnPry) {
    parry += UNH_MiscFunc.targetTagCt(action, target, note2);
  }
  for (let parry of wpnPry) {
    parry *= UNH_MiscFunc.targetTagRate(action, target, note3);
  }
  for (let parry of wpnPry) {
    parry += UNH_MiscFunc.targetTagCt(action, target, note4);
  }
  return wpnPry.some(function(pry) {
    const random = Math.randomInt(10000);
    return random < pry;
  });
};

Game_Action.prototype.checkPhysBreak = function(target, handDex) {
  if (this.isCertainHit() || this.isMagical()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const note = 'Physical Break';
  const otherObjects = this.traitObjects().filter(function(obj) {
    return !DataManager.isWeapon(obj);
  });
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!UNH_MiscFunc.tagFuncs.Target.Weapon[weapon.id][note]) {
        const prry = UNH_MiscFunc.tagFuncs.Target.Weapon[weapon.id][note](this, target);
        if (isNaN(prry)) {
          if (!!weapon.meta) {
            if (weapon.meta[note] !== undefined) {
              feint += eval(weapon.meta[note]);
            }
          }
        } else {
          feint += Number(prry);
        }
      } else if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const obj of otherObjects) {
    if (!!obj) {
      if (!!UNH_MiscFunc.tagFuncs.Target[obj.groupKey][obj.id][note]) {
        const prry = UNH_MiscFunc.tagFuncs.Target[obj.groupKey][obj.id][note](this, target);
        if (isNaN(prry)) {
          if (!!obj.meta) {
            if (obj.meta[note] !== undefined) {
              feint += eval(obj.meta[note]);
            }
          }
        } else {
          feint += Number(prry);
        }
      } else if (!!obj.meta) {
        if (obj.meta[note] !== undefined) {
          feint += eval(obj.meta[note]);
        }
      }
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.checkMagBreak = function(target, handDex) {
  if (this.isCertainHit() || this.isPhysical()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const note = 'Magical Break';
  const otherObjects = this.traitObjects().filter(function(obj) {
    return !DataManager.isWeapon(obj);
  });
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!UNH_MiscFunc.tagFuncs.Target.Weapon[weapon.id][note]) {
        const prry = UNH_MiscFunc.tagFuncs.Target.Weapon[weapon.id][note](this, target);
        if (isNaN(prry)) {
          if (!!weapon.meta) {
            if (weapon.meta[note] !== undefined) {
              feint += eval(weapon.meta[note]);
            }
          }
        } else {
          feint += Number(prry);
        }
      } else if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const obj of otherObjects) {
    if (!!obj) {
      if (!!UNH_MiscFunc.tagFuncs.Target[obj.groupKey][obj.id][note]) {
        const prry = UNH_MiscFunc.tagFuncs.Target[obj.groupKey][obj.id][note](this, target);
        if (isNaN(prry)) {
          if (!!obj.meta) {
            if (obj.meta[note] !== undefined) {
              feint += eval(obj.meta[note]);
            }
          }
        } else {
          feint += Number(prry);
        }
      } else if (!!obj.meta) {
        if (obj.meta[note] !== undefined) {
          feint += eval(obj.meta[note]);
        }
      }
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.checkNoFeint = function(target) {
  if (!this) return false;
  if (UNH_MiscFunc.isSkillTagged(this, target, 'No Feint')) return true;
  if (UNH_MiscFunc.isUserTagged(this, target, 'Cannot Feint')) return true;
  if (UNH_MiscFunc.isTargetTagged(this, target, 'Foresee Feint')) return true;
  return false;
};

Game_Action.prototype.checkPhysFeint = function(target, handDex) {
  if (this.checkNoFeint()) return false;
  if (!this.isAttack(target)) return false;
  if (this.isCertainHit() || this.isMagical()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const note = 'Physical Feint';
  const otherObjects = this.traitObjects().filter(function(obj) {
    return !DataManager.isWeapon(obj);
  });
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!UNH_MiscFunc.tagFuncs.Target.Weapon[weapon.id][note]) {
        const prry = UNH_MiscFunc.tagFuncs.Target.Weapon[weapon.id][note](this, target);
        if (isNaN(prry)) {
          if (!!weapon.meta) {
            if (weapon.meta[note] !== undefined) {
              feint += eval(weapon.meta[note]);
            }
          }
        } else {
          feint += Number(prry);
        }
      } else if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const obj of otherObjects) {
    if (!!obj) {
      if (!!UNH_MiscFunc.tagFuncs.Target[obj.groupKey][obj.id][note]) {
        const prry = UNH_MiscFunc.tagFuncs.Target[obj.groupKey][obj.id][note](this, target);
        if (isNaN(prry)) {
          if (!!obj.meta) {
            if (obj.meta[note] !== undefined) {
              feint += eval(obj.meta[note]);
            }
          }
        } else {
          feint += Number(prry);
        }
      } else if (!!obj.meta) {
        if (obj.meta[note] !== undefined) {
          feint += eval(obj.meta[note]);
        }
      }
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.checkMagFeint = function(target, handDex) {
  if (this.checkNoFeint()) return false;
  if (!this.isAttack(target)) return false;
  if (this.isCertainHit() || this.isPhysical()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const note = 'Magical Feint';
  const otherObjects = this.traitObjects().filter(function(obj) {
    return !DataManager.isWeapon(obj);
  });
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!UNH_MiscFunc.tagFuncs.Target.Weapon[weapon.id][note]) {
        const prry = UNH_MiscFunc.tagFuncs.Target.Weapon[weapon.id][note](this, target);
        if (isNaN(prry)) {
          if (!!weapon.meta) {
            if (weapon.meta[note] !== undefined) {
              feint += eval(weapon.meta[note]);
            }
          }
        } else {
          feint += Number(prry);
        }
      } else if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const obj of otherObjects) {
    if (!!obj) {
      if (!!UNH_MiscFunc.tagFuncs.Target[obj.groupKey][obj.id][note]) {
        const prry = UNH_MiscFunc.tagFuncs.Target[obj.groupKey][obj.id][note](this, target);
        if (isNaN(prry)) {
          if (!!obj.meta) {
            if (obj.meta[note] !== undefined) {
              feint += eval(obj.meta[note]);
            }
          }
        } else {
          feint += Number(prry);
        }
      } else if (!!obj.meta) {
        if (obj.meta[note] !== undefined) {
          feint += eval(obj.meta[note]);
        }
      }
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.physBreak = function(target) {
  if (!action.isPhysical()) return false;
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) return (this.checkPhysBreak(target, 0) || this.checkPhysBreak(target, 1));
  if (!!user._activeWeaponSlot) return this.checkPhysBreak(target, 1);
  return this.checkPhysBreak(target, 0);
};

Game_Action.prototype.magBreak = function(target) {
  if (!action.isMagical()) return false;
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) return (this.checkMagBreak(target, 0) || this.checkMagBreak(target, 1));
  if (!!user._activeWeaponSlot) return this.checkMagBreak(target, 1);
  return this.checkMagBreak(target, 0);
};

Game_Action.prototype.physFeint = function(target) {
  if (!action.isPhysical()) return false;
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) return (this.checkPhysFeint(target, 0) || this.checkPhysFeint(target, 1));
  if (!!user._activeWeaponSlot) return this.checkPhysFeint(target, 1);
  return this.checkPhysFeint(target, 0);
};

Game_Action.prototype.magFeint = function(target) {
  if (!action.isMagical()) return false;
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) return (this.checkMagFeint(target, 0) || this.checkMagFeint(target, 1));
  if (!!user._activeWeaponSlot) return this.checkMagFeint(target, 1);
  return this.checkMagFeint(target, 0);
};

Game_Action.prototype.blockExec = function(target) {
  if (!action.isPhysical()) return action.physBlock(target);
  if (!action.isMagical()) return action.magBlock(target);
  return false;
};

Game_Action.prototype.parryExec = function(target) {
  if (action.isPhysical()) return action.physParry(target);
  if (action.isMagical()) return action.magParry(target);
  return false;
};

Game_Action.prototype.breakExec = function(target) {
  if (action.isPhysical()) return action.physBreak(target);
  if (action.isMagical()) return action.magBreak(target);
  return false;
};

Game_Action.prototype.feintExec = function(target) {
  if (action.isPhysical()) return action.physFeint(target);
  if (action.isMagical()) return action.magFeint(target);
  return false;
};

Game_Action.prototype.advHit = function(target) {
  let advLvl = 0;
  advLvl += UNH_MiscFunc.skillTagCt(this, target, 'Accuracy Advantage');
  advLvl -= UNH_MiscFunc.skillTagCt(this, target, 'Accuracy Disadvantage');
  advLvl += UNH_MiscFunc.userTagCt(this, target, 'Accuracy Advantage');
  advLvl -= UNH_MiscFunc.userTagCt(this, target, 'Accuracy Disadvantage');
  advLvl -= UNH_MiscFunc.targetTagCt(this, target, 'Evasion Advantage');
  advLvl += UNH_MiscFunc.targetTagCt(action, target, 'Evasion Disadvantage');
  return advLvl;
};

Game_Action.prototype.advCrit = function(target) {
  let advLvl = 0;
  advLvl += UNH_MiscFunc.skillTagCt(this, target, 'Critrate Advantage');
  advLvl -= UNH_MiscFunc.skillTagCt(this, target, 'Critrate Disadvantage');
  advLvl += UNH_MiscFunc.userTagCt(this, target, 'Critrate Advantage');
  advLvl -= UNH_MiscFunc.userTagCt(this, target, 'Critrate Disadvantage');
  advLvl -= UNH_MiscFunc.targetTagCt(this, target, 'Critavoid Advantage');
  advLvl += UNH_MiscFunc.targetTagCt(this, target, 'Critavoid Disadvantage');
  return advLvl;
};

Game_Action.prototype.orcCount = function(target, orcType) {
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_ElementStatusCore')) return 0;
  const user = this.subject();
  const orcTypes = ['green', 'red', 'black', 'purple', 'white', 'blue', 'yellow'];
  if (!orcType) {
    orcType = orcTypes[0];
  } else if (typeof orcType === 'number') {
    if (isNaN(orcType)) return 0;
    if (orcType >= orcTypes.length) orcType = 0;
    if (orcType < 0) orcType = 0;
    orcType = orcTypes[orcType];
  } else if (typeof orcType === 'string') {
    if (orcTypes.indexOf(orcType) < 0) orcType = orcTypes[0];
  } else {
    return 0;
  }
  orcType += ' orc';
  let orcCount = 0;
  for (const member of user.friendUnit().aliveMembers()) {
    if (member.hasTraitSet(orcType)) orcCount += 0.5;
  }
  for (const member of target.friendUnit().aliveMembers()) {
    if (member.hasTraitSet(orcType)) orcCount += 0.5;
  }
  return orcCount;
};

Game_Battler.prototype.orcCount = function(orcType, incFoes) {
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_ElementStatusCore')) return 0;
  const user = this;
  const orcTypes = ['green', 'red', 'black', 'purple', 'white', 'blue', 'yellow'];
  if (!orcType) {
    orcType = orcTypes[0];
  } else if (typeof orcType === 'number') {
    if (isNaN(orcType)) return 0;
    if (orcType >= orcTypes.length) orcType = 0;
    if (orcType < 0) orcType = 0;
    orcType = orcTypes[orcType];
  } else if (typeof orcType === 'string') {
    if (orcTypes.indexOf(orcType) < 0) orcType = orcTypes[0];
  } else {
    return 0;
  }
  orcType += ' orc';
  let orcCount = 0;
  for (const member of user.friendUnit().aliveMembers()) {
    if (member.hasTraitSet(orcType)) orcCount += 0.5;
  }
  if (!!incFoes) {
    for (const member of user.opponentsUnit().aliveMembers()) {
      if (member.hasTraitSet(orcType)) orcCount += 0.5;
    }
  }
  return orcCount;
};

Game_Action.prototype.gobCount = function(target) {
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_ElementStatusCore')) return 0;
  const user = this.subject();
  let gobCount = 0;
  for (const member of user.friendUnit().aliveMembers()) {
    if (member.hasTraitSet('goblin')) gobCount += 0.5;
  }
  for (const member of target.friendUnit().aliveMembers()) {
    if (member.hasTraitSet('goblin')) gobCount -= 0.5;
  }
  return gobCount;
};

Game_Battler.prototype.gobCount = function(incFoes) {
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_ElementStatusCore')) return 0;
  const user = this;
  let gobCount = 0;
  for (const member of user.friendUnit().aliveMembers()) {
    if (member.hasTraitSet('goblin')) gobCount += 0.5;
  }
  if (!!incFoes) {
    for (const member of user.opponentsUnit().aliveMembers()) {
      if (member.hasTraitSet('goblin')) gobCount -= 0.5;
    }
  }
  return gobCount;
};

Game_Action.prototype.gnomeAct = function(target) {
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_ElementStatusCore')) return 0;
  const user = this.subject();
  const random = Math.randomInt(300);
  if (user.hasTraitSet('gnome') && target.hasTraitSet('gnome')) {
    return ((random % 5) - 2);
  }
  if (user.hasTraitSet('gnome')) {
    return ((random % 3) - 1);
  }
  if (target.hasTraitSet('gnome')) {
    return ((random % 3) - 1);
  }
  return 0;
};

Game_Battler.prototype.unhIsFlashStep = function() {
  const note = 'unhFlashStep';
  return UNH_MiscFunc.isStateTagged(this, note);
};

Game_Action.prototype.unhIsFlashStep = function(target) {
  const note = 'unhFlashStep';
  if (UNH_MiscFunc.isSkillTagged(this, target, note)) return true;
  return this.subject().unhIsFlashStep();
};

Game_Battler.prototype.unhIsRanged = function(curWpn) {
  const user = this;
  const note = 'unhRanged';
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  for (const state of states) {
    if (!state) continue;
    if (!!UNH_MiscFunc.tagFuncs.State.State[state.id][note]) {
      if (!!UNH_MiscFunc.tagFuncs.State.State[state.id][note](this)) return true;
    }
    if (!state.meta) continue;
    if (!state.meta[note]) continue;
    if (!!eval(state.meta[note])) return true;
  }
  if (user.hasNoWeapons()) return false;
  const weapons = user.weapons();
  if (!curWpn) curWpn = 0;
  if (typeof curWpn !== 'number') curWpn = 0;
  if (isNaN(curWpn)) curWpn = 0;
  curWpn = Math.max(curWpn, 0);
  curWpn = Math.min(curWpn, weapons.length - 1);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!UNH_MiscFunc.tagFuncs.State.Weapon[weapon.id][note]) {
      if (UNH_MiscFunc.tagFuncs.State.Weapon[weapon.id][note](this)) return true;
    } else if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        if (!!eval(weapon.meta[note])) return true;
      }
    }
  }
  return false;
};

Game_Action.prototype.unhIsRanged = function(target, curWpn) {
  if (this.isMagical(true)) return true;
  const action = this;
  const user = this.subject();
  const note = 'unhRanged';
  const item = action.item();
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  if (!!item) {
    if (!!UNH_MiscFunc.tagFuncs.Action.Item[item.id][note]) {
      if (UNH_MiscFunc.tagFuncs.Action.Item[item.id][note](this)) return true;
    } else if (!!item.meta) {
      if (!!item.meta[note]) {
        if (!!eval(item.meta[note])) return true;
      }
    }
  }
  return user.unhIsRanged(curWpn);
};

Game_Battler.prototype.unhIsReach = function(curWpn) {
  if (this.unhIsRanged(curWpn)) return true;
  const user = this;
  const note = 'unhReach';
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  for (const state of states) {
    if (!state) continue;
    if (!!UNH_MiscFunc.tagFuncs.State.State[state.id][note]) {
      if (!!UNH_MiscFunc.tagFuncs.State.State[state.id][note](this)) return true;
    }
    if (!state.meta) continue;
    if (!state.meta[note]) continue;
    if (!!eval(state.meta[note])) return true;
  }
  if (user.hasNoWeapons()) return false;
  const weapons = user.weapons();
  if (!curWpn) curWpn = 0;
  if (typeof curWpn !== 'number') curWpn = 0;
  if (isNaN(curWpn)) curWpn = 0;
  curWpn = Math.max(curWpn, 0);
  curWpn = Math.min(curWpn, weapons.length - 1);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!UNH_MiscFunc.tagFuncs.State.Weapon[weapon.id][note]) {
      if (UNH_MiscFunc.tagFuncs.State.Weapon[weapon.id][note](this)) return true;
    } else if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        if (!!eval(weapon.meta[note])) return true;
      }
    }
  }
  return false;
};

Game_Action.prototype.unhIsReach = function(target, curWpn) {
  if (this.unhIsRanged(target, curWpn)) return true;
  const action = this;
  const user = this.subject();
  const note = 'unhReach';
  const item = action.item();
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  if (!!item) {
    if (!!UNH_MiscFunc.tagFuncs.Action.Item[item.id][note]) {
      if (UNH_MiscFunc.tagFuncs.Action.Item[item.id][note](this)) return true;
    } else if (!!item.meta) {
      if (!!item.meta[note]) {
        if (!!eval(item.meta[note])) return true;
      }
    }
  }
  return user.unhIsReach(curWpn);
};

Game_Battler.prototype.unhIsNoContact = function(curWpn) {
  if (this.unhIsRanged(curWpn)) return true;
  const user = this;
  const note = 'unhNoContact';
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  for (const state of states) {
    if (!state) continue;
    if (!!UNH_MiscFunc.tagFuncs.State.State[state.id][note]) {
      if (!!UNH_MiscFunc.tagFuncs.State.State[state.id][note](this)) return true;
    }
    if (!state.meta) continue;
    if (!state.meta[note]) continue;
    if (!!eval(state.meta[note])) return true;
  }
  if (user.hasNoWeapons()) return false;
  const weapons = user.weapons();
  if (!curWpn) curWpn = 0;
  if (typeof curWpn !== 'number') curWpn = 0;
  if (isNaN(curWpn)) curWpn = 0;
  curWpn = Math.max(curWpn, 0);
  curWpn = Math.min(curWpn, weapons.length - 1);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!UNH_MiscFunc.tagFuncs.State.Weapon[weapon.id][note]) {
      if (UNH_MiscFunc.tagFuncs.State.Weapon[weapon.id][note](this)) return true;
    } else if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        if (!!eval(weapon.meta[note])) return true;
      }
    }
  }
  return false;
};

Game_Action.prototype.unhIsNoContact = function(target, curWpn) {
  if (this.unhIsRanged(target, curWpn)) return true;
  const action = this;
  const user = this.subject();
  const note = 'unhNoContact';
  const item = action.item();
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  if (!!item) {
    if (!!UNH_MiscFunc.tagFuncs.Action.Item[item.id][note]) {
      if (UNH_MiscFunc.tagFuncs.Action.Item[item.id][note](this)) return true;
    } else if (!!item.meta) {
      if (!!item.meta[note]) {
        if (!!eval(item.meta[note])) return true;
      }
    }
  }
  return user.unhIsNoContact(curWpn);
};
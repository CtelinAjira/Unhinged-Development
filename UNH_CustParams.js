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
 * @help
 */
//=============================================================================

const UNH_CustParams = {};
UNH_CustParams.pluginName = 'UNH_CustParams';
UNH_CustParams.parameters = PluginManager.parameters(UNH_CustParams.pluginName);
UNH_CustParams.LevelScale = Number(UNH_CustParams.parameters['LevelScale'] || 10);

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

UNH_CustParams.BasicFunctions = {Actor:{}, Class:{}, Skill:{}, Item:{}, Weapon:{}, Armor:{}, State:{}, Enemy:{}};

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
    case $dataActors:
      groupKey = 'Skill';
      break;
    case $dataClasses:
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
      const battler = this.object();
      const curClass = this.currentClass();
      const equips = this.equips();
      const weapons = this.weapons();
      const armors = this.armors();
      const states = this.states();
      let power = 0;
      for (const state of states) {
        if (!state) continue;
        power = funcLib.State[state.id].unhFloorDamageRate(user);
      }
      if (power <= 0) {
        if (UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) {
          const weapon = this.equips()[this._activeWeaponSlot || 0];
          if (DataManager.isWeapon(weapon)) {
            power = funcLib.Weapon[weapon.id].unhFloorDamageRate(user);
          }
        } else if (weapons.length > 0) {
          const weaponSum = weapons.reduce(function(r, weapon) {
            if (!weapon) return r;
            return r + funcLib.Weapon[weapon.id].unhFloorDamageRate(user);
          }, 0);
          power = (weaponSum / weapons.length);
        }
        if (power <= 0) {
          power = funcLib.Class[curClass.id].unhFloorDamageRate(user);
          if (power <= 0) {
            power = funcLib.Actor[battler.id].unhFloorDamageRate(user);
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
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mArm: {
    get: function() {
      const note = 'Magical Armor';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pBrk: {
    get: function() {
      const note = 'Physical Drop';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const weapons = this.weapons();
      let buffer = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      if (UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) {
        if (weapons.length > 0) {
          const wpnDex = (this._activeWeaponSlot || 0)
          const weapon = weapons[wpnDex];
          if (!!weapon) {
            if (!!weapon.meta) {
              if (!!weapon.meta[note]) {
                buffer += eval(weapon.meta[note]);
              }
            }
          }
        }
      } else {
        for (const weapon of weapons) {
          if (!weapon) continue;
          if (!weapon.meta) continue;
          if (!weapon.meta[note]) continue;
          buffer += eval(weapon.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mBrk: {
    get: function() {
      const note = 'Magical Drop';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const weapons = this.weapons();
      let buffer = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      if (UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) {
        if (weapons.length > 0) {
          const wpnDex = (this._activeWeaponSlot || 0)
          const weapon = weapons[wpnDex];
          if (!!weapon) {
            if (!!weapon.meta) {
              if (!!weapon.meta[note]) {
                buffer += eval(weapon.meta[note]);
              }
            }
          }
        }
      } else {
        for (const weapon of weapons) {
          if (!weapon) continue;
          if (!weapon.meta) continue;
          if (!weapon.meta[note]) continue;
          buffer += eval(weapon.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pRes: {
    get: function() {
      const note = 'Physical Resist';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mRes: {
    get: function() {
      const note = 'Magical Resist';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pBuf: {
    get: function() {
      const note = 'Physical Buffer';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, mBuf: {
    get: function() {
      const note = 'Magical Buffer';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, pEnh: {
    get: function() {
      const note = 'Physical Enhance';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, mEnh: {
    get: function() {
      const note = 'Magical Enhance';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, spdBoost: {
    get: function() {
      const note = 'Speed Boost';
      const user = this;
      const states = this.states();
      const equips = this.equips();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, physDmgPlus: {
    get: function() {
      const note = 'Physical Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, tekDmgPlus: {
    get: function() {
      const note = 'Techno Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, acnDmgPlus: {
    get: function() {
      const note = 'Arcane Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, psiDmgPlus: {
    get: function() {
      const note = 'Psionic Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, auraDmgPlus: {
    get: function() {
      const note = 'Aura Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, domDmgPlus: {
    get: function() {
      const note = 'Domain Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
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
      const battler = this.object();
      const curClass = ((this.currentClass()) ? (this.currentClass()) : (null));
      const equips = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.equips()) : ([]));
      const weapons = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.weapons()) : ([]));
      const armors = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.armors()) : ([]));
      const states = this.states();
      let power = 0;
      for (const state of states) {
        if (!state) continue;
        power = funcLib.State[state.id].unhFloorDamageRate(user);
      }
      if (power <= 0) {
        if (weapons.length > 0) {
          if (UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) {
            const weapon = this.equips()[this._activeWeaponSlot || 0];
            if (DataManager.isWeapon(weapon)) {
              power = funcLib.Weapon[weapon.id].unhFloorDamageRate(user);
            }
          } else if (weapons.length > 0) {
            const weaponSum = weapons.reduce(function(r, weapon) {
              if (!weapon) return r;
              return r + funcLib.Weapon[weapon.id].unhFloorDamageRate(user);
            }, 0);
            power = (weaponSum / weapons.length);
          }
        }
        if (power <= 0) {
          if (!!curClass) power = funcLib.Class[curClass.id].unhFloorDamageRate(user);
          if (power <= 0) {
            power = funcLib.Enemy[battler.id].unhFloorDamageRate(user);
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
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.armors()) : ([]));
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mArm: {
    get: function() {
      const note = 'Magical Armor';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.armors()) : ([]));
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pBrk: {
    get: function() {
      const note = 'Physical Drop';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const weapons = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.weapons()) : ([]));
      let buffer = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      if (UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) {
        if (weapons.length > 0) {
          const wpnDex = (this._activeWeaponSlot || 0)
          const weapon = weapons[wpnDex];
          if (!!weapon) {
            if (!!weapon.meta) {
              if (!!weapon.meta[note]) {
                buffer += eval(weapon.meta[note]);
              }
            }
          }
        }
      } else {
        for (const weapon of weapons) {
          if (!weapon) continue;
          if (!weapon.meta) continue;
          if (!weapon.meta[note]) continue;
          buffer += eval(weapon.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mBrk: {
    get: function() {
      const note = 'Magical Drop';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const weapons = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.weapons()) : ([]));
      let buffer = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      if (UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) {
        if (weapons.length > 0) {
          const wpnDex = (this._activeWeaponSlot || 0)
          const weapon = weapons[wpnDex];
          if (!!weapon) {
            if (!!weapon.meta) {
              if (!!weapon.meta[note]) {
                buffer += eval(weapon.meta[note]);
              }
            }
          }
        }
      } else {
        for (const weapon of weapons) {
          if (!weapon) continue;
          if (!weapon.meta) continue;
          if (!weapon.meta[note]) continue;
          buffer += eval(weapon.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pRes: {
    get: function() {
      const note = 'Physical Resist';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.armors()) : ([]));
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mRes: {
    get: function() {
      const note = 'Magical Resist';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.armors()) : ([]));
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pBuf: {
    get: function() {
      const note = 'Physical Buffer';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, mBuf: {
    get: function() {
      const note = 'Magical Buffer';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, pEnh: {
    get: function() {
      const note = 'Physical Enhance';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, mEnh: {
    get: function() {
      const note = 'Magical Enhance';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, spdBoost: {
    get: function() {
      const note = 'Speed Boost';
      const user = this;
      const states = this.states();
      const equips = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.equips()) : ([]));
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      if (UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) {
        for (const equip of equips) {
          if (!equip) continue;
          if (!equip.meta) continue;
          if (!equip.meta[note]) continue;
          buffer += eval(equip.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, physDmgPlus: {
    get: function() {
      const note = 'Physical Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.equips()) : ([]));
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, tekDmgPlus: {
    get: function() {
      const note = 'Techno Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.equips()) : ([]));
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, acnDmgPlus: {
    get: function() {
      const note = 'Arcane Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.equips()) : ([]));
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, psiDmgPlus: {
    get: function() {
      const note = 'Psionic Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.equips()) : ([]));
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, auraDmgPlus: {
    get: function() {
      const note = 'Aura Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.equips()) : ([]));
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, domDmgPlus: {
    get: function() {
      const note = 'Domain Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = ((UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) ? (this.equips()) : ([]));
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }
});

UNH_CustParams.weaponSkill = function(user, wtypeId) {
  if (!UNH_MiscFunc.hasPlugin('UNH_SkillLevels')) return 0;
  const wtypes = $dataSystem.weaponTypes;
  let note = "Unarmed Master";
  if (wtypeId > 0 && wtypeId < wtypes.length) note = wtypes[wtypeId] + " Master";
  const skillId = 12 + wtypeId;
  const battler = user.object();
  const curClass = user.currentClass();
  const states = user.states();
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (!state.meta[note]) continue;
    if (!eval(state.meta[note])) continue;
    return user.unhSkillLevel(skillId);
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        if (!!eval(curClass.meta[note])) {
          return user.unhSkillLevel(skillId);
        }
      }
    }
  }
  if (!!battler.meta) {
    if (!!battler.meta[note]) {
      if (!!eval(battler.meta[note])) {
        return user.unhSkillLevel(skillId);
      }
    }
  }
  return 0;
};

Game_Action.prototype.tLv = function(target) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const note = 'UnhLevelPlus';
  let actnLv = 0;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        actnLv = Number(eval(obj.meta[note]));
        if (isNaN(actnLv)) actnLv = 0;
      }
    }
  }
  let retAdd;
  const userLv = user.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    retAdd = Number(eval(obj.meta[note]));
    if (isNaN(retAdd)) return r;
    return r + retAdd;
  }, user.level);
  const targLv = target.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    retAdd = Number(eval(obj.meta[note]));
    if (isNaN(retAdd)) return r;
    return r + retAdd;
  }, target.level);
  return (actnLv + userLv - targLv);
};

Game_Action.prototype.tLvScl = function(target) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  return UNH_CustParams.levelScaling(user.level + this.tLv(target));
};

Game_BattlerBase.prototype.bossScale = function() {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const note = 'UnhLevelPlus';
  let retAdd;
  const level = user.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    retAdd = Number(eval(obj.meta[note]));
    if (isNaN(retAdd)) return r;
    return r + retAdd;
  }, user.level);
  return UNH_CustParams.levelScaling(level);
};

Game_Action.prototype.wMag = function(target, handDex) {
  const action = this;
  const item = this.item();
  const note = 'Magic Weapon';
  const user = this.subject();
  const equips = user.equips();
  const weapons = user.weapons();
  const armors = user.armors();
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  const isDisarmed = states.some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    return !!state.meta['Disarm State'];
  });
  if (!!item) {
    if (!!item.meta) {
      if (item.meta[note] !== undefined) {
        if (!!eval(item.meta[note])) return true;
      }
    }
  }
  if (this.hasNoWeapons()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  if (handDex > equips.length) handDex = equips.length - 1;
  if (!isDisarmed) {
    const weapon = equips[handDex];
    if (DataManager.isWeapon(weapon)) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          if (!!eval(weapon.meta[note])) return true;
        }
      }
    }
  }
  return states.some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
};

Game_Action.prototype.wPow = function(target, handDex) {
  const note = 'Weapon Power';
  const action = this;
  const item = this.item();
  const user = this.subject();
  const battler = user.object();
  const curClass = user.currentClass();
  const equips = user.equips();
  const weapons = user.weapons();
  const armors = user.armors();
  const states = user.states();
  if (!!item) {
    if (!!item.meta) {
      if (item.meta[note] !== undefined) {
        if (!!eval(item.meta[note])) return Number(eval(item.meta[note]));
      }
    }
  }
  if (user.hasNoWeapons()) {
    for (const state of states) {
      if (!state) continue;
      if (!state.meta) continue;
      if (state.meta[note] === undefined) continue;
      const power = eval(state.meta[note]);
      return power;
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (curClass.meta[note] !== undefined) {
          const power = eval(curClass.meta[note]);
          return power;
        }
      }
    }
    if (!!battler.meta) {
      if (battler.meta[note] !== undefined) {
        const power = eval(battler.meta[note]);
        return power;
      }
    }
    return 0;
  }
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
  const isDisarmed = states.some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    return !!state.meta['Disarm State'];
  });
  if (!isDisarmed) {
    const weapon = equips[handDex];
    if (DataManager.isWeapon(weapon)) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          const power = eval(weapon.meta[note]);
          if (isDoublehand) return (power * 1.5);
          return (power / Math.pow(2, handDex));
        }
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    const power = eval(state.meta[note]);
    if (isDoublehand) return (power * 1.5);
    return (power / Math.pow(2, handDex));
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (curClass.meta[note] !== undefined) {
        const power = eval(curClass.meta[note]);
        if (isDoublehand) return (power * 1.5);
        return (power / Math.pow(2, handDex));
      }
    }
  }
  if (!!battler.meta) {
    if (battler.meta[note] !== undefined) {
      const power = eval(battler.meta[note]);
      if (isDoublehand) return (power * 1.5);
      return (power / Math.pow(2, handDex));
    }
  }
  return 0;
};

Game_BattlerBase.prototype.lgtArmCheck = function() {
  const user = this;
  const note = 'Light Armor';
  const stateArmor = this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
  if (stateArmor) return true;
  if (this.isActor() || UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) {
    return this.armors().some(function(armor) {
      if (!armor) return false;
      if (!armor.meta) return false;
      if (!armor.meta[note]) return false;
      return !!eval(armor.meta[note]);
    });
  } else {
    return false;
  }
};

Game_BattlerBase.prototype.medArmCheck = function() {
  const user = this;
  const note = 'Medium Armor';
  const stateArmor = this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
  if (stateArmor) return true;
  if (this.isActor() || UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) {
    return this.armors().some(function(armor) {
      if (!armor) return false;
      if (!armor.meta) return false;
      if (!armor.meta[note]) return false;
      return !!eval(armor.meta[note]);
    });
  } else {
    return false;
  }
};

Game_BattlerBase.prototype.hvyArmCheck = function() {
  const user = this;
  const note = 'Heavy Armor';
  const stateArmor = this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
  if (stateArmor) return true;
  if (this.isActor() || UNH_MiscFunc.hasPlugin('UNH_VS_EnemyWeapons')) {
    return this.armors().some(function(armor) {
      if (!armor) return false;
      if (!armor.meta) return false;
      if (!armor.meta[note]) return false;
      return !!eval(armor.meta[note]);
    });
  } else {
    return false;
  }
};

Game_BattlerBase.prototype.nullifyTpGain = function() {
  const user = this;
  const note = 'Unh TP Nullify';
  const objects = this.traitObjects();
  const tpGain = this.traitObjects().some(function(obj) {
   if (!obj) return false;
   if (!obj.meta) return false;
   if (!obj.meta[note]) return false;
   return !!eval(obj.meta[note]);
  });
  return tpGain;
};

Game_BattlerBase.prototype.tpHpDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage by HP';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 1;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note] && obj.meta[note] !== 0) continue;
    tpGain *= eval(obj.meta[note]);
  }
  return tpGain;
};

Game_BattlerBase.prototype.tpMpDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage by MP';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 1;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note] && obj.meta[note] !== 0) continue;
    tpGain *= eval(obj.meta[note]);
  }
  return tpGain;
};

Game_BattlerBase.prototype.tpTakeDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage In';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 1;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note] && obj.meta[note] !== 0) continue;
    tpGain *= eval(obj.meta[note]);
  }
  return tpGain;
};

Game_BattlerBase.prototype.tpDealDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage Out';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 1;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note] && obj.meta[note] !== 0) continue;
    tpGain *= eval(obj.meta[note]);
  }
  return tpGain;
};

Game_BattlerBase.prototype.tpGainRegen = function() {
  const user = this;
  const note = 'Unh TP Regen';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 0;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note]) continue;
    tpGain += eval(obj.meta[note]);
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.tpGainDeadMembers = function() {
  const user = this;
  const note = 'Unh TP Per Dead Ally';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 0;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note]) continue;
    tpGain += eval(obj.meta[note]);
  }
  if (this.isActor()) {
    return Math.round(tpGain * $gameParty.deadMembers().length);
  } else {
    return Math.round(tpGain * $gameTroop.deadMembers().length);
  }
};

Game_BattlerBase.prototype.tpGainEvade = function() {
  const user = this;
  const note = 'Unh TP Evasion';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 0;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note]) continue;
    tpGain += eval(obj.meta[note]);
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.tpGainSolo = function() {
  const user = this;
  const note = 'Unh TP Last Standing';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 0;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note]) continue;
    tpGain += eval(obj.meta[note]);
  }
  return Math.round(tpGain);
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
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 0;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note]) continue;
    tpGain += eval(obj.meta[note]);
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.tpGainEnemyDeath = function() {
  const user = this;
  const note = 'Unh TP Enemy Death';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 0;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note]) continue;
    tpGain += eval(obj.meta[note]);
  }
  return Math.round(tpGain);
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
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 0;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        tpGain += eval(item.meta[note]);
      }
    }
  }
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note]) continue;
    tpGain += eval(obj.meta[note]);
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.tpGainAttack = function() {
  const user = this;
  const action = this.currentAction();
  if (!action) return 0;
  if (!action.isAttack()) return 0;
  const item = action.item();
  if (item.tpCost !== 0) return 0;
  const note = 'Unh TP Attack';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 0;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note]) continue;
    tpGain += eval(obj.meta[note]);
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.tpGainGuard = function() {
  const user = this;
  const action = this.currentAction();
  if (!action) return 0;
  if (!action.isGuard()) return 0;
  const item = action.item();
  if (item.tpCost !== 0) return 0;
  const note = 'Unh TP Guard';
  const objects = this.traitObjects();
  const max = this.maxTp();
  let tpGain = 0;
  for (const obj of objects) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note]) continue;
    tpGain += eval(obj.meta[note]);
  }
  return Math.round(tpGain);
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
  const objects = this.traitObjects();
  const max = this.maxTp();
  let note;
  for (const stypeId of stypes) {
    note = 'Unh TP %1 Skill Type'.format(stypeId);
    for (const obj of objects) {
      if (!obj) continue;
      if (!obj.meta) continue;
      if (!obj.meta[note]) continue;
      tpGain += eval(obj.meta[note]);
    }
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.unhProne = function() {
  const user = this;
  const note = 'Prone';
  return this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
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
  return this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
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

Game_Action.prototype.wpnMag = function(target) {
  if (!this.isWeapon(target)) return false;
  const user = this.subject();
  if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) return (this.wMag(target, 0) || this.wMag(target, 1));
  const weaponSlot = user._activeWeaponSlot || 0;
  return this.wMag(target, weaponSlot);
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

Game_BattlerBase.prototype.unhDblWpn = function(index) {
  const user = this;
  const note = 'Double Weapon';
  const statesDouble = this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
  if (statesDouble) return true;
  if (this.hasNoWeapons()) {
    const statesNoFist = this.states().some(function(state) {
      if (!state) return false;
      if (!state.meta) return false;
      if (!state.meta['No Fist']) return false;
      return !!eval(state.meta['No Fist']);
    });
    if (statesNoFist) return true;
    const offhand = user.equips()[1];
    if (!DataManager.isArmor(offhand)) return true;
    const meta = offhand.meta;
    if (!meta) return true;
    return !meta['No Fist'];
  }
  const weaponsDouble = this.weapons().some(function(weapon) {
    if (!weapon) return false;
    if (!weapon.meta) return false;
    if (!weapon.meta[note]) return false;
    return !!eval(weapon.meta[note]);
  });
  if (index === undefined) return weaponsDouble;
  if (index === null) return weaponsDouble;
  if (typeof index !== 'number') return weaponsDouble;
  if (isNaN(index)) return weaponsDouble;
  const weapon = this.weapons()[index];
  if (!weapon) return false;
  if (!weapon.meta) return false;
  if (!weapon.meta[note]) return false;
  return true;
};

Game_Action.prototype.physBlock = function(target) {
  if (this.isCertainHit()) return false;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && this.wpnMag(target)) return false;
  if (this.isMagical() && !this.wpnMag(target)) return false;
  const note = 'Physical Block';
  const states = target.states();
  if (target.unhIsDoublehand()) return false;
  if (target.weapons().length > 1) return false;
  const equips = target.equips();
  const shield = equips[1];
  if (!shield) return false;
  if (!shield.meta) return false;
  if (shield.meta[note] === undefined) return false;
  let parry = eval(shield.meta[note]);
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    parry += eval(state.meta[note]);
  }
  const random = Math.randomInt(10000);
  return random < parry;
};

Game_Action.prototype.magBlock = function(target) {
  if (this.isCertainHit()) return false;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && !this.wpnMag(target)) return false;
  if (this.isMagical() && this.wpnMag(target)) return false;
  const note = 'Magical Block';
  const states = target.states();
  if (target.unhIsDoublehand()) return false;
  if (target.weapons().length > 1) return false;
  const equips = target.equips();
  const shield = equips[1];
  if (!shield) return false;
  if (!shield.meta) return false;
  if (shield.meta[note] === undefined) return false;
  let parry = eval(shield.meta[note]);
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    parry += eval(state.meta[note]);
  }
  const random = Math.randomInt(10000);
  return random < parry;
};

Game_Action.prototype.physParry = function(target) {
  if (this.isCertainHit()) return false;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && this.wpnMag(target)) return false;
  if (this.isMagical() && !this.wpnMag(target)) return false;
  const note = 'Physical Parry';
  const note2 = 'Physical Parry Plus';
  const battler = target.object();
  const curClass = target.currentClass();
  const states = target.states();
  const weapons = target.weapons();
  const isDoublehand = target.unhIsDoublehand();
  const wpnPry = [];
  for (const weapon of weapons) {
    if (!weapon) continue;
    if (!weapon.meta) continue;
    if (weapon.meta[note] === undefined) continue;
    wpnPry.push(eval(weapon.meta[note]));
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    wpnPry.push(eval(state.meta[note]));
  }
  if (wpnPry.length < 0) return false;
  for (let parry of wpnPry) {
    for (const state of states) {
      if (!state) continue;
      if (!state.meta) continue;
      if (state.meta[note2] === undefined) continue;
      parry += eval(state.meta[note2]);
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (curClass.meta[note2] !== undefined) {
          parry += eval(curClass.meta[note2]);
        }
      }
    }
    if (!!battler.meta) {
      if (battler.meta[note2] !== undefined) {
        parry += eval(battler.meta[note2]);
      }
    }
    if (isDoublehand) parry = parry * 1.5;
  }
  return wpnPry.some(function(pry) {
    const random = Math.randomInt(10000);
    return random < pry;
  });
};

Game_Action.prototype.magParry = function(target) {
  if (this.isCertainHit()) return false;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && !this.wpnMag(target)) return false;
  if (this.isMagical() && this.wpnMag(target)) return false;
  const note = 'Magical Parry';
  const note2 = 'Magical Parry Plus';
  const battler = target.object();
  const curClass = target.currentClass();
  const states = target.states();
  const weapons = target.weapons();
  const isDoublehand = target.unhIsDoublehand();
  const wpnPry = [];
  for (const weapon of weapons) {
    if (!weapon) continue;
    if (!weapon.meta) continue;
    if (weapon.meta[note] === undefined) continue;
    wpnPry.push(eval(weapon.meta[note]));
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    wpnPry.push(eval(state.meta[note]));
  }
  if (wpnPry.length < 0) return false;
  for (let parry of wpnPry) {
    for (const state of states) {
      if (!state) continue;
      if (!state.meta) continue;
      if (state.meta[note2] === undefined) continue;
      parry += eval(state.meta[note2]);
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (curClass.meta[note2] !== undefined) {
          parry += eval(curClass.meta[note2]);
        }
      }
    }
    if (!!battler.meta) {
      if (battler.meta[note2] !== undefined) {
        parry += eval(battler.meta[note2]);
      }
    }
    if (isDoublehand) parry = parry * 1.5;
  }
  return wpnPry.some(function(pry) {
    const random = Math.randomInt(10000);
    return random < pry;
  });
};

Game_Action.prototype.checkPhysBreak = function(target, handDex) {
  if (this.isCertainHit()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && this.wpnMag(target)) return false;
  if (this.isMagical() && !this.wpnMag(target)) return false;
  const note = 'Physical Break';
  const battler = this.object();
  const curClass = this.currentClass();
  const states = this.states();
  const isDoublehand = this.unhIsDoublehand();
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    feint += eval(state.meta[note]);
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (curClass.meta[note] !== undefined) {
        feint += eval(curClass.meta[note]);
      }
    }
  }
  if (!!battler.meta) {
    if (battler.meta[note] !== undefined) {
      feint += eval(battler.meta[note]);
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.checkMagBreak = function(target, handDex) {
  if (this.isCertainHit()) return false;
  if (!this.isPhysical()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && !this.wpnMag(target)) return false;
  if (this.isMagical() && this.wpnMag(target)) return false;
  const note = 'Magical Break';
  const battler = this.object();
  const curClass = this.currentClass();
  const states = this.states();
  const isDoublehand = this.unhIsDoublehand();
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    feint += eval(state.meta[note]);
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (curClass.meta[note] !== undefined) {
        feint += eval(curClass.meta[note]);
      }
    }
  }
  if (!!battler.meta) {
    if (battler.meta[note] !== undefined) {
      feint += eval(battler.meta[note]);
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.checkNoFeint = function(target) {
  const action = this;
  if (!action) return false;
  const item = this.item();
  if (!item) return false;
  if (!item.meta) return false;
  const user = this.subject();
  const note = 'No Feint';
  if (obj.meta[note] === undefined) return false;
  return !!eval(obj.meta[note]);
};

Game_Action.prototype.checkPhysFeint = function(target, handDex) {
  if (this.checkNoFeint()) return false;
  if (this.isCertainHit()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && this.wpnMag(target)) return false;
  if (this.isMagical() && !this.wpnMag(target)) return false;
  const note = 'Physical Feint';
  const battler = this.object();
  const curClass = this.currentClass();
  const states = this.states();
  const isDoublehand = this.unhIsDoublehand();
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    feint += eval(state.meta[note]);
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (curClass.meta[note] !== undefined) {
        feint += eval(curClass.meta[note]);
      }
    }
  }
  if (!!battler.meta) {
    if (battler.meta[note] !== undefined) {
      feint += eval(battler.meta[note]);
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.checkMagFeint = function(target, handDex) {
  if (this.checkNoFeint()) return false;
  if (this.isCertainHit()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && !this.wpnMag(target)) return false;
  if (this.isMagical() && this.wpnMag(target)) return false;
  const note = 'Magical Feint';
  const battler = this.object();
  const curClass = this.currentClass();
  const states = this.states();
  const isDoublehand = this.unhIsDoublehand();
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    feint += eval(state.meta[note]);
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (curClass.meta[note] !== undefined) {
        feint += eval(curClass.meta[note]);
      }
    }
  }
  if (!!battler.meta) {
    if (battler.meta[note] !== undefined) {
      feint += eval(battler.meta[note]);
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
  const action = this;
  const user = this.subject();
  const item = this.item();
  let advLvl = 0;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta['Accuracy Advantage']) advLvl += Number(eval(item.meta['Accuracy Advantage']));
      if (!!item.meta['Accuracy Disadvantage']) advLvl -= Number(eval(item.meta['Accuracy Disadvantage']));
    }
  }
  for (const obj of user.traitObjects()) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!!obj.meta['Accuracy Advantage']) advLvl += Number(eval(obj.meta['Accuracy Advantage']));
    if (!!obj.meta['Accuracy Disadvantage']) advLvl -= Number(eval(obj.meta['Accuracy Disadvantage']));
  }
  for (const obj of target.traitObjects()) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!!obj.meta['Evasion Advantage']) advLvl -= Number(eval(obj.meta['Evasion Advantage']));
    if (!!obj.meta['Evasion Disadvantage']) advLvl += Number(eval(obj.meta['Evasion Disadvantage']));
  }
  return advLvl;
};

Game_Action.prototype.advCrit = function(target) {
  const action = this;
  const user = this.subject();
  const item = this.item();
  let advLvl = 0;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta['Critrate Advantage']) advLvl += Number(eval(item.meta['Critrate Advantage']));
      if (!!item.meta['Critrate Disadvantage']) advLvl -= Number(eval(item.meta['Critrate Disadvantage']));
    }
  }
  for (const obj of user.traitObjects()) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!!obj.meta['Critrate Advantage']) advLvl += Number(eval(obj.meta['Critrate Advantage']));
    if (!!obj.meta['Critrate Disadvantage']) advLvl -= Number(eval(obj.meta['Critrate Disadvantage']));
  }
  for (const obj of target.traitObjects()) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!!obj.meta['Critavoid Advantage']) advLvl -= Number(eval(obj.meta['Critavoid Advantage']));
    if (!!obj.meta['Critavoid Disadvantage']) advLvl += Number(eval(obj.meta['Critavoid Disadvantage']));
  }
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
  const user = this;
  const note = 'unhFlashStep';
  for (const obj of user.traitObjects()) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!obj.meta[note]) continue;
    return !!eval(obj.meta[note]);
  }
  return false;
};

Game_Action.prototype.unhIsFlashStep = function(target) {
  const action = this;
  const user = this.subject();
  const note = 'unhFlashStep';
  const item = action.item();
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        return !!eval(item.meta[note]);
      }
    }
  }
  return user.unhIsFlashStep();
};

Game_Battler.prototype.unhIsRanged = function(curWpn) {
  const user = this;
  const note = 'unhRanged';
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  let isRanged = false;
  for (const state of states) {
    if (!state) continue;
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
  curWpn = Math.min(curWpn, weapons.length);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        try {
          isRanged = eval(weapon.meta[note]);
          if (isRanged) return true;
        } catch (e) {
          return false;
        }
      }
    }
  }
  return false;
};

Game_Action.prototype.unhIsRanged = function(target, curWpn) {
  if (this.isMagical()) return true;
  const action = this;
  const user = this.subject();
  const note = 'unhRanged';
  const item = action.item();
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  let isRanged = false;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        isRanged = eval(item.meta[note]);
        if (!!isRanged) return true;
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
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
  curWpn = Math.min(curWpn, weapons.length);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        try {
          isRanged = eval(weapon.meta[note]);
          if (isRanged) return true;
        } catch (e) {
          return false;
        }
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
  let isRanged = false;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        isRanged = eval(item.meta[note]);
        if (!!isRanged) return true;
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
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
  curWpn = Math.min(curWpn, weapons.length);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        try {
          isRanged = eval(weapon.meta[note]);
          if (isRanged) return true;
        } catch (e) {
          return false;
        }
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
  let isRanged = false;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        isRanged = eval(item.meta[note]);
        if (!!isRanged) return true;
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
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
  curWpn = Math.min(curWpn, weapons.length);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        try {
          isRanged = eval(weapon.meta[note]);
          if (isRanged) return true;
        } catch (e) {
          return false;
        }
      }
    }
  }
  return false;
};
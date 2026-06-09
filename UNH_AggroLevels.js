//=============================================================================
// Unhinged Development - Aggro Levels
// UNH_AggroLevels.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter UNH_BleedStacks
 * @orderAfter VisuMZ_1_BattleCore
 * @orderAfter VisuMZ_3_BattleAI
 * @plugindesc [RPG Maker MZ] [Version 1.04] [Unhinged] [AggroLevels]
 * @author Unhinged Developer
 *
 * @param BaseAggro
 * @text Base Aggro
 * @desc The aggro value that corresponds to 100% TGR
 * @type string
 * @default 50
 *
 * @param HurtingAggro
 * @text Hurting Aggro
 * @desc The amount of aggro each point of damage generates
 * @type string
 * @default 1
 *
 * @param HealingAggro
 * @text Healing Aggro
 * @desc The amount of aggro each point of healing generates
 * @type string
 * @default 2
 *
 * @param HPMult
 * @text HP Damage Multiplier
 * @desc The multiplier applied to aggro from HP damage
 * @type string
 * @default 1
 *
 * @param MPMult
 * @text MP Damage Multiplier
 * @desc The multiplier applied to aggro from MP damage
 * @type string
 * @default 1
 *
 * @param isTaunt
 * @text Include Taunts
 * @desc Should this plugin include taunts?
 * @type boolean
 * @default false
 *
 * @param isVoke
 * @text Include Provocation
 * @desc Should this plugin include provoke effects?
 * @type boolean
 * @default false
 *
 * @param autoCalc
 * @text Automatic Calculation
 * @desc Should this plugin automatically change TGR?
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Have you ever wanted your attacks to get the enemy's attention?  VS too 
 * opaque for you?  Here's an answer!
 *
 * Damage and healing now dynamically alter your TGR via a new variable called 
 * Base Aggro!  And you can manipulate how it accumulates.
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Unh Aggro Plus: X>
 * <Unh Aggro Rate: X>
 * <Unh Aggro Flat: X>
 * - Use for Actors/Skills/Weapons/Armors/Enemies/States
 * - Manipulates TGR changes (X is a Number)
 *   - delta_TGR = ((dmg_dealt + unhAggroPlus) * unhAggroRate) + unhAggroFlat
 * <Unh Add User Aggro: X>
 * - Use for Skills
 * - Adds X to the user's aggro (X is a JS formula)
 *   - user - the user
 * <Unh Add Target Aggro: X>
 * - Use for Skills
 * - Adds X to the target's aggro (X is a JS formula)
 *   - user - the user
 *   - target - the target
 * <unhTaunt>
 * - Use for States
 * - Forces all enemy attacks to target the battler afflicted with this state
 * <Unh Hide>
 * - Use for States
 * - Forces all attacks AWAY from the battler afflicted with this state
 * - Player attacks will not even recognize afflicted battler as a valid target
 * <Unh Hide: X>
 * - Use for States
 * - As <Unh Hide>, but with boolean condition X (JS Eval)
 *   - Variables: action, item, user, target
 * <Unh Filter: X>
 * - Use for Skills
 * - Forces this skill to NOT target battlers that satisfy X (JS Eval)
 *   - X should evaluate to a boolean
 *   - Variables: action, item, user, target
 * <Unh Obey Aggro>
 * - Use for Skills/Items
 * - Forces random-target skills to obey normal aggro rules, per vanilla RMMZ
 * <Unh Obey Aggro: X>
 * - Use for Skills/Items
 * - As <Unh Obey Aggro>, but with boolean condition X (JS Eval)
 * <unhProvoke>
 * - Use for States
 * - Forces all the afflicted battler's attacks to target the state's source
 * 
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * $gameParty.unhMaxAggro()
 * $gameTroop.unhMaxAggro()
 * - returns the highest aggro total for the chosen unit
 * battler.unhAggroBase()
 * - returns the current aggro total for the battler
 * battler.unhAggroPlus(target)
 * action.unhAggroPlus(target)
 * - returns the current total for (unhAggroPlus)
 * battler.unhAggroRate(target)
 * action.unhAggroRate(target)
 * - returns the current total for (unhAggroRate)
 * battler.unhAggroFlat(target)
 * action.unhAggroFlat(target)
 * - returns the current total for (unhAggroFlat)
 * battler.unhHpMult()
 * - returns the multiplier for aggro from HP damage
 * battler.unhMpMult()
 * - returns the multiplier for aggro from MP damage
 * battler.unhSetAggro()
 * - resets the target's TGR to 100%
 * battler.unhSetAggro(X)
 * - sets the target's Base Aggro to X (Number)
 * battler.unhAddAggro(target, X)
 * battler.unhAddAggro(target, X, false)
 * - increases the target's Base Aggro by X (Number)
 *   - value is modified by plus/rate/flat
 * battler.unhAddAggro(target, X, true)
 * - increases the target's Base Aggro by X (Number)
 *   - value is NOT modified by plus/rate/flat
 * 
 * ============================================================================
 * Altered Functions
 * ============================================================================
 * 
 * action.decideRandomTarget()
 * action.randomTargets(unit)
 * - ignores party's TGR values for actual random-target skills
 * 
 * action.makeTargets()
 * action.itemTargetCandidates()
 * - now checks <unhHide> notetag
 */
//=============================================================================

const UNH_AggroLevels = {};
UNH_AggroLevels.pluginName = 'UNH_AggroLevels';
UNH_AggroLevels.parameters = PluginManager.parameters(UNH_AggroLevels.pluginName);
UNH_AggroLevels.BaseAggro = String(UNH_AggroLevels.parameters['BaseAggro'] || '0');
UNH_AggroLevels.BaseAggroFunc = new Function('user', 'return ' + UNH_AggroLevels.BaseAggro);
UNH_AggroLevels.HurtingAggro = String(UNH_AggroLevels.parameters['HurtingAggro'] || '0');
UNH_AggroLevels.HurtingAggroFunc = new Function('user', 'return ' + UNH_AggroLevels.HurtingAggro);
UNH_AggroLevels.HealingAggro = String(UNH_AggroLevels.parameters['HealingAggro'] || '0');
UNH_AggroLevels.HealingAggroFunc = new Function('user', 'return ' + UNH_AggroLevels.HealingAggro);
UNH_AggroLevels.HPMult = String(UNH_AggroLevels.parameters['HPMult'] || '0');
UNH_AggroLevels.HPMultFunc = new Function('user', 'return ' + UNH_AggroLevels.HPMult);
UNH_AggroLevels.MPMult = String(UNH_AggroLevels.parameters['MPMult'] || '0');
UNH_AggroLevels.MPMultFunc = new Function('user', 'return ' + UNH_AggroLevels.MPMult);
UNH_AggroLevels.isTaunt = !!UNH_AggroLevels.parameters['isTaunt'];
UNH_AggroLevels.isVoke = !!UNH_AggroLevels.parameters['isVoke'];
UNH_AggroLevels.autoCalc = !!UNH_AggroLevels.parameters['autoCalc'];

UNH_AggroLevels.FilterFunctions = {Actor:{}, Class:{}, Skill:{}, Item:{}, Weapon:{}, Armor:{}, State:{}, Enemy:{}};

UNH_AggroLevels.AggroFunctions = {Actor:{}, Class:{}, Skill:{}, Item:{}, Weapon:{}, Armor:{}, State:{}, Enemy:{}};

UNH_AggroLevels.ObeyFunctions = {Skill:{}, Item:{}};

UNH_AggroLevels.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_AggroLevels.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_AggroLevels._isLoaded) {
    DataManager.unhProcessAggroGainNotetags($dataSkills);
    DataManager.unhProcessAggroGainNotetags($dataItems);
    DataManager.unhProcessAggroAlterNotetags($dataActors);
    DataManager.unhProcessAggroAlterNotetags($dataClasses);
    DataManager.unhProcessAggroAlterNotetags($dataWeapons);
    DataManager.unhProcessAggroAlterNotetags($dataArmors);
    DataManager.unhProcessAggroAlterNotetags($dataStates);
    DataManager.unhProcessAggroAlterNotetags($dataEnemies);
    DataManager.unhProcessAggroFilterNotetags($dataSkills);
    DataManager.unhProcessAggroFilterNotetags($dataItems);
    DataManager.unhProcessAggroHideNotetags($dataActors);
    DataManager.unhProcessAggroHideNotetags($dataClasses);
    DataManager.unhProcessAggroHideNotetags($dataWeapons);
    DataManager.unhProcessAggroHideNotetags($dataArmors);
    DataManager.unhProcessAggroHideNotetags($dataStates);
    DataManager.unhProcessAggroHideNotetags($dataEnemies);
    DataManager.unhProcessAggroObeyNotetags($dataSkills);
    DataManager.unhProcessAggroObeyNotetags($dataItems);
    UNH_AggroLevels._isLoaded = true;
  }
  return true;
};

DataManager.unhProcessAggroGainNotetags = function(group) {
  let groupKey = '';
  switch (group) {
    case $dataSkills:
      groupKey = 'Skill';
      break;
    case $dataItems:
      groupKey = 'Item';
      break;
  }
  let notedata, obj, line, noteStr, noteArr, noteLen, notePre, noteRet, codePlus, codeRate, codeFlat, codeAddUser, codeAddTarget;
  const note1 = /<(?:UNH AGGRO PLUS):[ ](.*)>/i;
  const note2 = /<(?:UNH AGGRO RATE):[ ](.*)>/i;
  const note3 = /<(?:UNH AGGRO FLAT):[ ](.*)>/i;
  const note4 = /<(?:UNH ADD USER AGGRO):[ ](.*)>/i;
  const note5 = /<(?:UNH ADD TARGET AGGRO):[ ](.*)>/i;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    UNH_AggroLevels.AggroFunctions[groupKey][obj.id] = UNH_AggroLevels.AggroFunctions[groupKey][obj.id] || {};
    notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    codePlus = 'if (!action) return false;\nconst item = action.item();\nconst user = action.subject();\n';
    codeRate = 'if (!action) return false;\nconst item = action.item();\nconst user = action.subject();\n';
    codeFlat = 'if (!action) return false;\nconst item = action.item();\nconst user = action.subject();\n';
    codeAddUser = 'if (!action) return false;\nconst item = action.item();\nconst user = action.subject();\n';
    codeAddTarget = 'if (!action) return false;\nconst item = action.item();\nconst user = action.subject();\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          codePlus += notePre + ';\n';
        }
        codePlus += 'return (' + noteRet + ');';
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroPlus = new Function('action', 'target', codePlus);
      } else {
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroPlus = function(action, target) {
          return 0;
        };
      }
      if (line.match(note2)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          codeRate += notePre + ';\n';
        }
        codeRate += 'return (' + noteRet + ');';
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroRate = new Function('action', 'target', codeRate);
      } else {
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroRate = function(action, target, value) {
          return 1;
        };
      }
      if (line.match(note3)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          codeFlat += notePre + ';\n';
        }
        codeFlat += 'return (' + noteRet + ');';
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroFlat = new Function('action', 'target', codeFlat);
      } else {
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroFlat = function(action, target) {
          return 0;
        };
      }
      if (line.match(note4)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          codeAddUser += notePre + ';\n';
        }
        codeAddUser += 'value += (' + noteRet + ');\nreturn value;';
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAddUserAggro = new Function('action', 'target', 'value', codeAddUser);
      } else {
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAddUserAggro = function(action, target, value) {
          return value;
        };
      }
      if (line.match(note5)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          codeAddTarget += notePre + ';\n';
        }
        codeAddTarget += 'value += (' + noteRet + ');\nreturn value;';
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAddTargetAggro = new Function('action', 'target', 'value', codeAddTarget);
      } else {
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAddTargetAggro = function(action, target, value) {
          return value;
        };
      }
    }
  }
};

DataManager.unhProcessAggroAlterNotetags = function(group) {
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
  let notedata, obj, line, noteStr, noteArr, noteLen, notePre, noteRet, codePlus, codeRate, codeFlat;
  const note1 = /<(?:UNH AGGRO PLUS):[ ](.*)>/i;
  const note2 = /<(?:UNH AGGRO RATE):[ ](.*)>/i;
  const note3 = /<(?:UNH AGGRO FLAT):[ ](.*)>/i;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    UNH_AggroLevels.AggroFunctions[groupKey][obj.id] = UNH_AggroLevels.AggroFunctions[groupKey][obj.id] || {};
    notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    codePlus = '';
    codeRate = '';
    codeFlat = '';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          codePlus += notePre + ';\n';
        }
        codePlus += 'return (' + noteRet + ');';
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroPlus = new Function('user', 'target', codePlus);
      } else {
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroPlus = function(user, target) {
          return 0;
        };
      }
      if (line.match(note2)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          codeRate += notePre + ';\n';
        }
        codeRate += 'return (' + noteRet + ');';
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroRate = new Function('user', 'target', codeRate);
      } else {
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroRate = function(user, target) {
          return 1;
        };
      }
      if (line.match(note3)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          codeFlat += notePre + ';\n';
        }
        codeFlat += 'return (' + noteRet + ');';
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroFlat = new Function('user', 'target', codeFlat);
      } else {
        UNH_AggroLevels.AggroFunctions[groupKey][obj.id].unhAggroFlat = function(user, target) {
          return 0;
        };
      }
    }
  }
};

DataManager.unhProcessAggroFilterNotetags = function(group) {
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
  const note = /<(?:UNH FILTER):[ ](.*)>/i;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    UNH_AggroLevels.FilterFunctions[groupKey][obj.id] = UNH_AggroLevels.FilterFunctions[groupKey][obj.id] || {};
    notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    code = 'if (!action) return false;\nconst item = action.item();\nconst user = action.subject();\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'return (' + noteRet + ');\n';
      } else {
        code += 'return false;\n';
      }
    }
    UNH_AggroLevels.FilterFunctions[groupKey][obj.id].unhFilter = new Function('action', 'target', code);
  }
};

DataManager.unhProcessAggroHideNotetags = function(group) {
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
  const note1 = /<(?:UNH HIDE)>/i;
  const note2 = /<(?:UNH HIDE):[ ](.*)>/i;
  let notedata, obj, line, noteStr, noteArr, noteLen, notePre, noteRet, code;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    UNH_AggroLevels.FilterFunctions[groupKey][obj.id] = UNH_AggroLevels.FilterFunctions[groupKey][obj.id] || {};
    notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    code = 'if (!action) return false;\nconst item = action.item();\nconst user = action.subject();\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        code += 'return true;\n';
      } else if (line.match(note2)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'return (' + noteRet + ');\n';
      } else {
        code += 'return false;\n';
      }
    }
    UNH_AggroLevels.FilterFunctions[groupKey][obj.id].unhHide = new Function('user', 'buffer', code);
  }
};

DataManager.unhProcessAggroObeyNotetags = function(group) {
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
  const note1 = /<(?:UNH OBEY AGGRO)>/i;
  const note2 = /<(?:UNH OBEY AGGRO):[ ](.*)>/i;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    UNH_AggroLevels.ObeyFunctions[groupKey][obj.id] = UNH_AggroLevels.ObeyFunctions[groupKey][obj.id] || {};
    notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    code = 'if (!action) return false;\nconst item = action.item();\nconst user = action.subject();\n';
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        code += 'return true;\n';
      } else if (line.match(note2)) {
        noteStr = String(RegExp.$1);
        noteArr = noteStr.split(';');
        noteLen = noteArr.length;
        notePre = noteArr.slice(0, -1).join(';\n');
        noteRet = noteArr[noteLen - 1];
        if (notePre.length > 0) {
          code += notePre + ';\n';
        }
        code += 'return (' + noteRet + ');\n';
      } else {
        code += 'return false;\n';
      }
    }
    UNH_AggroLevels.ObeyFunctions[groupKey][obj.id].unhAggroObey = new Function('action', code);
  }
};

UNH_AggroLevels.hasMiscFunc = (function() {
  return $plugins.some(function(plug) {
    if (!plug) return false;
    if (!plug.name) return false;
    if (!plug.status) return false;
    return plug.name === 'UNH_MiscFunc';
  });
})();

UNH_AggroLevels.isSkillTagged = function(action, target, note) {
  if (UNH_AggroLevels.hasMiscFunc) return UNH_MiscFunc.isSkillTagged(action, target, note);
  if (!action) return false;
  if (!target) return false;
  const user = action.subject();
  if (!user) return false;
  const item = action.item();
  if (!item) return false;
  if (!item.meta) return false;
  if (!item.meta[note]) return false;
  if (item.meta[note] === true) return true;
  return !!eval(item.meta[note]);
};

UNH_AggroLevels.isUserTagged = function(action, target, note) {
  if (UNH_AggroLevels.hasMiscFunc) return UNH_MiscFunc.isUserTagged(action, target, note);
  if (!action) return false;
  if (!target) return false;
  const user = action.subject();
  if (!user) return false;
  const item = action.item();
  if (!item) return false;
  return user.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    if (!obj.meta[note]) return false;
    if (obj.meta[note] === true) return true;
    return !!eval(obj.meta[note]);
  });
};

UNH_AggroLevels.isTargetTagged = function(action, target, note) {
  if (UNH_AggroLevels.hasMiscFunc) return UNH_MiscFunc.isTargetTagged(action, target, note);
  if (!action) return false;
  if (!target) return false;
  const user = action.subject();
  if (!user) return false;
  const item = action.item();
  if (!item) return false;
  return target.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    if (!obj.meta[note]) return false;
    if (obj.meta[note] === true) return true;
    return !!eval(obj.meta[note]);
  });
};

Game_Action.prototype.randomTargets = function (unit) {
  const targets = [];
  const item = this.item();
  for (let i = 0; i < this.numTargets(); i++) {
    if (UNH_AggroLevels.ObeyFunctions[item.groupKey][item.id].unhAggroObey(this)) {
      targets.push(unit.randomTarget());
    } else {
      targets.push(unit.trueRandomTarget(this));
    }
  }
  return targets;
};

Game_Unit.prototype.trueRandomTarget = function (action) {
  const aliveMembers = this.aliveMembers();
  const item = action.item();
  let isHide = false;
  const filtered = aliveMembers.filter(function(target) {
    if (!target) return false;
    if (UNH_AggroLevels.FilterFunctions[item.groupKey][item.id].unhFilter(action, target)) return false;
    isHide = target.traitObjects().some(function(object) {
      if (!object) return false;
      return UNH_AggroLevels.FilterFunctions[object.groupKey][object.id].unhFilter(action, target);
    });
    if (isHide) return false;
    return true;
  });
  if (filtered.length < aliveMembers.length) {
    return filtered[Math.randomInt(filtered.length)];
  }
  return aliveMembers[Math.randomInt(aliveMembers.length)];
};

UNH_AggroLevels.Action_itemTargetCandidates = Game_Action.prototype.itemTargetCandidates;
Game_Action.prototype.itemTargetCandidates = function() {
  const action = this;
  const origTargets = UNH_AggroLevels.Action_itemTargetCandidates.call(this);
  let isHide = false;
  return origTargets.filter(function(target) {
    if (!target) return false;
    if (UNH_AggroLevels.FilterFunctions[item.groupKey][item.id].unhFilter(action, target)) return false;
    isHide = target.traitObjects().some(function(object) {
      if (!object) return false;
      return UNH_AggroLevels.FilterFunctions[object.groupKey][object.id].unhFilter(action, target);
    });
    if (isHide) return false;
    return true;
  });
};

UNH_AggroLevels.Action_makeTargets = Game_Action.prototype.makeTargets;
Game_Action.prototype.makeTargets = function() {
  const baseTargets = UNH_AggroLevels.Action_makeTargets.call(this);
  let isHide = false;
  return baseTargets.filter(function(target) {
    if (!target) return false;
    if (UNH_AggroLevels.FilterFunctions[item.groupKey][item.id].unhFilter(action, target)) return false;
    isHide = target.traitObjects().some(function(object) {
      if (!object) return false;
      return UNH_AggroLevels.FilterFunctions[object.groupKey][object.id].unhFilter(action, target);
    });
    if (isHide) return false;
    return true;
  });
};

UNH_AggroLevels.Action_decideRandomTarget = Game_Action.prototype.decideRandomTarget;
Game_Action.prototype.decideRandomTarget = function() {
  const item = this.item();
  if (!item) {
    UNH_AggroLevels.Action_decideRandomTarget.call(this);
  } else if (UNH_AggroLevels.ObeyFunctions[item.groupKey][item.id].unhAggroObey(this)) {
    UNH_AggroLevels.Action_decideRandomTarget.call(this);
  } else if (this.isForRandom()) {
    let tgGroup;
    let target;
    if (this.isForDeadFriend()) {
      target = this.friendsUnit().randomDeadTarget(this);
    } else if (this.isForFriend()) {
      target = this.friendsUnit().randomTarget(this);
    } else {
      target = this.opponentsUnit().randomTarget(this);
    }
    if (target) {
      this._targetIndex = target.index();
    } else {
      this.clear();
    }
  } else {
    UNH_AggroLevels.Action_decideRandomTarget.call(this);
  }
};

UNH_AggroLevels.Action_randomTarget = Game_Action.prototype.randomTarget;
Game_Unit.prototype.randomTarget = function(action) {
  if (Imported.VisuMZ_3_BattleAI && AIManager.hasForcedTargets()) {
    if (AIManager.hasForcedTargets()) {
      this._applyAIForcedTargetFilters = true;
    }
  }
  const origTg = UNH_AggroLevels.Action_randomTarget.call(this);
  if (!action) return origTg;
  const aliveMembers = this.aliveMembers();
  let isHide = false;
  const filterMembers = aliveMembers.filter(function(target) {
    if (!target) return false;
    if (UNH_AggroLevels.FilterFunctions[item.groupKey][item.id].unhFilter(action, target)) return false;
    isHide = target.traitObjects().some(function(object) {
      if (!object) return false;
      return UNH_AggroLevels.FilterFunctions[object.groupKey][object.id].unhFilter(action, target);
    });
    if (isHide) return false;
    return true;
  });
  let tgGroup;
  if (filterMembers.length < aliveMembers.length) {
    tgGroup = filterMembers;
  } else {
    tgGroup = aliveMembers;
  }
  let target = null;
  if (this.isForRandom()) {
    target = tgGroup[Math.randomInt(tgGroup.length)];
  } else {
    let tgrRand = Math.random() * this.tgrSum();
    for (const member of tgGroup) {
      tgrRand -= member.tgr;
      if (tgrRand <= 0 && !target) {
        target = member;
      }
    }
  }
  if (Imported.VisuMZ_3_BattleAI) this._applyAIForcedTargetFilters = false;
  return target;
};

UNH_AggroLevels.Action_randomDeadTarget = Game_Action.prototype.randomDeadTarget;
Game_Unit.prototype.randomDeadTarget = function(action) {
  const origTg = UNH_AggroLevels.Action_randomDeadTarget.call(this);
  if (!action) return origTg;
  const deadMembers = this.deadMembers();
  let isHide = false;
  const filterMembers = members.filter(function(target) {
    if (!target) return false;
    if (UNH_AggroLevels.FilterFunctions[item.groupKey][item.id].unhFilter(action, target)) return false;
    isHide = target.traitObjects().some(function(object) {
      if (!object) return false;
      return UNH_AggroLevels.FilterFunctions[object.groupKey][object.id].unhFilter(action, target);
    });
    if (isHide) return false;
    return true;
  });
  const isFilter = (filterMembers.length < deadMembers.length);
  const isAnyone = (members.length > 0);
  if (!isFilter && !isAnyone) return origTg;
  let members;
  if (isFilter) {
    members = filterMembers;
  } else {
    members = deadMembers;
  }
  if (isAnyone) {
    return members[Math.randomInt(members.length)];
  } else {
    return null;
  }
};

if (!!UNH_AggroLevels.isTaunt) {
  UNH_AggroLevels.BattlerManager_startAction_taunt = BattleManager.startAction;
  BattleManager.startAction = function() {
    const subject = this._subject;
    const action = subject.currentAction();
    const foes = action.opponentsUnit().aliveMembers();
    UNH_AggroLevels.BattlerManager_startAction_taunt.call(this);
    if (action.isForOpponent() && action.needsSelection()) {
      const tauntTargets = [];
      for (const member of foes) {
        const tauntStates = JsonEx.makeDeepCopy(member.states()).filter(function() {
          if (!state.meta) return false;
          if (!state.meta['unhTaunt']) return false;
          if (state.meta['unhTaunt'] === true) return true;
          return !!eval(state.meta['unhTaunt']);
        });
        if (tauntStates.length > 0) {
          tauntTargets.push(member.index());
        }
      }
      if (tauntTargets.length > 0) {
        action.setTarget(tauntTargets[Math.randomInt(tauntTargets.length)]);
      }
    }
  };
}

if (!!UNH_AggroLevels.isVoke) {
  if (!Imported.VisuMZ_1_SkillsStatesCore) {
    UNH_AggroLevels.Battler_onBattleEnd = Game_Battler.prototype.onBattleEnd;
    Game_Battler.prototype.onBattleEnd = function () {
      UNH_AggroLevels.Battler_onBattleEnd.call(this);
      this.clearAllStateOrigins();
    };

    UNH_AggroLevels.Action_itemEffectAddAttackState = Game_Action.prototype.itemEffectAddAttackState;
    Game_Action.prototype.itemEffectAddAttackState = function(target, effect) {
      for (const stateId of this.subject().attackStates()) {
        target.setStateOrigin(stateId, this.subject());
      }
      UNH_AggroLevels.Action_itemEffectAddAttackState.call(this, target, effect);
    };

    UNH_AggroLevels.Action_itemEffectAddNormalState = Game_Action.prototype.itemEffectAddNormalState;
    Game_Action.prototype.itemEffectAddNormalState = function(target, effect) {
      target.setStateOrigin(effect.dataId, this.subject());
      UNH_AggroLevels.Action_itemEffectAddNormalState.call(this, target, effect);
    };

    Game_BattlerBase.prototype.getStateOrigin = function (stateId) {
      this._stateOrigin = this._stateOrigin || {};
      this._stateOrigin[stateId] = this._stateOrigin[stateId] || this;
      return this._stateOrigin[stateId];
    };

    Game_BattlerBase.prototype.setStateOrigin = function (stateId, origin) {
      this._stateOrigin = this._stateOrigin || {};
      this._stateOrigin[stateId] = !!origin ? this : origin;
    };

    Game_BattlerBase.prototype.clearStateOrigin = function (stateId) {
      this._stateOrigin = this._stateOrigin || {};
      this._stateOrigin[stateId] = undefined;
    };

    Game_BattlerBase.prototype.clearAllStateOrigins = function () {
      this._stateOrigin = {};
    };
  }

  UNH_AggroLevels.BattlerManager_startAction_voke = BattleManager.startAction;
  BattleManager.startAction = function() {
    const subject = this._subject;
    const action = subject.currentAction();
    const foes = action.opponentsUnit().aliveMembers();
    UNH_AggroLevels.BattlerManager_startAction_voke.call(this);
    if (action.isForOpponent() && action.needsSelection()) {
      const vokeOrigins = [];
      const vokeStates = JsonEx.makeDeepCopy(subject.states()).filter(function(state) {
        if (!state.meta) return false;
        if (!state.meta['unhProvoke']) return false;
        if (state.meta['unhProvoke'] === true) return true;
        return !!eval(state.meta['unhProvoke']);
      });
      for (const state of vokeStates) {
        const origin = subject.getStateOrigin(state.id);
        if (origin.isActor() === subject.isActor()) continue;
        vokeOrigins.push(origin.index());
      }
      if (vokeOrigins.length > 0) {
        action.setTarget(vokeOrigins[Math.randomInt(vokeOrigins.length)]);
      }
    }
  };
}

Game_BattlerBase.prototype.unhDefaultAggro = function() {
  return UNH_AggroLevels.BaseAggroFunc(this);
};

Game_BattlerBase.prototype.unhDamageMult = function(value) {
  if (value < 0) {
    return UNH_AggroLevels.HealingAggroFunc(this);
  }
  if (value > 0) {
    return UNH_AggroLevels.HurtingAggroFunc(this);
  }
  return 1;
};

Game_BattlerBase.prototype.unhInitAggro = function() {
  this._unhAggroBase = 0;
};

Game_BattlerBase.prototype.unhAggroBase = function() {
  if (this._unhAggroBase === undefined) this.unhInitAggro();
  if (this._unhAggroBase < 0) this._unhAggroBase = 0;
  return this._unhAggroBase;
};

Game_Unit.prototype.unhMaxAggro = function() {
  return this.aliveMembers().reduce(function(r, member) {
    return Math.max(r, member.unhAggroBase());
  }, 0);
};

Game_BattlerBase.prototype.unhAggroPlus = function(target) {
  const user = this;
  let aggroPlus = 0;
  for (const obj of this.traitObjects()) {
    aggroPlus += UNH_AggroLevels.AggroFunctions[obj.groupKey][obj.id].unhAggroPlus(this, target);
    //if (!obj.meta) continue;
    //if (!obj.meta.unhAggroPlus) continue;
    //aggroPlus += eval(obj.meta.unhAggroPlus);
  }
  return aggroPlus;
};

Game_Action.prototype.unhAggroPlus = function(target) {
  const user = this.subject();
  let aggroPlus = user.unhAggroPlus(target);
  const item = this.item();
  aggroPlus += UNH_AggroLevels.AggroFunctions[item.groupKey][item.id].unhAggroPlus(this, target);
  //if (!!item.meta) {
  //  if (!!item.meta.unhAggroPlus) {
  //    aggroPlus += eval(item.meta.unhAggroPlus);
  //  }
  //}
  return aggroPlus;
};

Game_BattlerBase.prototype.unhAggroRate = function(target) {
  const user = this;
  let aggroRate = 1;
  for (const obj of this.traitObjects()) {
    aggroRate *= UNH_AggroLevels.AggroFunctions[obj.groupKey][obj.id].unhAggroRate(this, target);
    //if (!obj.meta) continue;
    //if (!obj.meta.unhAggroRate) continue;
    //aggroRate *= eval(obj.meta.unhAggroRate);
  }
  return aggroRate;
};

Game_Action.prototype.unhAggroRate = function(target) {
  const user = this.subject();
  let aggroRate = user.unhAggroRate(target);
  const item = this.item();
  aggroRate *= UNH_AggroLevels.AggroFunctions[item.groupKey][item.id].unhAggroRate(this, target);
  //if (!!item.meta) {
  //  if (!!item.meta.unhAggroRate) {
  //    aggroRate *= eval(item.meta.unhAggroRate);
  //  }
  //}
  return aggroRate;
};

Game_BattlerBase.prototype.unhAggroFlat = function(target) {
  const user = this;
  let aggroFlat = 0;
  for (const obj of this.traitObjects()) {
    aggroFlat += UNH_AggroLevels.AggroFunctions[obj.groupKey][obj.id].unhAggroFlat(this, target);
    //if (!obj.meta) continue;
    //if (!obj.meta.unhAggroFlat) continue;
    //aggroFlat += eval(obj.meta.unhAggroFlat);
  }
  return aggroFlat;
};

Game_Action.prototype.unhAggroFlat = function(target) {
  const user = this.subject();
  let aggroFlat = user.unhAggroFlat(target);
  const item = this.item();
  aggroFlat += UNH_AggroLevels.AggroFunctions[item.groupKey][item.id].unhAggroFlat(this, target);
  //if (!!item.meta) {
  //  if (!!item.meta.unhAggroFlat) {
  //    aggroFlat += eval(item.meta.unhAggroFlat);
  //  }
  //}
  return aggroFlat;
};

Game_BattlerBase.prototype.unhSetAggro = function(value) {
  if (value === undefined) value = 0;
  if (typeof value !== 'number') value = 0;
  this._unhAggroBase = Math.max(Math.round(value), 0);
};

UNH_AggroLevels.Func_AddAggro = function(user, target, value, ignoreRates) {
  if (value === undefined) value = 0;
  if (isNaN(value)) value = 0;
  if (!ignoreRates) {
    value += this.unhAggroPlus(target);
    value *= this.unhAggroRate(target);
    value += this.unhAggroFlat(target);
  }
  value = Math.round(value);
  this.unhSetAggro(value + user.unhAggroBase());
};

Game_BattlerBase.prototype.unhAddAggro = function(target, value, ignoreRates) {
  UNH_AggroLevels.Func_AddAggro.call(this, this, target, value, ignoreRates);
};

Game_Action.prototype.unhAddAggro = function(target, value, ignoreRates) {
  UNH_AggroLevels.Func_AddAggro.call(this, this.subject(), target, value, ignoreRates);
};

Game_BattlerBase.prototype.unhHpMult = function() {
  return UNH_AggroLevels.HPMultFunc(this);
};

Game_BattlerBase.prototype.unhMpMult = function() {
  return UNH_AggroLevels.MPMultFunc(this);
};

Game_BattlerBase.prototype.unhAggroMult = function() {
  if (this._unhAggroBase === undefined) this.unhInitAggro();
  return ((this.unhDefaultAggro() + this.unhAggroBase()) / (this.unhDefaultAggro()));
};

UNH_AggroLevels.Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function(advantageous) {
  UNH_AggroLevels.Battler_onBattleStart.call(this, advantageous);
  this.unhInitAggro();
};

UNH_AggroLevels.Battler_onBattleEnd = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleEnd = function() {
  UNH_AggroLevels.Battler_onBattleEnd.call(this);
  this.unhInitAggro();
};

UNH_AggroLevels.Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  UNH_AggroLevels.Action_apply.call(this);
  user.unhAddAggro(target, UNH_AggroLevels.AggroFunctions[item.groupKey][item.id].unhAddUserAggro(this, target, 0), false);
  target.unhAddAggro(target, UNH_AggroLevels.AggroFunctions[item.groupKey][item.id].unhAddTargetAggro(this, target, 0), false);
  //if (!!item.meta) {
  //  if (!!item.meta.unhAddUserAggro) {
  //    user.unhAddAggro(target, eval(item.meta.unhAddUserAggro), false);
  //  }
  //  if (!!item.meta.unhAddTargetAggro) {
  //    target.unhAddAggro(target, eval(item.meta.unhAddTargetAggro), false);
  //  }
  //}
};

UNH_AggroLevels.Action_executeHpDamage = Game_Action.prototype.executeHpDamage;
Game_Action.prototype.executeHpDamage = function(target, value) {
  let aggro = value;
  aggro *= this.subject().unhHpMult();
  aggro *= this.subject().unhDamageMult(aggro);
  if (this.isDrain()) aggro *= 2;
  this.unhAddAggro(target, Math.abs(aggro));
  UNH_AggroLevels.Action_executeHpDamage.call(this, target, value);
};

UNH_AggroLevels.Action_executeMpDamage = Game_Action.prototype.executeMpDamage;
Game_Action.prototype.executeMpDamage = function(target, value) {
  let aggro = value;
  aggro *= this.subject().unhMpMult();
  aggro *= this.subject().unhDamageMult(aggro);
  if (this.isDrain()) aggro *= 2;
  this.unhAddAggro(target, Math.abs(aggro));
  UNH_AggroLevels.Action_executeMpDamage.call(this, target, value);
};

UNH_AggroLevels.Action_itemEffectRecoverHp = Game_Action.prototype.itemEffectRecoverHp;
Game_Action.prototype.itemEffectRecoverHp = function(target, effect) {
  let aggro = (target.mhp * effect.value1 + effect.value2) * target.rec;
  if (!!UNH_RecoveryElements) {
    if (UNH_RecoveryElements.RecHpEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecHpEle);
    if (this.isItem()) {
      aggro *= this.subject().pha;
      if (UNH_RecoveryElements.RecItEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecItEle);
    } else {
      if (UNH_RecoveryElements.RecSkEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecSkEle);
    }
  } else {
    if (this.isItem()) {
      aggro *= this.subject().pha;
    }
  }
  aggro = Math.floor(aggro);
  aggro *= this.subject().unhHpMult();
  aggro *= this.subject().unhDamageMult(-aggro);
  this.unhAddAggro(target, Math.abs(aggro));
  UNH_AggroLevels.Action_itemEffectRecoverHp.call(this, target, effect);
};

UNH_AggroLevels.Action_itemEffectRecoverMp = Game_Action.prototype.itemEffectRecoverMp;
Game_Action.prototype.itemEffectRecoverMp = function(target, effect) {
  let aggro = (target.mmp * effect.value1 + effect.value2) * target.rec;
  if (!!UNH_RecoveryElements) {
    if (UNH_RecoveryElements.RecMpEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecMpEle);
    if (this.isItem()) {
      aggro *= this.subject().pha;
      if (UNH_RecoveryElements.RecItEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecItEle);
    } else {
      if (UNH_RecoveryElements.RecSkEle !== 0) aggro *= target.elementRate(UNH_RecoveryElements.RecSkEle);
    }
  } else {
    if (this.isItem()) {
      aggro *= this.subject().pha;
    }
  }
  aggro = Math.floor(aggro);
  aggro *= this.subject().unhHpMult();
  aggro *= this.subject().unhDamageMult(-aggro);
  this.unhAddAggro(target, Math.abs(aggro));
  UNH_AggroLevels.Action_itemEffectRecoverMp.call(this, target, effect);
};

if (!!UNH_AggroLevels.autoCalc) {
UNH_AggroLevels.BattlerBase_sparam = Game_BattlerBase.prototype.sparam;
  Game_BattlerBase.prototype.sparam = function(sparamId) {
    let baseVal = UNH_AggroLevels.BattlerBase_sparam.call(this, sparamId);
    if (sparamId === 0) return baseVal * this.unhAggroMult();
    return baseVal;
  };
}
//=============================================================================
// Unhinged Development - Stance Break
// UNH_StanceBreak.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [StanceBreak]
 * @author Unhinged Developer
 *
 * @param StanceBreakState
 * @text Stance Break State
 * @desc The state to be added when Stance HP is dropped to 0
 * Must be set in order for plugin to function
 * @type state
 * @default 0
 *
 * @param StanceHpBase
 * @text Stance HP Baseline
 * @desc The calculation for a battler's base Stance HP
 * @type note
 * @default "const user = arguments[0];\n\nreturn user.def;"
 *
 * @param StanceDmgBase
 * @text Stance Damage Baseline
 * @desc The calculation for an action's base Stance Damage
 * @type note
 * @default "const action = arguments[0];\nconst user = arguments[1]\nconst target = arguments[2];\n\nreturn 0;"
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Stance HP Plus: X>
 * <Stance HP Rate: X>
 * <Stance HP Flat: X>
 * - Use for Actors/Classes/Weapons/Armors/Enemies/States
 * - Manipulate the battler's Stance HP (X is a JS Eval)
 *   - Total_Stance_HP = (((Base + Plus) * Rate) + Flat)
 * Variables:
 *   - user: the battler gaining the benefits
 * 
 * <Stance Damage Plus: X>
 * <Stance Damage Rate: X>
 * <Stance Damage Flat: X>
 * - Use for Skills/Items/Weapons/Armors/States
 * - Manipulate the action's Stance Damage (X is a JS Eval)
 *   - Total_Stance_DMG = (((Base + Plus) * Rate) + Flat)
 * Variables:
 *   - action: the action being taken
 *   - user: the battler taking the action
 *   - target: the target of the action
 * 
 * <Stance Resist: X>
 * - Use for Actors/Classes/Weapons/Armors/Enemies/States
 * - Reduce incoming Stance Damage by X (JS Eval)
 * Variables:
 *   - value: the stance damage before modifiers
 *   - action: the action being taken
 *   - user: the battler taking the action
 *   - target: the target of the action
 * 
 * <Stance Restore>
 * - Use for Skills/Items
 * - Flag a skill as restoring its target's Stance HP
 * 
 * <Stance Retain>
 * - Use for Actors/Classes/Weapons/Armors/Enemies/States
 * - Flag a battler as not restoring its Stance as normal
 */
//=============================================================================

const UNH_VS_StanceBreak = {};
UNH_VS_StanceBreak.pluginName = 'UNH_VS_StanceBreak';
UNH_VS_StanceBreak.parameters = PluginManager.parameters(UNH_VS_StanceBreak.pluginName);
UNH_VS_StanceBreak.StanceBreakState = Number(UNH_VS_StanceBreak.parameters['StanceBreakState'] || "0");
UNH_VS_StanceBreak.StanceHpBase = new Function(UNH_VS_StanceBreak.parameters['StanceHpBase'] || "");
UNH_VS_StanceBreak.StanceDmgBase = new Function(UNH_VS_StanceBreak.parameters['StanceDmgBase'] || "");

UNH_VS_StanceBreak.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_VS_StanceBreak.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_VS_StanceBreak._loaded_UNH_VS_StanceBreak) {
    this.processStanceHpNotetags($dataActors);
    this.processStanceHpNotetags($dataClasses);
    this.processStanceHpNotetags($dataEnemies);
    this.processStanceHpNotetags($dataWeapons);
    this.processStanceHpNotetags($dataArmors);
    this.processStanceHpNotetags($dataStates);
    this.processStanceDmgNotetags($dataSkills);
    this.processStanceDmgNotetags($dataItems);
    this.processStanceDmgNotetags($dataWeapons);
    this.processStanceDmgNotetags($dataArmors);
    this.processStanceDmgNotetags($dataStates);
    this.processStanceRestoreNotetags($dataSkills);
    this.processStanceRestoreNotetags($dataItems);
    UNH_VS_StanceBreak._loaded_UNH_VS_StanceBreak = true;
  }
  return true;
};

DataManager.processStanceHpNotetags = function(group) {
  const note1 = /<(?:STANCE HP PLUS):[ ](.*)>/i;
  const note2 = /<(?:STANCE HP RATE):[ ](.*)>/i;
  const note3 = /<(?:STANCE HP FLAT):[ ](.*)>/i;
  const note4 = /<(?:STANCE RESIST):[ ](.*)>/i;
  const note5 = /<(?:STANCE RETAIN)>/i;
  let obj, notedata, line;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    notedata = obj.note.split(/[\r\n]+/);
    obj.poisePlus = "";
    obj.poiseRate = "";
    obj.poiseFlat = "";
    obj.poiseDmgDefn = "";
    obj.poiseDmgRetn = false;
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        obj.poisePlus = String(RegExp.$1);
      }
      if (line.match(note2)) {
        obj.poiseRate = String(RegExp.$1);
      }
      if (line.match(note3)) {
        obj.poiseFlat = String(RegExp.$1);
      }
      if (line.match(note4)) {
        obj.poiseDmgDefn = String(RegExp.$1);
      }
      if (line.match(note5)) {
        obj.poiseDmgRetn = true;
      }
    }
  }
};

DataManager.processStanceDmgNotetags = function(group) {
  const note1 = /<(?:STANCE DAMAGE PLUS):[ ](.*)>/i;
  const note2 = /<(?:STANCE DAMAGE RATE):[ ](.*)>/i;
  const note3 = /<(?:STANCE DAMAGE FLAT):[ ](.*)>/i;
  let obj, notedata, line;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    obj.poiseDmgPlus = "";
    obj.poiseDmgRate = "";
    obj.poiseDmgFlat = "";
    notedata = obj.note.split(/[\r\n]+/);
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        obj.poiseDmgPlus = String(RegExp.$1);
      }
      if (line.match(note2)) {
        obj.poiseDmgRate = String(RegExp.$1);
      }
      if (line.match(note3)) {
        obj.poiseDmgFlat = String(RegExp.$1);
      }
    }
  }
};

DataManager.processStanceRestoreNotetags = function(group) {
  const note = /<(?:STANCE RESTORE)>/i;
  let obj, notedata, line;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    notedata = obj.note.split(/[\r\n]+/);
    obj.poiseRestore = false;
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note)) {
        obj.poiseRestore = true;
      }
    }
  }
};

Game_BattlerBase.prototype.getPoise = function() {
  if (this._poise === undefined) this._poise = this.maxPoise();
  if (typeof this._poise !== 'number') this._poise = this.maxPoise();
  if (isNaN(this._poise)) this._poise = this.maxPoise();
  if (this._poise > this.maxPoise()) this._poise = this.maxPoise();
  return this._poise;
};

Game_BattlerBase.prototype.setPoise = function(value) {
  if (this._poise === undefined) this._poise = this.maxPoise();
  if (typeof this._poise !== 'number') this._poise = this.maxPoise();
  if (isNaN(this._poise)) this._poise = this.maxPoise();
  if (this._poise > this.maxPoise()) this._poise = this.maxPoise();
  if (value === undefined) return;
  if (typeof value !== 'number') return;
  if (isNaN(value)) return;
  this._poise = value;
  if (this._poise <= 0) this.breakPoise();
};

Game_BattlerBase.prototype.breakPoise = function() {
  const breakState = UNH_VS_StanceBreak.StanceBreakState;
  this.setPoise(this.maxPoise());
  if (!!$dataStates[breakState]) {
    this.addState(breakState);
  }
};

Game_BattlerBase.prototype.addPoise = function(value) {
  this.setPoise(this.getPoise() + value);
};

Game_BattlerBase.prototype.retainPoise = function() {
  const user = this;
  return this.traitObjects().some(function(obj) {
    if (!obj) return false;
    return !!obj.poiseDmgRetn;
  });
};

Game_BattlerBase.prototype.maxPoise = function() {
  const user = this;
  const base = UNH_VS_StanceBreak.StanceHpBase(this);
  const plus = this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poisePlus) return r;
    return r + eval(obj.poisePlus);
  }, 0);
  const rate = this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseRate) return r;
    return r * eval(obj.poiseRate);
  }, 1);
  const flat = this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseFlat) return r;
    return r + eval(obj.poiseFlat);
  }, 0);
  return (((base + plus) * rate) + flat);
};

Game_Action.prototype.makePoiseDamage = function(target) {
  const item = this.item();
  const user = this.subject();
  const base = UNH_VS_StanceBreak.StanceDmgBase(this, this.subject(), target);
  const plus = item.poiseDmgPlus + this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poisePlus) return r;
    return r + eval(obj.poiseDmgPlus);
  }, 0);
  const rate = item.poiseDmgRate + this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseRate) return r;
    return r * eval(obj.poiseDmgRate);
  }, 1);
  const flat = item.poiseDmgFlat + this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseFlat) return r;
    return r + eval(obj.poiseDmgFlat);
  }, 0);
  let value = (((base + plus) * rate) + flat);
  const defn = target.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseDmgDefn) return r;
    return r + eval(obj.poiseDmgDefn);
  }, 0);
  return Math.round(10000 * (value - defn)) / 10000;
};

UNH_VS_StanceBreak.Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  UNH_VS_StanceBreak.Action_apply.call(this);
  if (target.result().isHit()) {
    const poiseDamage = this.makePoiseDamage(target);
    target.addPoise(-poiseDamage);
  }
  if (this.item().poiseRestore) {
    target.setPoise(target.maxPoise())
  }
};

UNH_VS_StanceBreak.BattleManager_startBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
  UNH_VS_StanceBreak.BattleManager_startBattle.call(this);
  for (const member of this.allBattleMembers()) {
    member.setPoise(member.maxPoise());
  }
};

if (this.isTpb()) {
  UNH_VS_StanceBreak.BattleManager_endAction = BattleManager.endAction;
  BattleManager.endAction = function() {
    UNH_VS_StanceBreak.BattleManager_endAction.call(this);
    const subject = this._subject;
    if (!subject.retainPoise()) subject.setPoise(subject.maxPoise());
  };
} else {
  UNH_VS_StanceBreak.BattleManager_endTurn = BattleManager.endTurn;
  BattleManager.endTurn = function() {
    UNH_VS_StanceBreak.BattleManager_endTurn.call(this);
    for (const member of this.allBattleMembers()) {
      if (member.retainPoise()) continue;
      member.setPoise(member.maxPoise());
    }
  };
}
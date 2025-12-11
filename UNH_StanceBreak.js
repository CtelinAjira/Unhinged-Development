//=============================================================================
// Unhinged Development - Stance Break
// UNH_StanceBreak.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.01] [Unhinged] [StanceBreak]
 * @author Unhinged Developer
 *
 * @param StanceBreakState
 * @text Stance Break State
 * @desc The default state to be added when Stance HP is dropped to 0
 * @type state
 * @default 0
 *
 * @param StanceHpBase
 * @text Stance HP Baseline
 * @desc The calculation for a battler's base Stance HP
 * Variables: user
 * @type note
 * @default "return user.def;"
 *
 * @param StanceDmgBase
 * @text Stance Damage Baseline
 * @desc The calculation for an action's base Stance Damage
 * Variables: action, user, target
 * @type note
 * @default "return 0;"
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
 * 
 * <Stance Pierce>
 * - Use for Skills/Items
 * - Flag an action as bypassing resistance to the Stance Break state
 * 
 * <Stance Break State: X>
 * - Use for Skills/Items
 * - Set a state ID (Number) for Stance Breaks specific to this action
 */
//=============================================================================

const UNH_StanceBreak = {};
UNH_StanceBreak.pluginName = 'UNH_StanceBreak';
UNH_StanceBreak.parameters = PluginManager.parameters(UNH_StanceBreak.pluginName);
UNH_StanceBreak.StanceBreakState = Number(UNH_StanceBreak.parameters['StanceBreakState'] || "0");
UNH_StanceBreak.StanceHpCode = String(UNH_StanceBreak.parameters['StanceHpBase'] || '');
UNH_StanceBreak.StanceDmgCode = String(UNH_StanceBreak.parameters['StanceDmgBase'] || '');
if (!UNH_StanceBreak.StanceHpCode) {
  UNH_StanceBreak.StanceHpBase = function(user) {
    return user.def;
  };
} else {
  UNH_StanceBreak.StanceHpBase = new Function('user', UNH_StanceBreak.StanceHpCode);
}
if (!UNH_StanceBreak.StanceHpCode) {
  UNH_StanceBreak.StanceDmgBase = function(action, user, target) {
    return 0;
  };
} else {
  UNH_StanceBreak.StanceDmgBase = new Function('action', 'user', 'target', UNH_StanceBreak.StanceDmgCode);
}

UNH_StanceBreak.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_StanceBreak.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_StanceBreak._loaded_UNH_StanceBreak) {
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
    UNH_StanceBreak._loaded_UNH_StanceBreak = true;
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
    obj.poisePlus = "0";
    obj.poiseRate = "1";
    obj.poiseFlat = "0";
    obj.poiseDmgDefn = "0";
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
  const note4 = /<(?:STANCE BREAK STATE):[ ](\d+)>/i;
  let obj, notedata, line;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    obj.poiseDmgPlus = "0";
    obj.poiseDmgRate = "1";
    obj.poiseDmgFlat = "0";
    obj.poiseBrkStateId = UNH_StanceBreak.StanceBreakState || 0;
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
      if (line.match(note4)) {
        obj.poiseBrkStateId = String(RegExp.$1);
      }
    }
  }
};

DataManager.processStanceRestoreNotetags = function(group) {
  const note1 = /<(?:STANCE RESTORE)>/i;
  const note2 = /<(?:STANCE PIERCE)>/i;
  let obj, notedata, line;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    notedata = obj.note.split(/[\r\n]+/);
    obj.poiseRestore = false;
    obj.poisePierce = false;
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(note1)) {
        obj.poiseRestore = true;
      }
      if (line.match(note2)) {
        obj.poisePierce = true;
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

Game_BattlerBase.prototype.setPoise = function(value, stateId, insured) {
  if (this._poise === undefined) this._poise = this.maxPoise();
  if (typeof this._poise !== 'number') this._poise = this.maxPoise();
  if (isNaN(this._poise)) this._poise = this.maxPoise();
  if (this._poise > this.maxPoise()) this._poise = this.maxPoise();
  if (value === undefined) return;
  if (typeof value !== 'number') return;
  if (isNaN(value)) return;
  this._poise = value;
  if (!!insured) return;
  if (this._poise <= 0) this.breakPoise(stateId);
};

Game_Action.prototype.poiseBreakStateId = function() {
  return this.item().poiseBrkStateId;
};

Game_BattlerBase.prototype.breakPoise = function(breakState) {
  if (!breakState) breakState = UNH_StanceBreak.StanceBreakState;
  if (typeof breakState !== 'number') breakState = UNH_StanceBreak.StanceBreakState;
  if (isNaN(breakState)) breakState = UNH_StanceBreak.StanceBreakState;
  this.setPoise(this.maxPoise(), true);
  if (!!$dataStates[breakState]) {
    this.addState(breakState);
  }
};

Game_Action.prototype.breakPoise = function(target) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const breakState = this.poiseBreakStateId();
  target.breakPoise(breakState);
};

Game_Action.prototype.piercePoise = function() {
  const user = this.subject();
  if (!this.item().poisePierce) return false;
  return !!eval(this.item().poisePierce);
};

Game_BattlerBase.prototype.addPoise = function(value, stateId, insured) {
  if (value === undefined) return;
  if (typeof value !== 'number') return;
  if (isNaN(value)) return;
  if (value === 0) return;
  const deltaPoise = this.getPoise() + value;
  this.setPoise(deltaPoise, stateId, !!insured);
};

Game_BattlerBase.prototype.retainPoise = function() {
  const user = this;
  return this.traitObjects().some(function(obj) {
    if (!obj) return false;
    return !!obj.poiseDmgRetn;
  });
};

Game_BattlerBase.prototype.poiseHpPlus = function(total) {
  total = total || 0;
  const user = this;
  const states = this.states();
  const objects = this.traitObjects().filter(function(obj) {
    if (!obj) return false;
    return states.includes(obj);
  });
  const reduce = function(r, obj) {
    if (!obj) return r;
    if (!obj.poisePlus) return r;
    return r + eval(obj.poisePlus);
  };
  total = objects.reduce(reduce, total);
  total = states.reduce(reduce, total);
  return total;
};

Game_BattlerBase.prototype.poiseHpRate = function(total) {
  total = total || 0;
  const user = this;
  const states = this.states();
  const objects = this.traitObjects().filter(function(obj) {
    if (!obj) return false;
    return states.includes(obj);
  });
  const reduce = function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseRate) return r;
    return r + eval(obj.poiseRate);
  };
  total = objects.reduce(reduce, total);
  total = states.reduce(reduce, total);
  return total;
};

Game_BattlerBase.prototype.poiseHpFlat = function(total) {
  total = total || 0;
  const user = this;
  const states = this.states();
  const objects = this.traitObjects().filter(function(obj) {
    if (!obj) return false;
    return states.includes(obj);
  });
  const reduce = function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseFlat) return r;
    return r + eval(obj.poiseFlat);
  };
  total = objects.reduce(reduce, total);
  total = states.reduce(reduce, total);
  return total;
};

Game_BattlerBase.prototype.maxPoise = function() {
  const user = this;
  let total = UNH_StanceBreak.StanceHpBase(this);
  total = this.poiseHpPlus(total);
  total = this.poiseHpRate(total);
  total = this.poiseHpFlat(total);
  return total;
};

Game_Action.prototype.poiseDmgPlus = function(target, value) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const plus = Number(eval(item.poiseDmgPlus || "0")) + this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseDmgPlus) return r;
    return r + Number(eval(obj.poiseDmgPlus || "0"));
  }, 0);
  return value + plus;
};

Game_Action.prototype.poiseDmgRate = function(target, value) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const rate = Number(eval(item.poiseDmgRate || "1")) * this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseDmgRate) return r;
    return r * Number(eval(obj.poiseDmgRate || "1"));
  }, 1);
  return value * rate;
};

Game_Action.prototype.poiseDmgFlat = function(target, value) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const flat = Number(eval(item.poiseDmgFlat || "0")) + this.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseDmgFlat) return r;
    return r + Number(eval(obj.poiseDmgFlat || "0"));
  }, 0);
  return value + flat;
};

Game_Action.prototype.poiseDmgDefn = function(target, value) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const defn = target.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.poiseDmgDefn) return r;
    return r + Number(eval(obj.poiseDmgDefn || "0"));
  }, 0);
  return value - defn;
};

Game_Action.prototype.makePoiseDamage = function(target) {
  const breakState = this.poiseBreakStateId();
  let value = UNH_StanceBreak.StanceDmgBase(this, this.subject(), target);
  value = this.poiseDmgPlus(target, value);
  value = this.poiseDmgRate(target, value);
  value = this.poiseDmgFlat(target, value);
  value = this.poiseDmgDefn(target, value);
  if (value <= 0) return 0;
  if ($dataStates[breakState] && !this.piercePoise()) {
    return Math.round(value * target.stateRate(breakState));
  }
  return Math.round(value);
};

UNH_StanceBreak.Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  UNH_StanceBreak.Action_apply.call(this);
  if (target.result().isHit()) {
    const poiseDamage = this.makePoiseDamage(target);
    if (poiseDamage > 0) target.addPoise(-poiseDamage, this.poiseBreakStateId(), !poiseDamage);
  }
  if (this.item().poiseRestore) {
    target.setPoise(target.maxPoise(), this.poiseBreakStateId(), true);
  }
};

UNH_StanceBreak.BattleManager_startBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
  UNH_StanceBreak.BattleManager_startBattle.call(this);
  for (const member of this.allBattleMembers()) {
    member.setPoise(member.maxPoise(), UNH_StanceBreak.StanceBreakState || 0, true);
  }
};

if (this.isTpb()) {
  UNH_StanceBreak.BattleManager_endAction = BattleManager.onAllActionsEnd;
  BattleManager.onAllActionsEnd = function() {
    const subject = this._subject;
    const action = this._action;
    UNH_StanceBreak.BattleManager_endAction.call(this);
    if (!subject.retainPoise()) subject.setPoise(subject.maxPoise(), action.poiseBreakStateId(), true);
  };
} else {
  UNH_StanceBreak.BattleManager_endTurn = BattleManager.endTurn;
  BattleManager.endTurn = function() {
    UNH_StanceBreak.BattleManager_endTurn.call(this);
    for (const member of this.allBattleMembers()) {
      if (member.retainPoise()) continue;
      member.setPoise(member.maxPoise(), UNH_StanceBreak.StanceBreakState || 0, true);
    }
  };
}
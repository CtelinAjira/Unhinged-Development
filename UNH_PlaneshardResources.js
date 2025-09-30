//=============================================================================
// Unhinged Development - Planeshard's Skill Resources
// UNH_PlaneshardResources.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_PlaneshardResources = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [PlaneshardResources]
 * @author Unhinged Developer
 * @base UNH_MiscFunc
 * @orderAfter UNH_MiscFunc
 *
 * @param NewParams
 * @text New Resources
 * @desc New resources to track
 * @type struct<Resources>[]
 *
 * @param MaxFp
 * @text Maximum FP
 * @desc JS code to calculate maximum FP
 * @type note
 * @default "const user = arguments[0]; // Game_Battler.prototype\nconst prop = arguments[1]; // string\nconst prop2 = arguments[2]; // string\n\nreturn (100);"
 *
 * @param MaxEp
 * @text Maximum EP
 * @desc JS code to calculate maximum EP
 * @type note
 * @default "const user = arguments[0]; // Game_Battler.prototype\nconst prop = arguments[1]; // string\nconst prop2 = arguments[2]; // string\n\nreturn (100);"
 *
 * @param MaxPp
 * @text Maximum PP
 * @desc JS code to calculate maximum PP
 * @type note
 * @default "const user = arguments[0]; // Game_Battler.prototype\nconst prop = arguments[1]; // string\nconst prop2 = arguments[2]; // string\n\nreturn (100);"
 *
 * @param MaxQp
 * @text Maximum QP
 * @desc JS code to calculate maximum QP
 * @type note
 * @default "const user = arguments[0]; // Game_Battler.prototype\nconst prop = arguments[1]; // string\nconst prop2 = arguments[2]; // string\n\nreturn (100);"
 *
 * @help
 */
/*~struct~Resources:
 *
 * @param Name
 * @text Parameter Key
 * @type string
 * @desc String key of parameter
 * @default EP
 *
 * @param MaxCalcJS
 * @text JS Code (Max)
 * @type note
 * @desc Code to calculate maximum value
 * Default: 100
 * @default "const user = arguments[0]; // Game_Battler.prototype\nconst prop = arguments[1]; // string\nconst prop2 = arguments[2]; // string\n\nreturn (100);"
 *
 */
//=============================================================================

const UNH_PlaneshardResources = {};
UNH_PlaneshardResources.pluginName = 'UNH_PlaneshardResources';
UNH_PlaneshardResources.parameters = PluginManager.parameters(UNH_PlaneshardResources.pluginName);
UNH_PlaneshardResources.NewParams = JSON.parse(UNH_PlaneshardResources.parameters['NewParams'] || '{}');

UNH_PlaneshardResources.NewParamKeys = UNH_PlaneshardResources.NewParams.keys();
for (const key in UNH_PlaneshardResources.NewParams) {
  UNH_PlaneshardResources.NewParams[key] = JSON.parse(UNH_PlaneshardResources.NewParams[key] || '{}');
}

for (const param of UNH_PlaneshardResources.NewParams) {
  param.Name = param.Name.trim();
  const funcParam = param.Name.charAt(0).toUpperCase() + param.Name.slice(1).toLowerCase();
  const lowerParam = param.Name.toLowerCase();
  if (!param.MaxCalcJS) {
    UNH_PlaneshardResources['Max' + funcParam] = new Function('return 100;');
  } else {
    UNH_PlaneshardResources['Max' + funcParam] = new Function(param.MaxCalcJS);
  }
  
  Game_BattlerBase.prototype['max' + funcParam] = function() {
    try {
      if (!param.MaxCalcJS) throw new Error('No Code to Run');
      const result = UNH_PlaneshardResources['Max' + funcParam](this, 'Null' + funcParam, param.Name.toUpperCase() + ' Plus');
      if (result === undefined) throw new Error('No Return Value');
      if (typeof result !== 'number') throw new Error('Non-Numeric Value');
      if (isNaN(result)) throw new Error('Not a Number');
      return result;
    } catch (e) {
      return 100;
    }
  };

  Game_BattlerBase.prototype['get' + funcParam] = function() {
    const max = this['max' + funcParam]();
    this['_' + lowerParam] = this['_' + lowerParam] || max;
    if (this['_' + lowerParam] < 0) this['_' + lowerParam] = 0;
    if (this['_' + lowerParam] > max) this['_' + lowerParam] = max;
    return Math.min(this['_' + lowerParam], max);
  };

  Game_BattlerBase.prototype['set' + funcParam] = function() {
    this['_' + lowerParam] = Math.min(Math.max(value, 0), this['max' + funcParam]());
    this.refresh();
  };

  Game_BattlerBase.prototype['gain' + funcParam] = function() {
    let resource = this['get' + funcParam]();
    this['set' + funcParam](resource + value);
  };
  
  Object.defineProperty(Game_BattlerBase.prototype, lowerParam, {
    get: function() {
      return this['get' + funcParam]();
    },
    configurable:true
  });
  
  Object.defineProperty(Game_BattlerBase.prototype, 'm' + lowerParam, {
    get: function() {
      return this['max' + funcParam]();
    },
    configurable:true
  });
}

UNH_PlaneshardResources.BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
Game_BattlerBase.prototype.initMembers = function() {
  for (const param of UNH_PlaneshardResources.NewParams) {
    this['_' + param.Name.toLowerCase()] = 0;
  }
  UNH_PlaneshardResources.BattlerBase_initMembers.call(this);
};

UNH_PlaneshardResources.BattlerBase_recoverAll = Game_BattlerBase.prototype.recoverAll;
Game_BattlerBase.prototype.recoverAll = function() {
  UNH_PlaneshardResources.BattlerBase_recoverAll.call(this);
  for (const param of UNH_PlaneshardResources.NewParams) {
    const funcParam = param.Name.charAt(0).toUpperCase() + param.Name.slice(1).toLowerCase();
    const lowerParam = param.Name.toLowerCase();
    this['_' + lowerParam] = this['max' + funcParam]();
  }
};

Game_BattlerBase.prototype.unhSetOldStats = function() {
  this._unhOldStats = {hp:this.hp, mp:this.mp, tp:this.tp};
  for (const param of UNH_PlaneshardResources.NewParams) {
    const lowerParam = param.Name.toLowerCase();
    this._unhOldStats[lowerParam] = this[lowerParam];
  }
};

Game_BattlerBase.prototype.unhUnsetOldStats = function() {
  this._unhOldStats = undefined;
};

Game_BattlerBase.prototype.unhInitOldStats = function() {
  if (!this._unhOldStats) this.unhSetOldStats();
  if (!Array.isArray(this._unhOldStats)) this.unhSetOldStats();
};

Game_BattlerBase.prototype.unhGetOldStats = function(property) {
  this.unhInitOldStats();
  if (property === undefined) return this._unhOldStats;
  if (property === null) return this._unhOldStats;
  if (typeof property === 'boolean') return this._unhOldStats;
  if (!this._unhOldStats.hasOwnProperty(property)) return this._unhOldStats;
  return this._unhOldStats[property];
};

UNH_PlaneshardResources.Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  this.subject().unhSetOldStats();
  target.unhSetOldStats();
  UNH_PlaneshardResources.Action_apply.call(this);
};

UNH_PlaneshardResources.BattleManager_endAction = BattleManager.endAction;
BattleManager.endAction = function() {
  this._subject.unhUnsetOldStats();
  UNH_PlaneshardResources.BattleManager_endAction.call(this);
};
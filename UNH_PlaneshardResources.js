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
//=============================================================================

const UNH_PlaneshardResources = {};
UNH_PlaneshardResources.pluginName = 'UNH_PlaneshardResources';
UNH_PlaneshardResources.parameters = PluginManager.parameters(UNH_PlaneshardResources.pluginName);
UNH_PlaneshardResources.MaxFp = new Function(String(UNH_PlaneshardResources.parameters['MaxFp'] || "return (0);"));
UNH_PlaneshardResources.MaxEp = new Function(String(UNH_PlaneshardResources.parameters['MaxEp'] || "return (0);"));
UNH_PlaneshardResources.MaxPp = new Function(String(UNH_PlaneshardResources.parameters['MaxPp'] || "return (0);"));
UNH_PlaneshardResources.MaxQp = new Function(String(UNH_PlaneshardResources.parameters['MaxQp'] || "return (0);"));

Object.defineProperties(Game_BattlerBase.prototype, {
  fp: {
    get: function() {
      return this.getFp();
    },
    configurable: true
  },
  mfp: {
    get: function() {
      return this.maxFp();
    },
    configurable: true
  },
  ep: {
    get: function() {
      return this.getEp();
    },
    configurable: true
  },
  mep: {
    get: function() {
      return this.maxEp();
    },
    configurable: true
  },
  pp: {
    get: function() {
      return this.getPp();
    },
    configurable: true
  },
  mpp: {
    get: function() {
      return this.maxPp();
    },
    configurable: true
  },
  qp: {
    get: function() {
      return this.getQp();
    },
    configurable: true
  },
  mqp: {
    get: function() {
      return this.maxQp();
    },
    configurable: true
  }
});

Game_BattlerBase.prototype.maxFp = function() {
  try {
    const result = UNH_PlaneshardResources.MaxFp(this, 'NullFp', 'FP Plus');
    if (typeof result !== 'number') throw new Error("non-numeric result");
    if (isNaN(result)) throw new Error("non-numeric result");
	return result;
  } catch (e) {
    return 100;
  }
};

Game_BattlerBase.prototype.maxEp = function() {
  try {
    const result = UNH_PlaneshardResources.MaxEp(this, 'NullEp', 'EP Plus');
    if (typeof result !== 'number') throw new Error("non-numeric result");
    if (isNaN(result)) throw new Error("non-numeric result");
	return result;
  } catch (e) {
    return 100;
  }
};

Game_BattlerBase.prototype.maxPp = function() {
  try {
    const result = UNH_PlaneshardResources.MaxPp(this, 'NullPp', 'PP Plus');
    if (typeof result !== 'number') throw new Error("non-numeric result");
    if (isNaN(result)) throw new Error("non-numeric result");
	return result;
  } catch (e) {
    return 100;
  }
};

Game_BattlerBase.prototype.maxQp = function() {
  try {
    const result = UNH_PlaneshardResources.MaxQp(this, 'NullQp', 'QP Plus');
    if (typeof result !== 'number') throw new Error("non-numeric result");
    if (isNaN(result)) throw new Error("non-numeric result");
	return result;
  } catch (e) {
    return 100;
  }
};

Game_BattlerBase.prototype.getFp = function() {
  const max = this.maxFp();
  this._fp = this._fp || max;
  if (this._fp < 0) this._fp = 0;
  if (this._fp > max) this._fp = max;
  return Math.min(this._fp, max);
};

Game_BattlerBase.prototype.getEp = function() {
  const max = this.maxEp();
  this._ep = this._ep || max;
  if (this._ep < 0) this._ep = 0;
  if (this._ep > max) this._ep = max;
  return Math.min(this._ep, max);
};

Game_BattlerBase.prototype.getPp = function() {
  const max = this.maxPp();
  this._pp = this._pp || max;
  if (this._pp < 0) this._pp = 0;
  if (this._pp > max) this._pp = max;
  return Math.min(this._pp, max);
};

Game_BattlerBase.prototype.getQp = function() {
  const max = this.maxQp();
  this._qp = this._qp || max;
  if (this._qp < 0) this._qp = 0;
  if (this._qp > max) this._qp = max;
  return Math.min(this._qp, max);
};

Game_BattlerBase.prototype.setFp = function(value) {
  this._fp = Math.min(Math.max(value, 0), this.maxFp());
  this.refresh();
};

Game_BattlerBase.prototype.setEp = function(value) {
  this._ep = Math.min(Math.max(value, 0), this.maxEp());
  this.refresh();
};

Game_BattlerBase.prototype.setPp = function(value) {
  this._pp = Math.min(Math.max(value, 0), this.maxPp());
  this.refresh();
};

Game_BattlerBase.prototype.setQp = function(value) {
  this._qp = Math.min(Math.max(value, 0), this.maxQp());
  this.refresh();
};

Game_BattlerBase.prototype.gainFp = function(value) {
  let resource = this.getFp();
  this.setFp(resource + value);
};

Game_BattlerBase.prototype.gainEp = function(value) {
  let resource = this.getEp();
  this.setEp(resource + value);
};

Game_BattlerBase.prototype.gainPp = function(value) {
  let resource = this.getPp();
  this.setPp(resource + value);
};

Game_BattlerBase.prototype.gainQp = function(value) {
  let resource = this.getQp();
  this.setQp(resource + value);
};

Game_BattlerBase.prototype.unhSetOldStats = function() {
  this._unhOldStats = {hp:this.hp, mp:this.mp, fp:this.fp, ep:this.ep, pp:this.pp, qp:this.qp};
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

UNH_PlaneshardResources.BattlerBase_recoverAll = Game_BattlerBase.prototype.recoverAll;
Game_BattlerBase.prototype.recoverAll = function() {
  UNH_PlaneshardResources.BattlerBase_recoverAll.call(this);
  this._fp = this.maxFp();
  this._ep = this.maxEp();
  this._pp = this.maxPp();
  this._qp = this.maxQp();
};
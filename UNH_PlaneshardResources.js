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
 * @help
 */
//=============================================================================

const UNH_PlaneshardResources = {};
UNH_PlaneshardResources.pluginName = 'UNH_PlaneshardResources';
const hasSkillLevels = $plugins.some(function (entry) {
  return ((!!entry.status) && (entry.name = 'UNH_SkillLevels'));
});

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
    const user = this;
    const object = user.object();
    const curClass = user.currentClass();
    const states = user.states();
    const prop = 'NullFp';
    if (!!object.meta) {
      if (!!object.meta[prop]) {
        return 0;
      }
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (!!curClass.meta[prop]) {
          return 0;
        }
      }
    }
    for (const state of states) {
      if (!state) continue;
      if (!state.meta) continue;
      if (!!state.meta[prop]) return 0;
    }
    const stat = user.paramBase(4);
    if (!hasSkillLevels) return stat * 2;
    const skillId = 7;
    const skillLv = user.unhSkillLevel(skillId);
    const skillMax = user.unhMaxSkillLevel(skillId);
    const skillRate = 1 + (skillLv * 4 / skillMax);
    return Math.round(stat * 2 * skillRate);
  } catch (e) {
    return 0;
  }
};

Game_BattlerBase.prototype.maxEp = function() {
  try {
    const user = this;
    const object = user.object();
    const curClass = user.currentClass();
    const states = user.states();
    const prop = 'NullEp';
    if (!!object.meta) {
      if (!!object.meta[prop]) {
        return 0;
      }
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (!!curClass.meta[prop]) {
          return 0;
        }
      }
    }
    for (const state of states) {
      if (!state) continue;
      if (!state.meta) continue;
      if (!!state.meta[prop]) return 0;
    }
    const stat = user.paramBase(5);
    if (!hasSkillLevels) return stat * 2;
    const skillId = 8;
    const skillLv = user.unhSkillLevel(skillId);
    const skillMax = user.unhMaxSkillLevel(skillId);
    const skillRate = 1 + (skillLv * 4 / skillMax);
    return Math.round(stat * 2 * skillRate);
  } catch (e) {
    return 0;
  }
};

Game_BattlerBase.prototype.maxPp = function() {
  try {
    const user = this;
    const object = user.object();
    const curClass = user.currentClass();
    const states = user.states();
    const prop = 'NullPp';
    if (!!object.meta) {
      if (!!object.meta[prop]) {
        return 0;
      }
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (!!curClass.meta[prop]) {
          return 0;
        }
      }
    }
    for (const state of states) {
      if (!state) continue;
      if (!state.meta) continue;
      if (!!state.meta[prop]) return 0;
    }
    const stat = user.paramBase(7);
    if (!hasSkillLevels) return stat * 2;
    const skillId = 9;
    const skillLv = user.unhSkillLevel(skillId);
    const skillMax = user.unhMaxSkillLevel(skillId);
    const skillRate = 1 + (skillLv * 4 / skillMax);
    return Math.round(stat * 2 * skillRate);
  } catch (e) {
    return 0;
  }
};

Game_BattlerBase.prototype.maxQp = function() {
  try {
    const user = this;
    const object = user.object();
    const curClass = user.currentClass();
    const states = user.states();
    const prop = 'NullQp';
    if (!!object.meta) {
      if (!!object.meta[prop]) {
        return 0;
      }
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (!!curClass.meta[prop]) {
          return 0;
        }
      }
    }
    for (const state of states) {
      if (!state) continue;
      if (!state.meta) continue;
      if (!!state.meta[prop]) return 0;
    }
    const stat = user.paramBase(6);
    if (!hasSkillLevels) return stat * 2;
    const skillId = 10;
    const skillLv = user.unhSkillLevel(skillId);
    const skillMax = user.unhMaxSkillLevel(skillId);
    const skillRate = 1 + (skillLv * 4 / skillMax);
    return Math.round(stat * 2 * skillRate);
  } catch (e) {
    return 0;
  }
};

Game_BattlerBase.prototype.getFp = function() {
  this._fp = this._fp || this.maxFp();
  return this._fp;
};

Game_BattlerBase.prototype.getEp = function() {
  this._ep = this._ep || this.maxEp();
  return this._ep;
};

Game_BattlerBase.prototype.getPp = function() {
  this._pp = this._pp || this.maxPp();
  return this._pp;
};

Game_BattlerBase.prototype.getQp = function() {
  this._qp = this._qp || this.maxQp();
  return this._qp;
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

UNH_PlaneshardResources.BattlerBase_refresh = Game_BattlerBase.prototype.refresh;
Game_BattlerBase.prototype.refresh = function() {
  UNH_PlaneshardResources.BattlerBase_refresh.call(this);
  this._fp = Math.min(Math.max(this._fp, 0, this.maxFp()));
  this._ep = Math.min(Math.max(this._ep, 0, this.maxEp()));
  this._pp = Math.min(Math.max(this._pp, 0, this.maxPp()));
  this._qp = Math.min(Math.max(this._qp, 0, this.maxQp()));
};

UNH_PlaneshardResources.BattlerBase_recoverAll = Game_BattlerBase.prototype.recoverAll;
Game_BattlerBase.prototype.recoverAll = function() {
  UNH_PlaneshardResources.BattlerBase_recoverAll.call(this);
  this._fp = this.maxFp();
  this._ep = this.maxEp();
  this._pp = this.maxPp();
  this._qp = this.maxQp();
};
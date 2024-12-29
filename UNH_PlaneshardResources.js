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
    const prop2 = 'FP Plus';
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
    let stat = user.paramBase(4);
    if (!!object.meta) {
      if (!!object.meta[prop2]) {
        stat += parseInt(eval(equip.meta[prop2]));
      }
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (!!curClass.meta[prop2]) {
          stat += parseInt(eval(equip.meta[prop2]));
        }
      }
    }
    if (!!Imported.UNH_VS_EnemyWeapons || user.isActor()) {
      const equips = user.equips();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[prop2]) continue;
        try {
          stat += parseInt(eval(equip.meta[prop2]));
        } catch (e) {
          continue;
        }
      }
    } else {
      const equips = user.states();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[prop2]) continue;
        try {
          stat += parseInt(eval(equip.meta[prop2]));
        } catch (e) {
          continue;
        }
      }
    }
    if (!Imported.UNH_SkillLevels) return stat * 2;
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
    const prop2 = 'EP Plus';
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
    let stat = user.paramBase(5);
    if (!!object.meta) {
      if (!!object.meta[prop2]) {
        stat += parseInt(eval(equip.meta[prop2]));
      }
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (!!curClass.meta[prop2]) {
          stat += parseInt(eval(equip.meta[prop2]));
        }
      }
    }
    if (!!Imported.UNH_VS_EnemyWeapons || user.isActor()) {
      const equips = user.equips();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[prop2]) continue;
        try {
          stat += parseInt(eval(equip.meta[prop2]));
        } catch (e) {
          continue;
        }
      }
    } else {
      const equips = user.states();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[prop2]) continue;
        try {
          stat += parseInt(eval(equip.meta[prop2]));
        } catch (e) {
          continue;
        }
      }
    }
    if (!Imported.UNH_SkillLevels) return stat * 2;
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
    const prop2 = 'PP Plus';
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
    let stat = user.paramBase(7);
    if (!!object.meta) {
      if (!!object.meta[prop2]) {
        stat += parseInt(eval(equip.meta[prop2]));
      }
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (!!curClass.meta[prop2]) {
          stat += parseInt(eval(equip.meta[prop2]));
        }
      }
    }
    if (!!Imported.UNH_VS_EnemyWeapons || user.isActor()) {
      const equips = user.equips();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[prop2]) continue;
        try {
          stat += parseInt(eval(equip.meta[prop2]));
        } catch (e) {
          continue;
        }
      }
    } else {
      const equips = user.states();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[prop2]) continue;
        try {
          stat += parseInt(eval(equip.meta[prop2]));
        } catch (e) {
          continue;
        }
      }
    }
    if (!Imported.UNH_SkillLevels) return stat * 2;
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
    const prop2 = 'QP Plus';
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
    let stat = user.paramBase(6);
    if (!!object.meta) {
      if (!!object.meta[prop2]) {
        stat += parseInt(eval(equip.meta[prop2]));
      }
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (!!curClass.meta[prop2]) {
          stat += parseInt(eval(equip.meta[prop2]));
        }
      }
    }
    if (!!Imported.UNH_VS_EnemyWeapons || user.isActor()) {
      const equips = user.equips();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[prop2]) continue;
        try {
          stat += parseInt(eval(equip.meta[prop2]));
        } catch (e) {
          continue;
        }
      }
    } else {
      const equips = user.states();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[prop2]) continue;
        try {
          stat += parseInt(eval(equip.meta[prop2]));
        } catch (e) {
          continue;
        }
      }
    }
    if (!Imported.UNH_SkillLevels) return stat * 2;
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
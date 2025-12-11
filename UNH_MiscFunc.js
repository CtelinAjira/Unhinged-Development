//=============================================================================
// Unhinged Development - Misc Functions
// UNH_MiscFunc.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_MiscFunc = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.03] [Unhinged] [MiscFunc]
 * @author Unhinged Developer
 *
 * @param DamageFormula
 * @text Damage Formula
 * @desc The default custom damage formula
 * Variables: action, user, item, target, pow, atk, def
 * @type string
 * @default (pow + atk - def)
 *
 * @param ActionStart
 * @text Action Start Code
 * @desc JS code to run after BattleManager.startAction()
 * Variables: action, user, targets
 * @type note
 * @default ""
 *
 * @help
 * ============================================================================
 * New Notetags
 * ============================================================================
 *
 * <UnhBaseLevel:X>
 * - Use for Enemies
 * - Gives enemies a level X (JS) for the purposes of summoning
 *   - user: the enemy being given a level
 * - Do not use if also using VisuMZ_3_EnemyLevels.js
 *
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * battler.unhGetEleRates();
 * - Returns an array of the battler's element rates
 *
 * battler.object();
 * - Returns the battler's database object, whether Actor or Enemy
 *
 * action.unhDamageFormula(target, pow, atk, def);
 * - Returns a damage formula defined within the plugin parameters
 *
 * battler.friendsUnitNotUser();
 * - Returns the party's members, minus the battler themself
 *
 * $gameParty.checkStat(X, Y);
 * $gameTroop.checkStat(X, Y);
 * - Returns a function of the party's values in param X
 *   - 0 ≤ X ≤ 7
 *   - if Y > 0, return the party's highest value
 *   - if Y < 0, return the party's lowest value
 *   - if Y = 0, return the party's average value
 *
 * $gameParty.highestStat(X);
 * $gameTroop.highestStat(X);
 * $gameParty.highest___();
 * $gameTroop.highest___();
 * - Returns the party's highest stat
 *   - 0 ≤ X ≤ 7
 *   - replace ___ with Mhp/Mmp/Atk/Def/Mat/Mdf/Agi/Luk as applicable
 *
 * $gameParty.averageStat(X);
 * $gameTroop.averageStat(X);
 * $gameParty.average___();
 * $gameTroop.average___();
 * - Returns the party's average in a stat
 *   - 0 ≤ X ≤ 7
 *   - replace ___ with Mhp/Mmp/Atk/Def/Mat/Mdf/Agi/Luk as applicable
 *
 * $gameParty.lowestStat(X);
 * $gameTroop.lowestStat(X);
 * $gameParty.lowest___();
 * $gameTroop.lowest___();
 * - Returns the party's lowest stat
 *   - 0 ≤ X ≤ 7
 *   - replace ___ with Mhp/Mmp/Atk/Def/Mat/Mdf/Agi/Luk as applicable
 */
//=============================================================================

const UNH_MiscFunc = {};
UNH_MiscFunc.pluginName = 'UNH_MiscFunc';
UNH_MiscFunc.parameters = PluginManager.parameters(UNH_MiscFunc.pluginName);
UNH_MiscFunc.DamageFormula = String(UNH_MiscFunc.parameters['DamageFormula'] || "0");
UNH_MiscFunc.ActionStartCode = String(UNH_MiscFunc.parameters['ActionStart'] || "");
UNH_MiscFunc.ActionStart = new Function('action', 'user', 'targets', 'try {\n' + UNH_MiscFunc.ActionStartCode + '\n} catch (e) {\nreturn;\n}');

UNH_MiscFunc.hasPlugin = function(name) {
  return $plugins.some(function(plug) {
    if (!plug) return false;
    if (!plug.name) return false;
    if (!plug.status) return false;
    return plug.name === name;
  });
};

UNH_MiscFunc.knuthShuffle = function(arr) {
  let rand, temp, i;
  for (i = arr.length - 1; i > 0; i--) {
    rand = Math.floor((i + 1) * Math.random());
    temp = arr[rand];
    arr[rand] = arr[i];
    arr[i] = temp;
  }
  return arr;
};

Game_Variables.prototype.addValue = function(variableId, value) {
  const oldVal = this.value(variableId)
  if (Array.isArray(oldVal)) {
    if (Array.isArray(value)) {
      this.setValue(variableId, oldVal.concat(value));
    } else {
      this.setValue(variableId, oldVal.concat([value]));
    }
  } else {
    this.setValue(variableId, oldVal + value);
  }
};

Game_Variables.prototype.subValue = function(variableId, value) {
  const oldVal = this.value(variableId)
  if (Array.isArray(oldVal)) {
    if (Array.isArray(value)) {
      this.setValue(variableId, oldVal.filter(function(val) {
        if (value.includes(val)) return false;
        return true;
      }));
    } else {
      this.setValue(variableId, oldVal.filter(function(val) {
        if (val === value) return false;
        return true;
      }));
    }
  } else {
    this.setValue(variableId, oldVal - value);
  }
};

if (!UNH_MiscFunc.hasPlugin('VisuMZ_3_EnemyLevels')) {
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
    const defaultLevel = 1;
    if (!user) return defaultLevel;
    const meta = user.meta;
    if (!meta) return defaultLevel;
    const level = meta.UnhBaseLevel;
    if (!level) return defaultLevel;
    if (typeof level === 'number') {
      if (isNaN(level)) return defaultLevel;
	  return Math.min(Math.max(Number(level), 1), max);
    }
    if (/^\d+$/.test(level)) {
      if (isNaN(level)) return defaultLevel;
	  return Math.min(Math.max(Number(level), 1), max);
    }
    try {
      const dummy = eval(level);
      if (dummy === undefined) return defaultLevel;
      if (dummy === null) return defaultLevel;
      if (typeof dummy === 'object') return ((dummy.isActor()) ? (dummy.level) : (defaultLevel));
      if (isNaN(dummy)) return defaultLevel;
      return Math.min(Math.max(Number(dummy), 1), max);
    } catch (e) {
      return defaultLevel;
    }
  };
}

if (!UNH_MiscFunc.hasPlugin('VisuMZ_1_BattleCore')) {
  Game_BattlerBase.prototype.battler = function () {
    if (!this._scene) return null;
    if (this._scene.constructor !== Scene_Battle) return null;
    if (!SceneManager._scene._spriteset) return null;
    return SceneManager._scene._spriteset.findTargetSprite(this);
  };
}

Game_BattlerBase.prototype.meta = function() {
  if (!!this._unhMetadata) return this._unhMetadata;
  this._unhMetadata = {};
  for (const trait of this.traitObjects()) {
    if (!trait) continue;
    if (!trait.note) continue;
    if (!trait.meta) DataManager.extractMetadata(trait);
    for (const [key, value] of Object.entries(trait.meta)) {
      if (isNaN(value)) {
        this._unhMetadata[key] = value;
	  } else {
        this._unhMetadata[key] += value;
      }
    }
  }
  return this._unhMetadata;
};

Game_BattlerBase.prototype.unhGetEleRates = function() {
  const user = this;
  return $gameSystem.elements.map(function(ele, index) {
    return user.elementRate(index);
  });
};

UNH_MiscFunc.BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
  UNH_MiscFunc.BattleManager_startAction.call(this);
  if (!!UNH_MiscFunc.ActionStartCode) {
    UNH_MiscFunc.ActionStart(this._action, this._subject, this._targets);
  }
};

UNH_MiscFunc.isSkillTagged = function(action, target, note) {
  const item = action.item();
  const user = action.subject();
  if (!item) return false;
  if (!item.meta) return false;
  if (!item.meta[note]) return false;
  return !!eval(item.meta[note]);
};

UNH_MiscFunc.isUserTagged = function(action, target, note) {
  const item = action.item();
  const user = action.subject();
  return user.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    if (!obj.meta[note]) return false;
    return !!eval(obj.meta[note]);
  });
};

UNH_MiscFunc.isTargetTagged = function(action, target, note) {
  const item = action.item();
  const user = action.subject();
  return target.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    if (!obj.meta[note]) return false;
    return !!eval(obj.meta[note]);
  });
};

UNH_MiscFunc.isStateTagged = function(user, note) {
  if (user.currentAction()) {
    const action = user.currentAction();
    const item = action.item();
    if (!!item) {
      if (!!item.meta) {
        if (!!item.meta[note]) {
          if (!!eval(obj.meta[note])) {
            return true;
          }
        }
      }
    }
  }
  return user.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    if (!obj.meta[note]) return false;
    return !!eval(obj.meta[note]);
  });
};

UNH_MiscFunc.skillTagCt = function(action, target, note) {
  const item = action.item();
  const user = action.subject();
  if (!item) return 0;
  if (!item.meta) return 0;
  if (!item.meta[note]) return 0;
  const num = eval(item.meta[note]);
  if (isNaN(num)) return 0;
  return Number(num);
};

UNH_MiscFunc.userTagCt = function(action, target, note) {
  const item = action.item();
  const user = action.subject();
  return user.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    if (!obj.meta[note]) return r;
    const num = eval(obj.meta[note]);
    if (isNaN(num)) return r;
    return r + Number(num);
  }, 0);
};

UNH_MiscFunc.targetTagCt = function(action, target, note) {
  const item = action.item();
  const user = action.subject();
  return target.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    if (!obj.meta[note]) return r;
    const num = eval(obj.meta[note]);
    if (isNaN(num)) return r;
    return r + Number(num);
  }, 0);
};

UNH_MiscFunc.stateTagCt = function(user, note) {
  let base = 0;
  if (user.currentAction()) {
    const action = user.currentAction();
    const item = action.item();
    if (!!item) {
      if (!!item.meta) {
        if (!!item.meta[note]) {
          const numbase = eval(item.meta[note]);
          if (!isNaN(numbase)) {
            base = Number(numbase);
          }
        }
      }
    }
  }
  return user.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    if (!obj.meta[note]) return r;
    const num = eval(obj.meta[note]);
    if (isNaN(num)) return r;
    return r + Number(num);
  }, base);
};

UNH_MiscFunc.skillTagRate = function(action, target, note) {
  const item = action.item();
  const user = action.subject();
  if (!item) return 1;
  if (!item.meta) return 1;
  if (!item.meta[note]) return 1;
  const num = eval(item.meta[note]);
  if (isNaN(num)) return 1;
  return Number(num);
};

UNH_MiscFunc.userTagRate = function(action, target, note) {
  const item = action.item();
  const user = action.subject();
  return user.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    if (!obj.meta[note]) return r;
    const num = eval(obj.meta[note]);
    if (isNaN(num)) return r;
    return r * Number(num);
  }, 1);
};

UNH_MiscFunc.targetTagRate = function(action, target, note) {
  const item = action.item();
  const user = action.subject();
  return target.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    if (!obj.meta[note]) return r;
    const num = eval(obj.meta[note]);
    if (isNaN(num)) return r;
    return r * Number(num);
  }, 1);
};

UNH_MiscFunc.stateTagRate = function(user, note) {
  let base = 1;
  if (user.currentAction()) {
    const action = user.currentAction();
    const item = action.item();
    if (!!item) {
      if (!!item.meta) {
        if (!!item.meta[note]) {
          const numbase = eval(item.meta[note]);
          if (!isNaN(numbase)) {
            base = Number(numbase);
          }
        }
      }
    }
  }
  return user.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    if (!obj.meta[note]) return r;
    const num = eval(obj.meta[note]);
    if (isNaN(num)) return r;
    return r * Number(num);
  }, base);
};

UNH_MiscFunc.Action_isMagicSkill = Game_Action.prototype.isMagicSkill;
Game_Action.prototype.isMagicSkill = function() {
  if (UNH_MiscFunc.isStateTagged(this.subject(), 'Sign Language')) return false;
  if (UNH_MiscFunc.isStateTagged(this.subject(), 'Silent Casting')) return false;
  if (UNH_MiscFunc.isSkillTagged(this, this.subject(), 'UNH Chant')) return true;
  return UNH_MiscFunc.Action_isMagicSkill.call(this);
};

Game_BattlerBase.prototype.object = function() {
  if (this.isActor()) return $dataActors[this._actorId];
  if (this.isEnemy()) return $dataEnemies[this._enemyId];
  return null;
};

Game_Actor.prototype.object = function() {
  //return $dataActors[this._actorId];
  return this.actor();
};

Game_Enemy.prototype.object = function() {
  //return $dataEnemies[this._enemyId];
  return this.enemy();
};

Game_BattlerBase.prototype.isCastTime = function() {
  let meta;
  return this.states().some(function(state) {
    if (!state) return false;
    meta = state.meta;
    if (!meta) return false;
    return !!meta['CastTime'];
  });
};

Game_Action.prototype.unhDamageFormula = function(target, pow, atk, def) {
  try {
    const action = this;
    const item = this.item();
    const user = this.subject();
    return eval(UNH_MiscFunc.DamageFormula);
  } catch (e) {
    return 0;
  }
};

Game_BattlerBase.prototype.friendsUnitNotUser = function() {
  return this.friendsUnit().members().filter(function(member) {
    return member !== this;
  });
};

Game_Enemy.prototype.currentClass = function() {
  const enemy = this.enemy();
  if (!enemy) return null;
  if (!enemy.meta) return null;
  if (!this.enemy().meta['Unh Enemy Class']) return null;
  if (isNaN(this.enemy().meta['Unh Enemy Class'])) return null;
  return $dataClasses[Number(this.enemy().meta['Unh Enemy Class'])];
};

UNH_MiscFunc.Enemy_traitObjects = Game_Enemy.prototype.traitObjects;
Game_Enemy.prototype.traitObjects = function() {
  const objects = UNH_MiscFunc.Enemy_traitObjects.call(this);
  if (this.currentClass()) objects.push(this.currentClass());
  return objects;
};

Game_Unit.prototype.checkStat = function(paramId, highOrLow) {
  if (highOrLow === undefined) highOrLow = 0;
  if (typeof highOrLow !== 'number') highOrLow = 0;
  if (isNaN(highOrLow)) highOrLow = 0;
  if (typeof paramId === 'string') {
    const statStr = ['mhp','mmp','atk','def','mat','mdf','agi','luk'];
    paramId = statStr.indexOf(paramId.toLowerCase());
  }
  if (paramId < 0) return 0;
  if (paramId > 7) return 0;
  if (highOrLow > 0) {
    return this.members().reduce(function(r, member) {
      return Math.max(r, member.param(paramId));
    }, this.paramMin());
  } else if (highOrLow < 0) {
    return this.members().reduce(function(r, member) {
      return Math.min(r, member.param(paramId));
    }, this.paramMax());
  } else {
    const length = this.members().length;
    const param = this.members().reduce(function(r, member) {
      return r + member.param(paramId);
    }, 0);
    return (param / length);
  }
};

Game_Unit.prototype.highestStat = function(paramId) {
  return this.checkStat(paramId, 1);
};

Game_Unit.prototype.averageStat = function(paramId) {
  return this.checkStat(paramId, 0);
};

Game_Unit.prototype.lowestStat = function(paramId) {
  return this.checkStat(paramId, -1);
};

Game_Unit.prototype.highestMhp = function() {
  return this.checkStat(0, 1);
};

Game_Unit.prototype.averageMhp = function() {
  return this.checkStat(0, 0);
};

Game_Unit.prototype.lowestMhp = function() {
  return this.checkStat(0, -1);
};

Game_Unit.prototype.highestMmp = function() {
  return this.checkStat(1, 1);
};

Game_Unit.prototype.averageMmp = function() {
  return this.checkStat(1, 0);
};

Game_Unit.prototype.lowestMmp = function() {
  return this.checkStat(1, -1);
};

Game_Unit.prototype.highestAtk = function() {
  return this.checkStat(2, 1);
};

Game_Unit.prototype.averageAtk = function() {
  return this.checkStat(2, 0);
};

Game_Unit.prototype.lowestAtk = function() {
  return this.checkStat(2, -1);
};

Game_Unit.prototype.highestDef = function() {
  return this.checkStat(3, 1);
};

Game_Unit.prototype.averageDef = function() {
  return this.checkStat(3, 0);
};

Game_Unit.prototype.lowestDef = function() {
  return this.checkStat(3, -1);
};

Game_Unit.prototype.highestMat = function() {
  return this.checkStat(4, 1);
};

Game_Unit.prototype.averageMat = function() {
  return this.checkStat(4, 0);
};

Game_Unit.prototype.lowestMat = function() {
  return this.checkStat(4, -1);
};

Game_Unit.prototype.highestMdf = function() {
  return this.checkStat(5, 1);
};

Game_Unit.prototype.averageMdf = function() {
  return this.checkStat(5, 0);
};

Game_Unit.prototype.lowestMdf = function() {
  return this.checkStat(5, -1);
};

Game_Unit.prototype.highestAgi = function() {
  return this.checkStat(6, 1);
};

Game_Unit.prototype.averageAgi = function() {
  return this.checkStat(6, 0);
};

Game_Unit.prototype.lowestAgi = function() {
  return this.checkStat(6, -1);
};

Game_Unit.prototype.highestLuk = function() {
  return this.checkStat(7, 1);
};

Game_Unit.prototype.averageLuk = function() {
  return this.checkStat(7, 0);
};

Game_Unit.prototype.lowestLuk = function() {
  return this.checkStat(7, -1);
};
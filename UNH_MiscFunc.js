//=============================================================================
// Unhinged Development - Misc Functions
// UNH_MiscFunc.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [MiscFunc]
 * @author Unhinged Developer
 *
 * @param DamageFormula
 * @text Damage Formula
 * @desc The default custom damage formula
 * Variables: action, user, item, target, pow, atk, def
 * @type string
 * @default (pow + atk - def)
 *
 * @param CustParam
 * @text Custom Parameters
 * @desc The list of custom parameters
 * @type struct<ParamObj>[]
 *
 * @param CustFunc
 * @text Custom Functions
 * @desc The list of custom functions
 * These are tied to Game_Action.prototype
 * @type struct<ParamFunc>[]
 *
 * @help
 * ============================================================================
 * New Parameters
 * ============================================================================
 *
 * You may now assign custom parameters.  These can be calculated via notetags 
 * if desired.
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
 * action.unhDmgFormula(target, pow, atk, def);
 * - Returns a damage formula defined within the plugin parameters
 *
 * battler.friendsUnitNotUser();
 * - Returns the party's members, minus the battler themself
 *
 * $gameParty.highestStat(X);
 * $gameTroop.highestStat(X);
 * $gameParty.highest___();
 * $gameTroop.highest___();
 * - Returns the party's highest stat
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
 /*~struct~ParamObj:
 * @param key
 * @text Parameter Key
 * @desc The name of this parameter within the code
 * @type string
 *
 * @param name
 * @text Parameter Name
 * @desc The name of this parameter for readability
 * @type string
 *
 * @param code
 * @text Parameter Code
 * @desc The code for this parameter
 * The variable 'note' references Parameter Name
 * @type note
 * @default "return 0;"
 *
 * @param isInt
 * @text Parameter Data Type
 * @desc The data type for this parameter
 * @type boolean
 * @on Integer
 * @off Floating Point
 * @default false
 */
 /*~struct~ParamFunc:
 * @param key
 * @text Function Name
 * @desc The name of this function (no spaces plz)
 * @type string
 *
 * @param note
 * @text Function Notetag
 * @desc The notetag passed to this function
 * @type string
 *
 * @param code
 * @text Parameter Code
 * @desc The code for this parameter
 * Variables: action, user, target, note
 * @type note
 * @default "return 0;"
 */
//=============================================================================

const UNH_MiscFunc = {};
UNH_MiscFunc.pluginName = 'UNH_MiscFunc';
UNH_MiscFunc.parameters = PluginManager.parameters(UNH_MiscFunc.pluginName);
UNH_MiscFunc.DamageFormula = String(UNH_MiscFunc.parameters['DamageFormula'] || "0");

UNH_MiscFunc.checkParams = function() {
  if (!this.parameters['CustParam']) return false;
  if (!Array.isArray(this.parameters['CustParam'])) return false;
  if (this.parameters['CustParam'].length <= 0) return false;
  return true;
};

UNH_MiscFunc.checkFuncs = function() {
  if (!this.parameters['CustFunc']) return false;
  if (!Array.isArray(this.parameters['CustFunc'])) return false;
  if (this.parameters['CustFunc'].length <= 0) return false;
  return true;
};

if (UNH_MiscFunc.checkParams()) {
  const unhParams = this.parameters['CustParam'];
  for (const param of unhParams) {
    Object.defineProperty(Game_BattlerBase.prototype, param.key, {
      get: function() {
        const paramEval = Function('user', 'note', param.code);
        if (param.isInt) {
          return Math.round(paramEval(this, param.name));
        }
        return paramEval(this, param.name);
      };
      configurable: true
    });
  }
}

if (UNH_MiscFunc.checkFuncs()) {
  const unhParams = this.parameters['CustFunc'];
  for (const param of unhParams) {
    Game_Action.prototype[param.key] = function(target) {
      const paramEval = Function('action', 'user', 'target', 'note', param.code);
      return paramEval(this, this.subject(), target, param.note);
    };
  }
}

Game_BattlerBase.prototype.unhGetEleRates = function() {
  const user = this;
  return $gameSystem.elements.map(function(ele, index) {
    return user.elementRate(index);
  });
};

Game_Actor.prototype.object = function() {
  return this.actor();
};

Game_Enemy.prototype.object = function() {
  return this.enemy();
};

Game_Action.prototype.unhDmgFormula = function(target, pow, atk, def) {
  try {
    const action = this;
    const item = this.item();
    const user = this.subject();
    return eval(UNH_MiscFunc.DamageFormula);
  } catch (e) {
    return 0;
  };
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

Game_Enemy.prototype.equips = function() {
  const equips = [];
  let eqpEval;
  let slotName;
  for (let i = 1; i <= $gameSystem.equipTypes.length; i++) {
    slotName = $gameSystem.equipTypes[i];
    if (!this.enemy().meta) continue;
    if (!this.enemy().meta[slotName]) continue;
    try {
      eqpEval = Function('return ' + String(this.enemy().meta[slotName]));
      const eqpId = eqpEval();
      if (i === 1) {
        equips.push($dataWeapons[eqpId]);
      } else if (i === 2 && this.isDualWield()) {
        equips.push($dataWeapons[eqpId]);
      } else {
        equips.push($dataArmors[eqpId]);
      }
    } catch (e) {
      continue;
    }
  }
  return equips;
};

Game_Enemy.prototype.weapons = function() {
  const equips = [];
  let eqpEval;
  let slotName;
  for (let i = 1; i <= $gameSystem.equipTypes.length; i++) {
    slotName = $gameSystem.equipTypes[i];
    if (!this.enemy().meta) continue;
    if (!this.enemy().meta[slotName]) continue;
    try {
      eqpEval = Function('return ' + String(this.enemy().meta[slotName]));
      const eqpId = eqpEval();
      if (i === 1) {
        equips.push($dataWeapons[eqpId]);
      } else if (i === 2 && this.isDualWield()) {
        equips.push($dataWeapons[eqpId]);
      } else {
        continue;
      }
    } catch (e) {
      continue;
    }
  }
  return equips;
};

Game_Enemy.prototype.armors = function() {
  const equips = [];
  let eqpEval;
  let slotName;
  for (let i = 1; i <= $gameSystem.equipTypes.length; i++) {
    slotName = $gameSystem.equipTypes[i];
    if (!this.enemy().meta) continue;
    if (!this.enemy().meta[slotName]) continue;
    try {
      eqpEval = Function('return ' + String(this.enemy().meta[slotName]));
      const eqpId = eqpEval();
      if (i === 1) {
        continue;
      } else if (i === 2 && this.isDualWield()) {
        continue;
      } else {
        equips.push($dataArmors[eqpId]);
      }
    } catch (e) {
      continue;
    }
  }
  return equips;
};

Game_Enemy.prototype.hasNoWeapons = function() {
    return this.weapons().length === 0;
};

Game_Unit.prototype.highestStat = function(paramId) {
  if (typeof paramId === 'string') {
    const statStr = ['mhp','mmp','atk','def','mat','mdf','agi','luk'];
    paramId = statStr.indexOf(paramId.toLowerCase());
  }
  if (paramId < 0) return 0;
  if (paramId > 7) return 0;
  return this.members().reduce(function(r, member) {
    return Math.max(r, member.param(paramId));
  }, this.paramMin());
};

Game_Unit.prototype.lowestStat = function(paramId) {
  if (typeof paramId === 'string') {
    const statStr = ['mhp','mmp','atk','def','mat','mdf','agi','luk'];
    paramId = statStr.indexOf(paramId.toLowerCase());
  }
  if (paramId < 0) return 0;
  if (paramId > 7) return 0;
  return this.members().reduce(function(r, member) {
    return Math.min(r, member.param(paramId));
  }, this.paramMax());
};

Game_Unit.prototype.highestMhp = function() {
  return this.highestStat(0);
};

Game_Unit.prototype.lowestMhp = function() {
  return this.lowestStat(0);
};

Game_Unit.prototype.highestMmp = function() {
  return this.highestStat(1);
};

Game_Unit.prototype.lowestMmp = function() {
  return this.lowestStat(1);
};

Game_Unit.prototype.highestAtk = function() {
  return this.highestStat(2);
};

Game_Unit.prototype.lowestAtk = function() {
  return this.lowestStat(2);
};

Game_Unit.prototype.highestDef = function() {
  return this.highestStat(3);
};

Game_Unit.prototype.lowestDef = function() {
  return this.lowestStat(3);
};

Game_Unit.prototype.highestMat = function() {
  return this.highestStat(4);
};

Game_Unit.prototype.lowestMat = function() {
  return this.lowestStat(4);
};

Game_Unit.prototype.highestMdf = function() {
  return this.highestStat(5);
};

Game_Unit.prototype.lowestMdf = function() {
  return this.lowestStat(5);
};

Game_Unit.prototype.highestAgi = function() {
  return this.highestStat(6);
};

Game_Unit.prototype.lowestAgi = function() {
  return this.lowestStat(6);
};

Game_Unit.prototype.highestLuk = function() {
  return this.highestStat(7);
};

Game_Unit.prototype.lowestLuk = function() {
  return this.lowestStat(7);
};
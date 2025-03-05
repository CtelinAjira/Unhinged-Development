//=============================================================================
// Unhinged Development - Misc Functions
// UNH_MiscFunc.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_MiscFunc = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [MiscFunc]
 * @author Unhinged Developer
 *
 * @param DamageFormula
 * @text Damage Formula
 * @desc The default custom damage formula
 * Variables: action, user, item, target, pow, atk, def
 * @type string
 * @default (pow + atk - def)
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
//=============================================================================

const UNH_MiscFunc = {};
UNH_MiscFunc.pluginName = 'UNH_MiscFunc';
UNH_MiscFunc.parameters = PluginManager.parameters(UNH_MiscFunc.pluginName);
UNH_MiscFunc.DamageFormula = String(UNH_MiscFunc.parameters['DamageFormula'] || "0");

if (!Imported.VisuMZ_3_EnemyLevels) {
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
};

Game_BattlerBase.prototype.unhGetEleRates = function() {
  const user = this;
  return $gameSystem.elements.map(function(ele, index) {
    return user.elementRate(index);
  });
};

Game_BattlerBase.prototype.object = function() {
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

Game_Action.prototype.unhDmgFormula = function(target, pow, atk, def) {
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

UNH_VS_EnemyWeapons.Enemy_traitObjects = Game_Enemy.prototype.traitObjects;
Game_Enemy.prototype.traitObjects = function() {
  const objects = UNH_VS_EnemyWeapons.Enemy_traitObjects.call(this);
  if (this.currentClass()) objects.push(this.currentClass());
  return objects;
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
//=============================================================================
// Unhinged Development - Misc Functions
// UNH_MiscFunc.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter VisuMZ_0_CoreEngine
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [UNH_MiscFunc]
 * @author Unhinged Developer
 *
 * @param DamageFormula
 * @text Damage Formula
 * @desc The default code for user.unhDmgFormula(target, pow, atk, def)
 * @type note
 * @default "return (pow + atk - def);"
 *
 * @help
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * battler.unhDmgFormula(target, pow, atk, def);
 * - Returns a damage formula defined within the plugin parameters
 *
 * battler.friendsUnitNotUser();
 * - Returns the party's members, minus the battler themself
 *
 * $gameParty.highestStat(X);
 * $gameTroop.highestStat(X);
 * - Returns the highest value in param X (0-7) among the party
 *
 * $gameParty.lowestStat(X);
 * $gameTroop.lowestStat(X);
 * - Returns the lowest value in param X (0-7) among the party
 *
 * $gameParty.highest___();
 * $gameTroop.highest___();
 * - Returns the party's highest stat
 *   - replace ___ with Mhp/Mmp/Atk/Def/Mat/Mdf/Agi/Luk as applicable
 *
 * $gameParty.lowest___();
 * $gameTroop.lowest___();
 * - Returns the party's lowest stat
 *   - replace ___ with Mhp/Mmp/Atk/Def/Mat/Mdf/Agi/Luk as applicable
 */
//=============================================================================

const UNH_MiscFunc = {};
UNH_MiscFunc.pluginName = 'UNH_MiscFunc';
UNH_MiscFunc.parameters = PluginManager.parameters(UNH_MiscFunc.pluginName);
UNH_MiscFunc.DamageFormula = String(UNH_MiscFunc.parameters['DamageFormula'] || "0");

Game_BattlerBase.prototype.unhDmgFormula = function(target, pow, atk, def) {
  const user = this;
  const a = this;
  const b = target;
  const attacker = this;
  const defender = target;
  return eval(UNH_MiscFunc.DamageFormula);
};

Game_BattlerBase.prototype.friendsUnitNotUser = function() {
  return this.friendsUnit().members().filter(function(member) {
    return member !== this;
  });
};

Game_Unit.prototype.highestStat = function(paramId) {
  return this.members().reduce(function(r, member) {
    return Math.max(r, member.param(paramId));
  }, this.paramMin());
};

Game_Unit.prototype.lowestStat = function(paramId) {
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
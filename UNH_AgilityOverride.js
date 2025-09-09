//=============================================================================
// Unhinged Development - Agility Override
// UNH_AgilityOverride.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_AgilityOverride = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [AgilityOverride]
 * @author Unhinged Developer
 * @orderBefore VisuMZ_0_CoreEngine
 *
 * @param ActorAgilityFormula
 * @text $gameParty.agility() Formula
 * @desc Override of agility for each actor
 * Must return some function of "total"
 * @type note
 * @default "return total + member.agi;"
 *
 * @param ActorAgilityAfter
 * @text $gameParty.agility() Post-Execution
 * @desc Code executed after agility for each actor
 * Must return some function of "agi"
 * @type note
 * @default "return agi;"
 *
 * @param EnemyAgilityFormula
 * @text $gameTroop.agility() Formula
 * @desc Override of agility for each enemy
 * Must return some function of "total"
 * @type note
 * @default "return total + member.agi;"
 *
 * @param EnemyAgilityAfter
 * @text $gameTroop.agility() Post-Execution
 * @desc Code executed after agility for each enemy
 * Must return some function of "agi"
 * @type note
 * @default "return agi;"
 *
 * @param MoraleBase
 * @text Default Morale
 * @desc default value for battler.unhMorale()
 * Must be a number (-1 means do not use)
 * @type number
 * @default -1
 *
 * @param MoraleEffect
 * @text Morale Effect
 * @desc extra code for BattleManager.makeEscapeRatio()
 * Variables: escapeRatio
 * @type note
 * @default "let avgMorale = $gameTroop.aliveMembers().reduce(function(r, member) {\n  return r + member.unhMorale();\n}, 0);\navgMorale /= $gameTroop.members().length;\nif ((Math.random() * 100) >= (200 - avgMorale)) {\n return = 0;\n} else if ((Math.random() * 100) >= (avgMorale)) {\n return = 1;\n}\nreturn escapeRatio;"
 *
 * @param PreemptiveRate
 * @text ratePreemptive() Formula
 * @desc $gameParty.ratePreemptive(troopAgi) override
 * Must return "rate"
 * @type note
 * @default "let rate = agility >= troopAgi ? 0.05 : 0.03;\nif (this.hasRaisePreemptive()) {\n rate *= 4;\n}\nreturn rate;"
 *
 * @param SurpriseRate
 * @text rateSurprise() Formula
 * @desc $gameParty.rateSurprise(troopAgi) override
 * Must return "rate"
 * @type note
 * @default "let rate = agility >= troopAgi ? 0.03 : 0.05;\nif (this.hasCancelSurprise()) {\n rate = 0;\n}\nreturn rate;"
 *
 * @help
 * ============================================================================
 * Overridden Functions
 * ============================================================================
 * 
 * unit.agility()
 * - overridden to be defined by plugin parameters above
 *   - uses local function unhAgiOverride(total, member, index, unit) to check 
 *     each unit
 *     - total: the ultimate return value for each member
 *     - member: the battler currently being checked
 *     - index: the index of member
 *     - unit: the group member is part of
 *       - $gameParty.members() for actors
 *       - $gameTroop.members() for enemies
 *   - uses local function afterAgi(agi, unit) to check 
 *     each unit
 *     - agi: the return value for unhAgiOverride
 *     - unit: the group being checked
 *       - $gameParty.members() for actors
 *       - $gameTroop.members() for enemies
 * - now takes parameter "original" to determine if new functionality should be 
 *   used (false) or ignored (true)
 *
 * BattleManager.ratePreemptive()
 * BattleManager.rateSurprise()
 * - overriden to use "unit.agility(true)" instead of "unit.agility()"
 *
 * $gameParty.ratePreemptive(troopAgi)
 * $gameParty.rateSurprise(troopAgi)
 * - overriden to do multiple things
 *   - use "unit.agility(true)" instead of "unit.agility()"
 *   - be defined by plugin parameters above
 *     - agility: constant set to "unit.agility(true)"
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <unhStartingMorale:X>
 * - used for enemies
 * - initializes a Morale of X onto an enemy
 *   - Morale is a value you can use to influence run chances
 * <unhMoralePlus:X>
 * - adds X to the target's Morale
 * <unhMoraleDown:X>
 * - subtracts X from the target's Morale
 */
//=============================================================================

const UNH_AgilityOverride = {};
UNH_AgilityOverride.pluginName = 'UNH_AgilityOverride';
UNH_AgilityOverride.parameters = PluginManager.parameters(UNH_AgilityOverride.pluginName);
UNH_AgilityOverride.ActorAgilityFormula = String(UNH_AgilityOverride.parameters['ActorAgilityFormula'] || "");
UNH_AgilityOverride.ActorAgilityFormulaFunc = Function('total', 'member', 'index', 'unit', 'try {\n' + UNH_AgilityOverride.ActorAgilityFormula + '\n} catch (e) {\nreturn total + member.agi;\n}');

UNH_AgilityOverride.ActorAgilityAfter = String(UNH_AgilityOverride.parameters['ActorAgilityAfter'] || "");
UNH_AgilityOverride.ActorAgilityAfterFunc = Function('agi', 'unit', 'try {\n' + UNH_AgilityOverride.ActorAgilityAfter + '\n} catch (e) {\nreturn agi;\n}');

UNH_AgilityOverride.EnemyAgilityFormula = String(UNH_AgilityOverride.parameters['EnemyAgilityFormula'] || "");
UNH_AgilityOverride.EnemyAgilityFormulaFunc = Function('total', 'member', 'index', 'unit', 'try {\n' + UNH_AgilityOverride.EnemyAgilityFormula + '\n} catch (e) {\nreturn total + member.agi;\n}');

UNH_AgilityOverride.EnemyAgilityAfter = String(UNH_AgilityOverride.parameters['EnemyAgilityAfter'] || "");
UNH_AgilityOverride.EnemyAgilityAfterFunc = Function('agi', 'unit', 'try {\n' + UNH_AgilityOverride.EnemyAgilityAfter + '\n} catch (e) {\nreturn agi;\n}');

UNH_AgilityOverride.MoraleBase = Number(UNH_AgilityOverride.parameters['MoraleBase'] || 0);
UNH_AgilityOverride.MoraleEffect = String(UNH_AgilityOverride.parameters['MoraleEffect'] || "");
UNH_AgilityOverride.MoraleEffectFunc = Function('escapeRatio', UNH_AgilityOverride.MoraleEffect);

UNH_AgilityOverride.PreemptiveRate = String(UNH_AgilityOverride.parameters['PreemptiveRate'] || "");
UNH_AgilityOverride.PreemptiveRateFunc = Function('agility', 'troopAgi', 'try {\n' + UNH_AgilityOverride.PreemptiveRate + '\n} catch (e) {\nreturn total + member.agi;\n}');

UNH_AgilityOverride.SurpriseRate = String(UNH_AgilityOverride.parameters['SurpriseRate'] || "");
UNH_AgilityOverride.SurpriseRateFunc = Function('agility', 'troopAgi', 'try {\n' + UNH_AgilityOverride.SurpriseRate + '\n} catch (e) {\nreturn total + member.agi;\n}');

Game_Party.prototype.agility = function(original = false) {
  if (!!original) return Game_Unit.prototype.agility.call(this);
  if (!!UNH_AgilityOverride.ActorAgilityFormula) {
    const members = this.members();
    let agiOverride = members.reduce(UNH_AgilityOverride.ActorAgilityFormulaFunc, 0);
    if (!!UNH_AgilityOverride.ActorAgilityAfter) {
      return Math.max(1, UNH_AgilityOverride.ActorAgilityAfterFunc(agiOverride, $gameParty.aliveMembers()) / Math.max(1, members.length));
    }
    return Math.max(1, agiOverride / Math.max(1, members.length));
  }
  return Game_Unit.prototype.agility.call(this);
};

Game_Troop.prototype.agility = function(original = false) {
  if (!!original) return Game_Unit.prototype.agility.call(this);
  if (!!UNH_AgilityOverride.EnemyAgilityFormula) {
    const members = this.members();
    let agiOverride = members.reduce(UNH_AgilityOverride.EnemyAgilityFormulaFunc, 0);
    if (!!UNH_AgilityOverride.EnemyAgilityAfter) {
      return Math.max(1, UNH_AgilityOverride.EnemyAgilityAfterFunc(agiOverride, $gameTroop.aliveMembers()) / Math.max(1, members.length));
    }
    return Math.max(1, agiOverride / Math.max(1, members.length));
  }
  return Game_Unit.prototype.agility.call(this);
};

UNH_AgilityOverride.Party_ratePreemptive = Game_Party.prototype.ratePreemptive;
Game_Party.prototype.ratePreemptive = function(troopAgi) {
  const agility = this.agility(true);
  if (!!UNH_AgilityOverride.PreemptiveRate) {
    return UNH_AgilityOverride.PreemptiveRateFunc(agility, troopAgi);
  } else {
    return UNH_AgilityOverride.Party_ratePreemptive.call(this, troopAgi);
  }
};

UNH_AgilityOverride.Party_rateSurprise = Game_Party.prototype.rateSurprise;
Game_Party.prototype.rateSurprise = function(troopAgi) {
  const agility = this.agility(true);
  if (!!UNH_AgilityOverride.SurpriseRate) {
    return UNH_AgilityOverride.SurpriseRateFunc(agility, troopAgi);
  } else {
    return UNH_AgilityOverride.Party_rateSurprise.call(this, troopAgi);
  }
};

Game_Enemy.prototype.unhInitMorale = function() {
  const user = this;
  const enemy = this.enemy();
  const meta = enemy.meta;
  const hasMoral = !!meta ? !!meta.unhStartingMorale : false;
  const base = !!hasMoral ? eval(meta.unhStartingMorale) : UNH_AgilityOverride.MoraleBase;
  this._unhMorale = base;
};

Game_Enemy.prototype.unhMorale = function() {
  if (this._unhMorale === undefined) this.unhInitMorale();
  return this._unhMorale;
};

Game_Enemy.prototype.unhSetMorale = function(value) {
  if (typeof value !== 'number') return;
  this._unhMorale = value;
};

Game_Enemy.prototype.unhAddMorale = function(value) {
  if (typeof value !== 'number') return;
  this.unhSetMorale(this.unhMorale() + value);
};

UNH_AgilityOverride.Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  const item = this.item();
  const user = this.subject();
  UNH_AgilityOverride.Action_apply.call(this, target);
  if (UNH_AgilityOverride.MoraleBase !== -1) {
    if (target.isEnemy()) {
      if (!!item.meta) {
        if (!!item.meta.unhMoralePlus) {
          if (!isNaN(item.meta.unhMoralePlus)) target.unhAddMorale(Number(item.meta.unhMoralePlus));
        }
        if (!!item.meta.unhMoraleDown) {
          if (!isNaN(item.meta.unhMoraleDown)) target.unhAddMorale(-Number(item.meta.unhMoraleDown));
        }
      }
    }
  }
};

BattleManager.unhEscapeRatio = function() {
  const escapeRatio = this._escapeRatio || 0;
  if ((UNH_AgilityOverride.MoraleBase !== -1) && !!UNH_AgilityOverride.MoraleEffect) {
    try {
      return UNH_AgilityOverride.MoraleEffectFunc(escapeRatio);
	} catch (e) {
      return escapeRatio;
	};
  }
  return escapeRatio;
};

UNH_AgilityOverride.BattleManager_processEscape = BattleManager.processEscape;
BattleManager.processEscape = function() {
  try {
    $gameParty.performEscape();
    SoundManager.playEscape();
    const success = this._preemptive || Math.random() < BattleManager.unhEscapeRatio();
    if (success) {
      this.onEscapeSuccess();
    } else {
      this.onEscapeFailure();
    }
    return success;
  } catch (e) {
    return UNH_AgilityOverride.BattleManager_processEscape.call(this);
  }
};

BattleManager.ratePreemptive = function() {
  return $gameParty.ratePreemptive($gameTroop.agility(true));
};

BattleManager.rateSurprise = function() {
  return $gameParty.rateSurprise($gameTroop.agility(true));
};
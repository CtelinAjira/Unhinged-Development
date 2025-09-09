//=============================================================================
// Unhinged Development - Party Ability Stacking
// UNH_PartyAbilityStack.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_PartyAbilityStack = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [PartyAbilityStack]
 * @author Unhinged Developer
 *
 * @param NewEncounterProgress
 * @text $gamePlayer.encounterProgressValue() Formula
 * @desc Variables: none
 * Return Type: Number
 * @type note
 * @default "let value = $gameMap.isBush(this.x, this.y) ? 2 : 1;\nif ($gameParty.hasEncounterHalf() > 0) {\n  value /= Math.pow(2, $gameParty.hasEncounterHalf());\n}\nif (this.isInShip()) {\n  value *= 0.5;\n}\nreturn value;"
 *
 * @param NewPreemptiveRate
 * @text $gameParty.ratePreemptive() Formula
 * @desc Variables: troopAgi
 * Return Type: Number
 * @type note
 * @default "let rate = this.agility() >= troopAgi ? 0.05 : 0.03;\nif (this.hasRaisePreemptive() > 0) {\n  rate *= Math.pow(4, this.hasRaisePreemptive());\n}\nreturn rate;"
 *
 * @param NewSurpriseRate
 * @text $gameParty.rateSurprise() Formula
 * @desc Variables: troopAgi
 * Return Type: Number
 * @type note
 * @default "let rate = this.agility() >= troopAgi ? 0.03 : 0.05;\nif (this.hasCancelSurprise() > 0) {\n  rate = 0;\n}\nreturn rate;"
 *
 * @param NewGoldRate
 * @text $gameTroop.goldRate() Formula
 * @desc Variables: none
 * Return Type: Number
 * @type note
 * @default "return 1 + Math.max($gameParty.hasGoldDouble(), 0);"
 *
 * @param NewDropItemRate
 * @text enemy.dropItemRate() Formula
 * @desc Variables: none
 * Return Type: Number
 * @type note
 * @default "return 1 + Math.max($gameParty.hasDropItemDouble(), 0);"
 *
 * @help
 * ============================================================================
 * Altered Functions
 * ============================================================================
 * 
 * WARNING: NO ALIAS USED!  Put this plugin before anything else that modifies 
 *          the below functions!
 * 
 * actor.partyAbility(abilityId)
 * party.partyAbility(abilityId)
 * - now returns an integer, and tracks how many instances of this ability
 * 
 * party.encounterProgressValue()
 * party.ratePreemptive(troopAgi)
 * party.rateSurprise(troopAgi)
 * troop.goldRate()
 * enemy.dropItemRate()
 * - overwritten to account for new behavior of party.partyAbility(abilityId)
 *   - multiples of the same party ability stack
 */
//=============================================================================

const UNH_PartyAbilityStack = {};
UNH_PartyAbilityStack.pluginName = 'UNH_PartyAbilityStack';
UNH_PartyAbilityStack.parameters = PluginManager.parameters(UNH_PartyAbilityStack.pluginName);
UNH_PartyAbilityStack.NewEncounterProgress = String(UNH_PartyAbilityStack.parameters['NewEncounterProgress'] || "");
UNH_PartyAbilityStack.NewEncounterProgressFunc = Function(UNH_PartyAbilityStack.NewEncounterProgress);

UNH_PartyAbilityStack.NewPreemptiveRate = String(UNH_PartyAbilityStack.parameters['NewPreemptiveRate'] || "");
UNH_PartyAbilityStack.NewPreemptiveRateFunc = Function('troopAgi', UNH_PartyAbilityStack.NewPreemptiveRate);

UNH_PartyAbilityStack.NewSurpriseRate = String(UNH_PartyAbilityStack.parameters['NewSurpriseRate'] || "");
UNH_PartyAbilityStack.NewSurpriseRateFunc = Function('troopAgi', UNH_PartyAbilityStack.NewSurpriseRate);

UNH_PartyAbilityStack.NewGoldRate = String(UNH_PartyAbilityStack.parameters['NewGoldRate'] || "");
UNH_PartyAbilityStack.NewGoldRateFunc = Function(UNH_PartyAbilityStack.NewGoldRate);

UNH_PartyAbilityStack.NewDropItemRate = String(UNH_PartyAbilityStack.parameters['NewDropItemRate'] || "");
UNH_PartyAbilityStack.NewDropItemRateFunc = Function(UNH_PartyAbilityStack.NewDropItemRate);

Game_BattlerBase.prototype.partyAbility = function(r, abilityId) {
  return this.traits(Game_BattlerBase.TRAIT_PARTY_ABILITY).reduce(function(trait) {
    if (trait.dataId === abilityId) {
      return r + 1;
    } else {
      return r;
    }
  }, 0);
};

Game_Party.prototype.partyAbility = function(abilityId) {
  return this.battleMembers().reduce(function(r, actor) {
    return r + actor.partyAbility(abilityId);
  }, 0);
};

Game_Player.prototype.encounterProgressValue = function() {
  if (!!UNH_PartyAbilityStack.NewEncounterProgress) return UNH_PartyAbilityStack.NewEncounterProgressFunc();
  let value = $gameMap.isBush(this.x, this.y) ? 2 : 1;
  if ($gameParty.hasEncounterHalf() > 0) {
    value /= Math.pow(2, $gameParty.hasEncounterHalf());
  }
  if (this.isInShip()) {
    value *= 0.5;
  }
  return value;
};

Game_Party.prototype.ratePreemptive = function(troopAgi) {
  if (!!UNH_PartyAbilityStack.NewPreemptiveRate) return UNH_PartyAbilityStack.NewPreemptiveRateFunc(troopAgi);
  let rate = this.agility() >= troopAgi ? 0.05 : 0.03;
  if (this.hasRaisePreemptive() > 0) {
    rate *= Math.pow(4, this.hasRaisePreemptive());
  }
  return rate;
};

Game_Party.prototype.rateSurprise = function(troopAgi) {
  if (!!UNH_PartyAbilityStack.NewSurpriseRate) return UNH_PartyAbilityStack.NewSurpriseRateFunc(troopAgi);
  let rate = this.agility() >= troopAgi ? 0.03 : 0.05;
  if (this.hasCancelSurprise() > 0) {
    rate = 0;
  }
  return rate;
};

Game_Troop.prototype.goldRate = function() {
  if (!!UNH_PartyAbilityStack.NewGoldRate) return UNH_PartyAbilityStack.NewGoldRateFunc();
  return 1 + Math.max($gameParty.hasGoldDouble(), 0);
};

Game_Enemy.prototype.dropItemRate = function() {
  if (!!UNH_PartyAbilityStack.NewDropItemRate) return UNH_PartyAbilityStack.NewDropItemRateFunc();
  return 1 + Math.max($gameParty.hasDropItemDouble(), 0);
};
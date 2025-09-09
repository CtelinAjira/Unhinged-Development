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
 * @param NewGoldRate
 * @text $gameTroop.goldRate() Formula
 * @desc Override for Party Ability: Gold Double
 * Must return a Number
 * @type note
 * @default "return 1 + Math.max($gameParty.hasGoldDouble(), 0);"
 *
 * @param NewDropItemRate
 * @text enemy.dropItemRate() Formula
 * @desc Override for Party Ability: Drop Item Double
 * Must return a Number
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
  let rate = this.agility() >= troopAgi ? 0.05 : 0.03;
  if (this.hasRaisePreemptive() > 0) {
    rate *= Math.pow(4, this.hasRaisePreemptive());
  }
  return rate;
};

Game_Party.prototype.rateSurprise = function(troopAgi) {
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
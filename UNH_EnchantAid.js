//=============================================================================
// Unhinged Development - Planeshard's Enchantment Aid
// UNH_EnchantAid.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_EnchantAid = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [EnchantAid]
 * @author Unhinged Developer
 *
 * @param defAtkChk
 * @text Default Attack Check
 * @desc Damage formulas containing this code are enchantable
 * @type string
 *
 * @help
 * This allows for weapon effects that only decrement on weapon attacks
 * <Enchant Weapon>   - Setup as a weapon enchantment with 1 turn
 * <Enchant Weapon:X> - Setup as a weapon enchantment with X turns (JS Eval)
 *     X must eval to a whole number
 * <Orichalcum>       - Double enchantment durations
 */
//=============================================================================

const UNH_EnchantAid = {};
UNH_EnchantAid.pluginName = 'UNH_EnchantAid';
UNH_EnchantAid.parameters = PluginManager.parameters(UNH_EnchantAid.pluginName);
UNH_EnchantAid.defAtkChk = String(UNH_EnchantAid.parameters['defAtkChk'] || '');

Game_Action.prototype.unhIsEnchantable = function(formula) {
  if (!formula) return false;
  const item = this.item();
  if (!item) return false;
  if (item.damage.type === 0) return false;
  return item.damage.formula.includes(formula);
};

Game_BattlerBase.prototype.unhIsOrichalcum = function() {
  const user = this;
  const note = 'Orichalcum';
  return this.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    return !!obj.meta[note];
  });
};

Game_BattlerBase.prototype.unhEnchants = function() {
  return this.states().filter(function(state) {
    if (!state) return false;
    return this.unhIsEnchant(state.id);
  });
};

Game_BattlerBase.prototype.unhIsEnchant = function(stateId) {
  if (stateId < 1) return false;
  if (stateId > $dataStates.length) return false;
  const state = $dataStates[stateId];
  const user = this;
  const note = 'Enchant Weapon';
  if (!state) return false;
  if (!state.meta) return false;
  return !!state.meta[note];
};

Game_BattlerBase.prototype.unhGetEnchantTurns = function(stateId) {
  if (stateId < 1) return 0;
  if (stateId > $dataStates.length) return 0;
  return this._enSpellTurns[stateId] || 0;
};

Game_BattlerBase.prototype.unhSetEnchantTurns = function(stateId, value) {
  if (stateId < 1) return;
  if (stateId > $dataStates.length) return;
  if (typeof value === 'number') {
    this._enSpellTurns[stateId] = 0;
  } else if (!isNaN(value)) {
    this._enSpellTurns[stateId] = 0;
  } else {
    this._enSpellTurns[stateId] = value;
  }
  if (this._enSpellTurns[stateId] <= 0) {
    if (this.isStateAffected(stateId)) {
      this.removeState(stateId);
      this._enSpellTurns[stateId] = undefined;
    }
  }
};

UNH_EnchantAid.Battler_addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId) {
  const user = this;
  UNH_EnchantAid.Battler_addState.call(this, stateId);
  if (this.unhIsEnchant()) {
    if (this._enSpellTurns === undefined) {
      this._enSpellTurns = [];
      for (const ele of $gameSystem.elements) {
        this._enSpellTurns.push(0);
      }
    }
    let turns = this.unhGetEnchantTurns(stateId);
    if (this.unhIsOrichalcum()) {
      turns += Math.round(Number($dataStates[stateId].meta['Enchant Weapon']) + Number($dataStates[stateId].meta['Enchant Weapon']));
    } else {
      turns += Math.round(Number($dataStates[stateId].meta['Enchant Weapon']));
	}
    this.unhSetEnchantTurns(stateId, turns);
    if (Imported.VisuMZ_1_SkillsStatesCore) {
      this.setStateDisplay(stateId, this.unhGetEnchantTurns(stateId));
    }
  }
};

UNH_EnchantAid.Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  UNH_EnchantAid.Action_apply.call(this, target);
  if (target.result().isHit()) {
    this._unhEnchantProc = this.unhIsEnchantable(UNH_EnchantAid.defAtkChk)
  }
};

UNH_EnchantAid.BattleManager_endAction = BattleManager.endAction;
BattleManager.endAction = function() {
  const user = this._subject;
  const action = this._action;
  UNH_EnchantAid.BattleManager_endAction.call(this);
  if (!!action._unhEnchantProc) {
    const enchants = user.unhEnchants();
    let turns;
    for (const state of enchants) {
      turns = user.unhGetEnchantTurns(state.id);
      user.unhSetEnchantTurns(state.id, turns - 1);
    }
  }
};
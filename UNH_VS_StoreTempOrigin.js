//=============================================================================
// Unhinged Development - VS Skills & States Core: Store Origin Copy
// UNH_StoreTempOrigin.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_StoreTempOrigin = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [StoreTempOrigin]
 * @author Unhinged Developer
 * @base VisuMZ_1_SkillsStatesCore
 * @orderAfter VisuMZ_1_SkillsStatesCore
 *
 * @help
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * battler.unhGetOrigin(stateId);
 * - Returns the state origin object for the given State ID
 *
 * battler1.unhSetOrigin(stateId, battler2);
 * - Assigns the state origin object for the given State ID to battler2
 *
 * battler.unhClearOrigin(stateId);
 * - Assigns the state origin object for the given State ID to null
 */
//=============================================================================

const UNH_StoreTempOrigin = {};
UNH_StoreTempOrigin.pluginName = 'UNH_StoreTempOrigin';

if (!Imported.UNH_MiscFunc) {
  Game_Actor.prototype.object = function() {
    return $dataActors[this._actorId];
  };
  Game_Enemy.prototype.object = function() {
    return $dataEnemies[this._enemyId];
  };
}

Game_Battler.prototype.unhInitOrigin = function() {
  this._unhOri = [];
  for (i = 0; i < $dataStates.length; i++) {
    this._unhOri[i] = null;
  }
};

Game_Battler.prototype.unhGetOrigin = function(stateId) {
  if (stateId < 1) return null;
  if (stateId >= $dataStates.length) return null;
  if (!this._unhOri) this.unhInitOrigin();
  if (!Array.isArray(this._unhOri)) this.unhInitOrigin();
  return this._unhOri[stateId];
};

Game_Battler.prototype.unhSetOrigin = function(stateId, battler) {
  if (stateId < 1) return;
  if (stateId >= $dataStates.length) return;
  if (!battler.object()) {
    this.unhClearOrigin(stateId);
    return;
  }
  if (!this._unhOri) this.unhInitOrigin();
  if (!Array.isArray(this._unhOri)) this.unhInitOrigin();
  const origObj = {
    battler:battler,
    object:battler.object(),
    params:[]
  };
  for (let i = 0; i < 8; i++) {
    origObj.params[i] = battler.param(i);
  }
  this._unhOri[stateId] = origObj;
};

Game_Battler.prototype.unhClearOrigin = function(stateId) {
  if (stateId < 1) return;
  if (stateId >= $dataStates.length) return;
  this._unhOri[stateId] = null;
};

UNH_StoreTempOrigin.Battler_onAdd = Game_Battler.prototype.onAddState
Game_Battler.prototype.onAddState = function(stateId) {
  UNH_StoreTempOrigin.Battler_onAdd.call(this, stateId);
  this.unhSetOrigin(stateId, this.getStateOrigin(stateId));
};
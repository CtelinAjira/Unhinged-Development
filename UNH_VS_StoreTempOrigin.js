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
 *
 * battler.unhGetMarkTarget(stateId);
 * - Returns the marked target object for the given State ID
 *
 * battler1.unhSetMarkTarget(stateId, battler2);
 * - Assigns the marked target object for the given State ID to battler2
 *
 * battler.unhClearMarkTarget(stateId);
 * - Assigns the marked target object for the given State ID to null
 *
 * ============================================================================
 * Return Objects
 * ============================================================================
 *
 * obj.battler
 * - Returns the actual battler stored
 *
 * obj.object
 * - Returns the stored battler's database object (Actor or Enemy)
 *
 * obj.params
 * - Returns the stored battler's param values as of storage
 *
 * obj.stateId
 * - Returns the state ID storing the battler in question
 */
//=============================================================================

const UNH_StoreTempOrigin = {};
UNH_StoreTempOrigin.pluginName = 'UNH_StoreTempOrigin';

UNH_StoreTempOrigin.hasPlugin = function(name) {
  return $plugins.some(function(plug) {
    if (!plug) return false;
    if (!plug.name) return false;
    if (!plug.status) return false;
    return plug.name === name;
  });
};

if (!UNH_StoreTempOrigin.hasPlugin('UNH_MiscFunc')) {
  Game_Actor.prototype.object = function() {
    return $dataActors[this._actorId];
  };
  Game_Enemy.prototype.object = function() {
    return $dataEnemies[this._enemyId];
  };
}

Game_Battler.prototype.unhInitMarks = function() {
  this._unhMarkTargets = [];
};

Game_Battler.prototype.unhGetMarkTarget = function(stateId) {
  if (stateId === undefined) return null;
  if (typeof stateId !== 'number') return null;
  if (isNaN(stateId) return null;
  if (stateId < 1) return null;
  if (stateId >= $dataStates.length) return null;
  if (!this._unhMarkTargets) this.unhInitMarks();
  if (!Array.isArray(this._unhMarkTargets)) this.unhInitMarks();
  const state = $dataStates[stateId];
  if (!state) return null;
  if (!state.meta) return null;
  if (!state.meta['Mark Target']) return null;
  if (this._unhMarkTargets[stateId] === undefined) return null;
  return this._unhMarkTargets[stateId];
};

Game_Battler.prototype.unhSetMarkTarget = function(stateId, battler) {
  if (stateId === undefined) return;
  if (typeof stateId !== 'number') return;
  if (isNaN(stateId) return;
  if (stateId < 1) return;
  if (stateId >= $dataStates.length) return;
  if (!battler.object()) {
    this.unhClearMarkTarget(stateId);
    return;
  }
  if (!this._unhMarkTargets) this.unhInitMarks();
  if (!Array.isArray(this._unhMarkTargets)) this.unhInitMarks();
  const state = $dataStates[stateId];
  if (!state) return;
  if (!state.meta) return;
  if (!state.meta['Mark Target']) return;
  const targObj = {
    battler:battler,
    object:battler.object(),
    params:[],
    stateId:stateId
  };
  for (let i = 0; i < 8; i++) {
    targObj.params[i] = battler.param(i);
  }
  this._unhMarkTargets[stateId] = targObj;
};

Game_Battler.prototype.unhClearMarkTarget = function(stateId) {
  if (stateId === undefined) return;
  if (typeof stateId !== 'number') return;
  if (isNaN(stateId) return;
  if (stateId < 1) return;
  if (stateId >= $dataStates.length) return;
  if (!this._unhMarkTargets) this.unhInitMarks();
  if (!Array.isArray(this._unhMarkTargets)) this.unhInitMarks();
  this._unhMarkTargets[stateId] = undefined;
};

Game_Battler.prototype.unhInitOrigin = function() {
  this._unhOri = [];
};

Game_Battler.prototype.unhGetOrigin = function(stateId) {
  if (stateId === undefined) return null;
  if (typeof stateId !== 'number') return null;
  if (isNaN(stateId) return null;
  if (stateId < 1) return null;
  if (stateId >= $dataStates.length) return null;
  if (!this._unhOri) this.unhInitOrigin();
  if (!Array.isArray(this._unhOri)) this.unhInitOrigin();
  if (this._unhOri[stateId] === undefined) return null;
  return this._unhOri[stateId];
};

Game_Battler.prototype.unhSetOrigin = function(stateId, battler) {
  if (stateId === undefined) return;
  if (typeof stateId !== 'number') return;
  if (isNaN(stateId) return;
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
    params:[],
    stateId:stateId
  };
  for (let i = 0; i < 8; i++) {
    origObj.params[i] = battler.param(i);
  }
  this._unhOri[stateId] = origObj;
};

Game_Battler.prototype.unhClearOrigin = function(stateId) {
  if (stateId < 1) return;
  if (stateId >= $dataStates.length) return;
  if (!this._unhOri) this.unhInitOrigin();
  if (!Array.isArray(this._unhOri)) this.unhInitOrigin();
  this._unhOri[stateId] = undefined;
};

UNH_StoreTempOrigin.Battler_onAdd = Game_Battler.prototype.onAddState;
Game_Battler.prototype.onAddState = function(stateId) {
  UNH_StoreTempOrigin.Battler_onAdd.call(this, stateId);
  const origin = this.getStateOrigin(stateId);
  this.unhSetOrigin(stateId, origin);
  origin.unhSetMarkTarget(stateId, this);
};

UNH_StoreTempOrigin.Battler_onRemove = Game_Battler.prototype.onRemoveState;
Game_Battler.prototype.onRemoveState = function (stateId) {
  const origin = this.getStateOrigin(stateId);
  this.unhClearOrigin(stateId, origin);
  origin.unhClearMarkTarget(stateId, this);
  UNH_StoreTempOrigin.Battler_onRemove.call(this, stateId);
};

UNH_StoreTempOrigin.Actor_clearStates = Game_Actor.prototype.clearStates;
Game_Actor.prototype.clearStates = function() {
  for (const state of this.states()) {
    const origin = this.getStateOrigin(state.id);
    this.unhClearOrigin(state.id, origin);
    origin.unhClearMarkTarget(state.id, this);
  }
  UNH_StoreTempOrigin.Actor_clearStates.call(this);
};

Game_Enemy.prototype.clearStates = function() {
  for (const state of this.states()) {
    const origin = this.getStateOrigin(state.id);
    this.unhClearOrigin(state.id, origin);
    origin.unhClearMarkTarget(state.id, this);
  }
  Game_BattlerBase.prototype.clearStates.call(this);
};
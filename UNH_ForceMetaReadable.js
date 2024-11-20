//=============================================================================
// Unhinged Development - Force Meta to be Readable
// UNH_ForceMetaReadable.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [ForceMetaReadable]
 * @author Unhinged Developer
 *
 * @help
 */
//=============================================================================

const UNH_ForceMetaReadable = {};
UNH_ForceMetaReadable.pluginName = 'UNH_ForceMetaReadable';

Object.defineProperty(Game_Actor.prototype, 'meta', {
    get: function() {
        return this.battlerMeta();
    },
    configurable: true
});

Object.defineProperty(Game_Enemy.prototype, 'meta', {
    get: function() {
        return this.battlerMeta();
    },
    configurable: true
});

Object.defineProperty(Game_Item.prototype, 'meta', {
    get: function() {
        return this.itemMeta();
    },
    configurable: true
});

Object.defineProperty(Game_Action.prototype, 'meta', {
    get: function() {
        return this.actionMeta();
    },
    configurable: true
});

UNH_ForceMetaReadable.concatMetadata = function(obj) {
  const meta = {};
  if (obj !== undefined) {
    if (obj !== null) {
      DataManager.extractMetadata(obj);
      for (const [key, value] of Object.entries(obj.meta)) {
        meta[key] = value;
      }
    }
  }
  return meta;
};

Game_BattlerBase.prototype.statesMeta = function() {
  const meta = Array($dataStates.length);
  for (const state of this.states()) {
    meta[state.id] = UNH_ForceMetaReadable.concatMetadata(state);
  }
  return meta;
};

Game_Enemy.prototype.battlerMeta = function() {
  const meta = {};
  meta['battler'] = UNH_ForceMetaReadable.concatMetadata(this.enemy());
  meta['class'] = {};
  meta['equips'] = {};
  meta['states'] = this.statesMeta();
  return meta;
};

Game_Actor.prototype.battlerMeta = function() {
  const meta = {};
  meta['battler'] = UNH_ForceMetaReadable.concatMetadata(this.actor());
  meta['class'] = UNH_ForceMetaReadable.concatMetadata(this.currentClass());
  equips = {};
  for (const equip of this.equips()) {
    equips[this.equips().indexOf(equip)] = equip.itemMeta();
  }
  meta['equips'] = equips;
  meta['states'] = this.statesMeta();
  return meta;
};

Game_Item.prototype.itemMeta = function() {
  return UNH_ForceMetaReadable.concatMetadata(this.object());
};

Game_Action.prototype.actionMeta = function() {
  const item = this.item();
  const user = this.subject();
  const meta = user.battlerMeta();
  meta['action'] = UNH_ForceMetaReadable.concatMetadata(item);
  return meta;
};

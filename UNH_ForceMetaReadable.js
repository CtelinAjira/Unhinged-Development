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
        return this.getMeta();
    },
    configurable: true
});

Object.defineProperty(Game_Enemy.prototype, 'meta', {
    get: function() {
        return this.getMeta();
    },
    configurable: true
});

Object.defineProperty(Game_Item.prototype, 'meta', {
    get: function() {
        return this.getMeta();
    },
    configurable: true
});

Object.defineProperty(Game_Action.prototype, 'meta', {
    get: function() {
        return this.getMeta();
    },
    configurable: true
});

UNH_ForceMetaReadable.concatMetadata = function(obj, meta) {
  if (meta === undefined || meta === null || typeof meta !== 'object') meta = {};
  if (obj !== undefined) {
    if (obj !== null) {
      DataManager.extractMetadata(obj);
      for (const [key, value] of Object.entries(obj.meta)) {
        if (meta[key] !== undefined) {
          if (typeof meta[key] === 'number') {
            meta[key] += value;
          } else {
            meta[key] = value;
          }
        } else {
          meta[key] = value;
        }
      }
    }
  }
  return meta;
};

Game_BattlerBase.prototype.getMeta = function(meta) {
  if (meta === undefined || meta === null || typeof meta !== 'object') meta = {};
  for (const state of this.states()) {
    meta = UNH_ForceMetaReadable.concatMetadata(state, meta);
  }
  return meta;
};

Game_Enemy.prototype.getMeta = function(meta) {
  if (meta === undefined || meta === null || typeof meta !== 'object') meta = {};
  meta = UNH_ForceMetaReadable.concatMetadata(this.enemy(), meta);
  return Game_BattlerBase.prototype.getMeta.call(this, meta);
};

Game_Actor.prototype.getMeta = function(meta) {
  if (meta === undefined || meta === null || typeof meta !== 'object') meta = {};
  meta = UNH_ForceMetaReadable.concatMetadata(this.actor(), meta);
  meta = UNH_ForceMetaReadable.concatMetadata(this.currentClass(), meta);
  for (const equip of this.equips()) {
    meta = UNH_ForceMetaReadable.concatMetadata(equip, meta);
  }
  return Game_BattlerBase.prototype.getMeta.call(this, meta);
};

Game_Item.prototype.getMeta = function(meta) {
  if (meta === undefined || meta === null || typeof meta !== 'object') meta = {};
  const item = this.object();
  if (item !== null) {
    meta = UNH_ForceMetaReadable.concatMetadata(item, meta);
  }
  return meta;
};

Game_Action.prototype.getMeta = function(meta) {
  if (meta === undefined || meta === null || typeof meta !== 'object') meta = {};
  const item = this.item();
  if (item !== null) {
    meta = UNH_ForceMetaReadable.concatMetadata(item, meta);
  }
  return meta;
};

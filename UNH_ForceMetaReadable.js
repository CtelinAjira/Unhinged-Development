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

UNH_ForceMetaReadable.Actors_actor = Game_Actors.prototype.actor;
Game_Actors.prototype.actor = function(actorId) {
  const actor = UNH_ForceMetaReadable.Actors_actor.call(this, actorId);
  if (actor !== null) {
    if (!$dataActors[actorId].meta) {
      DataManager.extractMetadata($dataActors[actorId]);
      actor.meta = {};
      for (const [key, value] of Object.entries($dataActors[actorId].meta)) {
        actor.meta[key] = value;
      }
    }
  }
  return actor;
};

UNH_ForceMetaReadable.Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function(advantageous) {
  UNH_ForceMetaReadable.Battler_onBattleStart.call(this, advantageous);
  if (this.isEnemy()) {
    if (!this.enemy().meta) {
      DataManager.extractMetadata(this.enemy());
      this.meta = {};
      for (const [key, value] of Object.entries(this.enemy().meta)) {
        this.meta[key] = value;
      }
    }
  }
};

UNH_ForceMetaReadable.Item_setObject = Game_Item.prototype.setObject;
Game_Item.prototype.setObject = function(item) {
  UNH_ForceMetaReadable.Item_setObject.call(this, item);
  if (item) {
    if (!item.meta) {
      DataManager.extractMetadata(item);
      this.meta = {};
      for (const [key, value] of Object.entries(item.meta)) {
        this.meta[key] = value;
      }
    }
  }
};

UNH_ForceMetaReadable.Item_setEquip = Game_Item.prototype.setEquip;
Game_Item.prototype.setEquip = function(isWeapon, itemId) {
  UNH_ForceMetaReadable.Item_setEquip.call(this, isWeapon, itemId);
  const item = isWeapon ? $dataWeapons[itemId] : $dataArmors[itemId];
  if (item) {
    if (!item.meta) {
      DataManager.extractMetadata(item);
      this.meta = {};
      for (const [key, value] of Object.entries(item.meta)) {
        this.meta[key] = value;
      }
    }
  }
};

UNH_ForceMetaReadable.Action_setItem = Game_Action.prototype.setItem;
Game_Action.prototype.setItem = function(itemId) {
  UNH_ForceMetaReadable.Action_setItem.call(this, itemId);
  const item = $dataItems[itemId];
  if (item) {
    if (!item.meta) {
      DataManager.extractMetadata(item);
      this.meta = {};
      for (const [key, value] of Object.entries(item.meta)) {
        this.meta[key] = value;
      }
    }
  }
};

UNH_ForceMetaReadable.Action_setSkill = Game_Action.prototype.setSkill;
Game_Action.prototype.setSkill = function(skillId) {
  UNH_ForceMetaReadable.Action_setSkill.call(this, skillId);
  const item = $dataSkills[skillId];
  if (item) {
    if (!item.meta) {
      DataManager.extractMetadata(item);
      this.meta = {};
      for (const [key, value] of Object.entries(item.meta)) {
        this.meta[key] = value;
      }
    }
  }
};

UNH_ForceMetaReadable.Action_setItemObject = Game_Action.prototype.setItemObject;
Game_Action.prototype.setItemObject = function(object) {
  UNH_ForceMetaReadable.Action_setItemObject.call(this, object);
  if (object) {
    if (!object.meta) {
      DataManager.extractMetadata(object);
      this.meta = {};
      for (const [key, value] of Object.entries(object.meta)) {
        this.meta[key] = value;
      }
    }
  }
};
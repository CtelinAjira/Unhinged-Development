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
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * unit.unitMeta();
 * - Returns an array with each member's metadata object
 *
 * battler.battlerMeta();
 * - Returns an object with that battler's metadata
 *
 * item.itemMeta();
 * - Returns an object with that item's metadata
 *
 * action.actionMeta();
 * - Returns an object with that action's metadata, plus that of its user
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * For enemies, you can use notetags to treat them as having equipment.  You 
 * will need to tag them with <X:Y>, where X is the name of the equipment slot 
 * within the database, and Y is the weapon or armor ID within the database.
 *
 * Giving the Dual Wield trait to a tagged enemy will change the shield tag to 
 * another weapon.
 */
//=============================================================================

const UNH_ForceMetaReadable = {};
UNH_ForceMetaReadable.pluginName = 'UNH_ForceMetaReadable';

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

Game_Unit.prototype.unitMeta = function() {
  const meta = [];
  for (const member of this.members()) {
    meta.push(member.battlerMeta());
  }
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
  const equipObj = {};
  let equip;
  for (let i = 1; i <= 7; i++) {
    slotName = $gameSystem.equipTypes[i];
    let eqpEval;
    if (!this.enemy().meta) {
      equipObj[slotName] = {};
    } else if (!this.enemy().meta[slotName]) {
      equipObj[slotName] = {};
    } else {
      try {
        eqpEval = Function('return ' + String(this.enemy().meta[slotName]));
        const eqpId = eqpEval();
        if (i === 1) {
          equip = $dataWeapons[eqpId];
        } else if (i === 2 && this.isDualWield()) {
          equip = $dataWeapons[eqpId];
        } else {
          equip = $dataArmors[eqpId];
        }
        equipObj[slotName] = equip.itemMeta();
      } catch (e) {
        equipObj[slotName] = {};
      }
    }
  }
  meta['equips'] = equipObj;
  meta['states'] = this.statesMeta();
  return meta;
};

Game_Actor.prototype.battlerMeta = function() {
  const meta = {};
  meta['battler'] = UNH_ForceMetaReadable.concatMetadata(this.actor());
  meta['class'] = UNH_ForceMetaReadable.concatMetadata(this.currentClass());
  const equipObj = {};
  const equips = this.equips();
  let equip;
  let slotName;
  for (let i = 0; i < equips.length; i++) {
    equip = equips[i];
    slotName = $gameSystem.equipTypes[i+1];
    if (!!equip) {
      equipObj[slotName] = equip.itemMeta();
	} else {
      equipObj[slotName] = {};
    }
  }
  meta['equipment'] = equipObj;
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

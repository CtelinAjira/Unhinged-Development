//=============================================================================
// Unhinged Development - Multiple Inventories
// UNH_MultiInventory.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter VisuMZ_0_CoreEngine
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [MultiInventory]
 * @author Unhinged Developer
 *
 * @param InitInv
 * @text Starting Inventories
 * @desc Create starting inventories for the groups
 * @type struct<Inventory>[]
 *
 * @command StoreInventory
 * @text Store Inventory
 * @desc Stores the current party's inventory
 * 
 * @arg SlotID
 * @text Slot ID
 * @desc Store in this party ID
 * @type number
 * @min 0
 * @default 0
 * 
 * @arg MoveOrCopy
 * @text Move Or Copy?
 * @desc Do you wish to keep this inventory after saving?
 * @type boolean
 * @on Copy
 * @off Move
 * @default false
 *
 * @command LoadInventory
 * @text Load Inventory
 * @desc Loads another party's inventory
 * 
 * @arg SlotID
 * @text Slot ID
 * @desc Load from this party ID
 * @type number
 * @min 0
 * @default 0
 * 
 * @arg MergeOrReplace
 * @text Merge Or Replace?
 * @desc Do you wish to merge the two inventories?
 * @type boolean
 * @on Merge
 * @off Replace
 * @default false
 *
 * @command ResetInventory
 * @text Reset Inventory
 * @desc Clears a stored inventory
 * 
 * @arg SlotID
 * @text Slot ID
 * @desc Reset at this party ID
 * @type number
 * @min 0
 * @default 0
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Have you ever wanted a game to have multiple parties?  Aggravated that they 
 * all share a single inventory between them?  This plugin is your answer - you 
 * can store and load any number of separate inventories, load them back on the 
 * fly, or even merge them!
 * 
 * Just be warned: item maximums are respected when merging inventories.
 */
/*~struct~Inventory:
 *
 * @param Items
 * @text Items
 * @type struct<ItemObj>[]
 *
 * @param Weapons
 * @text Weapons
 * @type struct<WeaponObj>[]
 *
 * @param Armors
 * @text Armors
 * @type struct<ArmorObj>[]
 *
 * @param Gold
 * @text Currency
 * @type number
 * @default 0
 * @min 0
 */
/*~struct~ItemObj:
 *
 * @param ItemID
 * @text Item
 * @type item
 *
 * @param Count
 * @text Count
 * @type number
 * @default 1
 * @min 1
 */
/*~struct~WeaponObj:
 *
 * @param WeaponID
 * @text Weapon
 * @type weapon
 *
 * @param Count
 * @text Count
 * @type number
 * @default 1
 * @min 1
 */
/*~struct~ArmorObj:
 *
 * @param ArmorID
 * @text Armor
 * @type armor
 *
 * @param Count
 * @text Count
 * @type number
 * @default 1
 * @min 1
 */
//=============================================================================

const UNH_MultiInventory = {};
UNH_MultiInventory.pluginName = 'UNH_MultiInventory';
UNH_MultiInventory.parameters = PluginManager.parameters(UNH_MultiInventory.pluginName);
UNH_MultiInventory.InitInv = JSON.parse(UNH_MultiInventory.parameters['InitInv'] || []).map(function(entry) {
  return JSON.parse(entry);
});
for (let i = 0; i < UNH_MultiInventory.InitInv.length; i++) {
  UNH_MultiInventory.InitInv[i].SlotID = i;
}

PluginManager.registerCommand(UNH_MultiInventory.pluginName, "StoreInventory", function(args) {
  const slotId = Number(args.SlotID);
  const copy = eval(args.MoveOrCopy);
  $gameParty.storeInventory(slotId, copy);
});

PluginManager.registerCommand(UNH_MultiInventory.pluginName, "LoadInventory", function(args) {
  const slotId = Number(args.SlotID);
  const merge = eval(args.MergeOrReplace);
  $gameParty.loadInventory(slotId, merge);
});

PluginManager.registerCommand(UNH_MultiInventory.pluginName, "ResetInventory", function(args) {
  const slotId = Number(args.SlotID);
  $gameParty.resetInventory(slotId);
});

UNH_MultiInventory.Party_initAllItems = Game_Party.prototype.initAllItems;
Game_Party.prototype.initAllItems = function(id) {
  if (id === undefined) id = 0;
  UNH_MultiInventory.Party_initAllItems.call(this);
  if (id >= 0) {
    this.loadInventory(id);
  }
};

Game_Party.prototype.defaultInventory = function() {
  return {
    items:{},
    weapons:{},
    armors:{},
    gold:0
  };
};

Game_Party.prototype.paramInventory = function(id) {
  if (!UNH_MultiInventory.InitInv[id]) return this.defaultInventory();
  const inventory = UNH_MultiInventory.InitInv[id];
  const tempInv = {
    items:{},
    weapons:{},
    armors:{},
    gold:Number(inventory.Gold);
  };
  for (const item of inventory.Items) {
    tempInv.items[item.ItemID] = Number(item.Count);
  }
  for (const item of inventory.Weapons) {
    tempInv.items[item.WeaponID] = Number(item.Count);
  }
  for (const item of inventory.Armors) {
    tempInv.items[item.ArmorID] = Number(item.Count);
  }
  return tempInv;
};

Game_Party.prototype.multiParamInventory = function() {
  if (!this._invSlots) this._invSlots = [];
  if (!Array.isArray(this._invSlots)) this._invSlots = [];
  for (const inventory of UNH_MultiInventory.InitInv) {
    if (!this._invSlots[inventory.SlotID]) {
      this.setInvSlot(inventory.SlotID, this.paramInventory(inventory.SlotID));
    }
  }
};

Game_Party.prototype.initInvStorage = function(id) {
  if (!this._invSlots) this._invSlots = [];
  if (!Array.isArray(this._invSlots)) this._invSlots = [];
  if (id === undefined) this.multiParamInventory();
  if (typeof id !== 'number') this.multiParamInventory();
  if (isNaN(id)) this.multiParamInventory();
  if (id < 0) this.multiParamInventory();
  this.setInvSlot(id, this.paramInventory(id));
};

Game_Party.prototype.getInvSlot = function(id) {
  this.initInvStorage();
  if (id === undefined) return this.defaultInventory();
  if (typeof id !== 'number') return this.defaultInventory();
  if (isNaN(id)) return this.defaultInventory();
  if (id < 0) return this.defaultInventory();
  if (!this._invSlots[id]) this._invSlots[id] = this.defaultInventory();
  return this._invSlots[id];
};

Game_Party.prototype.setInvSlot = function(id, obj) {
  this.initInvStorage();
  if (id === undefined) return;
  if (typeof id !== 'number') return;
  if (isNaN(id)) return;
  if (id < 0) return;
  this._invSlots[id] = obj;
};

Game_Party.prototype.loadInventory = function(slotId, merge) {
  const tempInv = this.getInvSlot(slotId);
  if (!!merge) {
    let item, sum;
    for (const key of Object.keys(tempInv.items)) {
      item = $dataItems[key];
      sum = tempInv.items[key];
      if (!!$gameParty._items[key]) sum += $gameParty._items[key];
      $gameParty._items[key] = Math.min(sum, $gameParty.maxItems(item));
	}
    for (const key of Object.keys(tempInv.weapons)) {
      item = $dataWeapons[key];
      sum = tempInv.weapons[key];
      if (!!$gameParty._weapons[key]) sum += $gameParty._weapons[key];
      $gameParty._weapons[key] = Math.min(sum, $gameParty.maxItems(item));
	}
    for (const key of Object.keys(tempInv.armors)) {
      item = $dataArmors[key];
      sum = tempInv.armors[key];
      if (!!$gameParty._armors[key]) sum += $gameParty._armors[key];
      $gameParty._armors[key] = Math.min(sum, $gameParty.maxItems(item));
	}
    $gameParty.gainGold(tempInv._gold);
  } else {
    $gameParty._items = Object.assign({}, tempInv.items);
    $gameParty._weapons = Object.assign({}, tempInv.weapons);
    $gameParty._armors = Object.assign({}, tempInv.armors);
    $gameParty._gold = tempInv.gold;
  }
};

Game_Party.prototype.storeInventory = function(slotId, copy) {
  const tempInv = {
    items:this._items,
    weapons:this._weapons,
    armors:this._armors,
    gold:$gameParty._gold
  };
  this.setInvSlot(tempInv);
  if (!copy) {
    $gameParty.initAllItems(-1);
    $gameParty._gold = 0;
  }
};

Game_Party.prototype.resetInventory = function(slotId) {
  this.setInvSlot(this.defaultInventory());
};
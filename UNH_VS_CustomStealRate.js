//=============================================================================
// Unhinged Development - VS Steal Items: Custom Steal Rate
// UNH_VS_CustomStealRate.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_CustomStealRate]
 * @author Unhinged Developer
 * @base VisuMZ_3_StealItems
 * @orderAfter VisuMZ_3_StealItems
 *
 * @param CustomStealRate
 * @text Custom Steal Rate
 * @desc New return value for Steal Rate
 * Variables: action, user, target, note
 * @type string
 * @default user.stealRate()
 *
 * @param CustomStealPlus
 * @text Custom Steal Plus
 * @desc New return value for Steal Plus vs Steal Resist
 * Variables: action, user, target, note
 * @type string
 * @default user.stealPlus() - target.stealResist()
 *
 * @help
 */
//=============================================================================

const UNH_VS_CustomStealRate = {};
UNH_VS_CustomStealRate.pluginName = 'UNH_VS_CustomStealRate';
UNH_VS_CustomStealRate.parameters = PluginManager.parameters(UNH_VS_CustomStealRate.pluginName);
UNH_VS_CustomStealRate.CustomStealRate = String(UNH_VS_CustomStealRate.parameters['CustomStealRate'] || "");
UNH_VS_CustomStealRate.CustomStealPlus = String(UNH_VS_CustomStealRate.parameters['CustomStealPlus'] || "");

VisuMZ.StealItems.DetermineStealData = function (action, target) {
  let customStealRate = 'user.stealRate()';
  if (!!UNH_VS_CustomStealRate.CustomStealRate) customStealRate = UNH_VS_CustomStealRate.CustomStealRate;
  let customStealPlus = 'user.stealPlus() - target.stealResist()';
  if (!!UNH_VS_CustomStealRate.CustomStealPlus) customStealPlus = UNH_VS_CustomStealRate.CustomStealPlus;
  const stealObj = VisuMZ.StealItems.RegExp;
  const note = action.item().note;
  const user = action.subject();
  const stealRateEval = eval(customStealRate);
  const stealPlusEval = eval(customStealPlus);
  let types = [];
  let stealRate = {
    'all': stealRateEval,
    'gold': 1,
    'item': 1,
    'weapon': 1,
    'armor': 1
  };
  let stealChange = {
    'all': stealPlusFunc(action, action.subject(), target),
    'gold': 0,
    'item': 0,
    'weapon': 0,
    'armor': 0
  };
  if (note.match(stealObj.StealAction1)) {
    types = ["GOLD", "ITEM", "WEAPON", "ARMOR"];
  }
  const stealSpecific = note.match(stealObj.StealAction2);
  if (stealSpecific) {
    for (const steal of stealSpecific) {
      if (!steal) {
        continue;
      }
      if (steal.match(/ALL/i)) {
        types = ['GOLD', "ITEM", "WEAPON", 'ARMOR'];
        if (steal.match(/([\+\-]\d+)([%％])/i)) {
          stealChange.all += Number(RegExp.$1) * 0.01;
        } else if (steal.match(/(\d+)([%％])/i)) {
          stealRate.all *= Number(RegExp.$1) * 0.01;
        }
      }
      if (steal.match(/GOLD/i)) {
        types.push("GOLD");
        if (steal.match(/([\+\-]\d+)([%％])/i)) {
          stealChange.gold += Number(RegExp.$1) * 0.01;
        } else if (steal.match(/(\d+)([%％])/i)) {
          stealRate.gold *= Number(RegExp.$1) * 0.01;
        }
      }
      if (steal.match(/ITEM/i)) {
        types.push("ITEM");
        if (steal.match(/([\+\-]\d+)([%％])/i)) {
          stealChange.item += Number(RegExp.$1) * 0.01;
        } else if (steal.match(/(\d+)([%％])/i)) {
          stealRate.item *= Number(RegExp.$1) * 0.01;
        }
      }
      if (steal.match(/WEAPON/i)) {
        types.push("WEAPON");
        if (steal.match(/([\+\-]\d+)([%％])/i)) {
          stealChange.weapon += Number(RegExp.$1) * 0.01;
        } else if (steal.match(/(\d+)([%％])/i)) {
          stealRate.weapon *= Number(RegExp.$1) * 0.01;
        }
      }
      if (steal.match(/ARMOR/i)) {
        types.push("ARMOR");
        if (steal.match(/([\+\-]\d+)([%％])/i)) {
          stealChange.armor += Number(RegExp.$1) * 0.01;
        } else if (steal.match(/(\d+)([%％])/i)) {
          stealRate.armor *= Number(RegExp.$1) * 0.01;
        }
      }
    }
  }
  let key = VisuMZ.StealItems.createKeyJS(action.item(), "JsStealRate");
  if (VisuMZ.StealItems.JS[key]) {
    stealRate.all = VisuMZ.StealItems.JS[key].call(action, action.subject(), target, stealRate.all);
  }
  key = VisuMZ.StealItems.createKeyJS(action.item(), 'JsStealRateGold');
  if (VisuMZ.StealItems.JS[key]) {
    stealRate.gold = VisuMZ.StealItems.JS[key].call(action, action.subject(), target, 1);
  }
  key = VisuMZ.StealItems.createKeyJS(action.item(), "JsStealRateItem");
  if (VisuMZ.StealItems.JS[key]) {
    stealRate.item = VisuMZ.StealItems.JS[key].call(action, action.subject(), target, 1);
  }
  key = VisuMZ.StealItems.createKeyJS(action.item(), "JsStealRateWeapon");
  if (VisuMZ.StealItems.JS[key]) {
    stealRate.weapon = VisuMZ.StealItems.JS[key].call(action, action.subject(), target, 1);
  }
  key = VisuMZ.StealItems.createKeyJS(action.item(), "JsStealRateArmor");
  if (VisuMZ.StealItems.JS[key]) {
    stealRate.armor = VisuMZ.StealItems.JS[key].call(action, action.subject(), target, 1);
  }
  return {
    'types': types,
    'rate': stealRate,
    'plus': stealChange
  };
};

UNH_VS_CustomStealRate.Enemy_gold = Game_Enemy.prototype.gold;
Game_Enemy.prototype.gold = function() {
  let retVal = UNH_VS_CustomStealRate.Enemy_gold.call(this);
  let hasGold = 2;
  if ($gameParty.hasGoldDouble()) hasGold = 1;
  retVal += (this.unhStolenGold() / hasGold);
  return retVal;
};

Game_Enemy.prototype.unhStolenGold = function() {
  if (this._unhStolenGold === undefined) this._unhStolenGold = 0;
  if (typeof this._unhStolenGold !== 'number') this._unhStolenGold = 0;
  return this._unhStolenGold;
};

Game_Enemy.prototype.unhStealGold = function(value) {
  if (!!value) return;
  if (this._unhStolenGold === undefined) this._unhStolenGold = 0;
  if (typeof this._unhStolenGold !== 'number') this._unhStolenGold = 0;
  this._unhStolenGold += value;
};

Game_Enemy.prototype.unhInitStolenItems = function () {
  this._unhStolenItems = [];
};

Game_Enemy.prototype.unhStolenItems = function(index) {
  if (this._unhStolenItems === undefined) this.unhInitStolenItems();
  if (!Array.isArray(this._unhStolenItems)) this.unhInitStolenItems();
  if (!index) return this._unhStolenItems;
  if (typeof index !== 'number') return this._unhStolenItems;
  if (isNaN(index)) return this._unhStolenItems;
  return this._unhStolenItems[index];
};

Game_Enemy.prototype.unhStealRandom = function(type) {
  if (!type) type = 'ITEM';
  if (typeof type !== 'string') type = 'ITEM';
  type = type.toUpperCase();
  let text = '';
  const successRate = 0.50;
  if (Math.random() < successRate) {
    const items = [];
    const total = $gameParty.items().length;
    for (let i = 0; i < total; ++i) {
      let itemType = 0;
      let isItem, list;
      if (type === 'WEAPON') {
        list = $gameParty.weapons();
        isItem = false;
      } else if (type === 'ARMOR') {
        list = $gameParty.armors();
        isItem = false;
      } else {
        list = $gameParty.items();
        isItem = true;
      }
      const currentItem = list[i];
      if (!!isItem) itemType = currentItem.itypeId;
      if (itemType !== 2) {
        items.push(currentItem);
      }
    }
    if (items.length > 0) {
      const random = Math.floor(Math.random() * items.length);
      const currentItem = items[random];
      $gameParty.loseItem(currentItem, 1);
      if (VisuMZ.StealItems.Settings.BattleLog.ShowMessages) text = VisuMZ.StealItems.Settings.BattleLog.StealItem;
      user.unhStealItem(currentItem, type);
    } else {
      if (VisuMZ.StealItems.Settings.BattleLog.ShowMessages) text = VisuMZ.StealItems.Settings.BattleLog.StealEmpty;
    }
  } else {
    if (VisuMZ.StealItems.Settings.BattleLog.ShowMessages) text = VisuMZ.StealItems.Settings.BattleLog.StealFail;
  }
  text = '<CENTER>' + text;
  const logWindow = SceneManager._scene._logWindow;
  logWindow.addStealText(text);
};

Game_Enemy.prototype.unhStealItem = function (item, type) {
  if (this._unhStolenItems === undefined) this.unhInitStolenItems();
  if (!Array.isArray(this._unhStolenItems)) this.unhInitStolenItems();
  if (DataManager.isItem(item)) return;
  let dropRate = 0.50;
  if ($gameParty.hasDropItemDouble()) dropRate = 1;
  const itemObj = {
    'type': type.toUpperCase(),
    'id': item.id,
    'rate': dropRate,
    'stolen': false,
    'drop': true
  };
  this._unhStolenItems.push(itemObj);
  this._stealableItems.push(itemObj);
};
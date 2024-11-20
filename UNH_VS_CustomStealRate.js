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
 * @desc New calculation for Steal Rate
 * @type note
 * @default "const action = arguments[0];\nconst user = arguments[1];\nconst target = arguments[2];\n\nreturn user.stealRate();"
 *
 * @param CustomStealPlus
 * @text Custom Steal Plus
 * @desc New calculation for Steal Plus vs Steal Resist
 * @type note
 * @default "const action = arguments[0];\nconst user = arguments[1];\nconst target = arguments[2];\n\nreturn user.stealPlus() - target.stealResist();"
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
  const stealObj = VisuMZ.StealItems.RegExp;
  const note = action.item().note;
  const stealRateFunc = new Function(((!!UNH_VS_CustomStealRate.CustomStealRate) ? UNH_VS_CustomStealRate.CustomStealRate : 'return user.stealRate()'));
  const stealPlusFunc = new Function(((!!UNH_VS_CustomStealRate.CustomStealPlus) ? UNH_VS_CustomStealRate.CustomStealPlus : 'return user.stealPlus() - target.stealResist()'));
  let types = [];
  let stealRate = {
    'all': stealRateFunc(action, action.subject(), target),
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
  if (retVal === 0) return retVal;
  return retVal + (this.unhStolenGold() / ($gameParty.hasGoldDouble() ? 2 : 1));
};

Game_Enemy.prototype.unhStolenGold = function() {
  if (this._unhStolenGold === undefined) this._unhStolenGold = 0;
  if (typeof this._unhStolenGold !== 'number') this._unhStolenGold = 0;
  this._unhStolenGold += value;
};

Game_Enemy.prototype.unhStealGold = function(value) {
  if (!!value) return;
  if (this._unhStolenGold === undefined) this._unhStolenGold = 0;
  if (typeof this._unhStolenGold !== 'number') this._unhStolenGold = 0;
  this._unhStolenGold += value;
};
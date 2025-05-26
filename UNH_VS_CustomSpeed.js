//=============================================================================
// Unhinged Development - VS ATB: Custom Speed
// UNH_VS_CustomSpeed.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_CustomSpeed]
 * @author Unhinged Developer
 * @base VisuMZ_2_BattleSystemATB
 * @orderAfter VisuMZ_2_BattleSystemATB
 *
 * @param AfterAtbCode
 * @text After ATB Code
 * @desc The code to run for <ATB After Gauge: x%>
 * @type note
 * @default "if (!this.item()) {\n  return;\n}\nif (!BattleManager.isATB()) {\n  return;\n}\nlet atbAfter = 0;\nif (this._forcing) {\n  atbAfter = this.subject()._tpbChargeTime;\n}\nconst atbAfterJs = VisuMZ.BattleSystemATB.createKeyJS(this.item(), \"After\");\nif (VisuMZ.BattleSystemATB.JS[atbAfterJs]) {\n  atbAfter = VisuMZ.BattleSystemATB.JS[atbAfterJs].call(this, this.subject(), this.subject());\n}\nlet speed = this.item().speed > 0 ? this.item().speed : 0;\nif (this.isAttack()) {\n  speed += this.subject().attackSpeed();\n}\natbAfter += (speed / 4000).clamp(0, 1);\nif (this.item().note.match(/<(?:ATB|TPB) AFTER (?:GAUGE|TIME|SPEED):[ ](\\d+)([%％])>/i)) {\n  atbAfter = Number(RegExp.$1) * 0.01;\n}\nconst traitsAndSkills = this.subject().traitObjects().concat(this.subject().skills());\nconst atbAfterPlusNote = /<(?:ATB|TPB) AFTER (?:GAUGE|TIME|SPEED):[ ]([\\+\\-]\\d+)([%％])>/i;\nconst atbAfterObjects = traitsAndSkills.map(obj => obj && obj.note.match(atbAfterPlusNote) ? Number(RegExp.$1) * 0.01 : 0);\natbAfter = atbAfterObjects.reduce((r, atbToAdd) => r + atbToAdd, atbAfter);\nif (this.item().note.match(/<(?:ATB|TPB) INSTANT>/i)) {\n  atbAfter = 10;\n}\nthis.subject().setAtbAfterSpeed(atbAfter);"
 *
 * @help
 */
//=============================================================================

const UNH_VS_CustomSpeed = {};
UNH_VS_CustomSpeed.pluginName = 'UNH_VS_CustomSpeed';
UNH_VS_CustomSpeed.parameters = PluginManager.parameters(UNH_VS_CustomSpeed.pluginName);
UNH_VS_CustomSpeed.AfterAtbCode = UNH_VS_CustomSpeed.parameters['AfterAtbCode'] || "";
UNH_VS_CustomSpeed.AfterAtbMod = !!UNH_VS_CustomSpeed.AfterAtbCode;
UNH_VS_CustomSpeed.AfterAtbFunc = new Function(UNH_VS_CustomSpeed.AfterAtbCode);

UNH_VS_CustomSpeed.Action_applyGlobalBattleSystemATBEffects = Game_Action.prototype.applyGlobalBattleSystemATBEffects;
Game_Action.prototype.applyGlobalBattleSystemATBEffects = function () {
  if (!UNH_VS_CustomSpeed.AfterAtbMod) {
    UNH_VS_CustomSpeed.Action_applyGlobalBattleSystemATBEffects.call(this);
  } else {
    UNH_VS_CustomSpeed.AfterAtbFunc.call(this);
  }
};
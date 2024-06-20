//=============================================================================
// Unhinged Development - Buff/Debuff Icons
// UNH_BuffIcons.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [BuffIcons]
 * @author Unhinged Developer
 *
 * @param HPBuffIcon1
 * @text HP Buff Icon (Lv1)
 * @desc The icon for 1 stack of HP Buff
 * @type number
 * @default 0
 *
 * @param HPBuffIcon2
 * @text HP Buff Icon (Lv2)
 * @desc The icon for 2 stacks of HP Buff
 * @type number
 * @default 0
 *
 * @param HPDebuffIcon1
 * @text HP Debuff Icon (Lv1)
 * @desc The icon for 1 stack of HP Debuff
 * @type number
 * @default 0
 *
 * @param HPDebuffIcon2
 * @text HP Debuff Icon (Lv2)
 * @desc The icon for 2 stacks of HP Debuff
 * @type number
 * @default 0
 *
 * @param MPBuffIcon1
 * @text MP Buff Icon (Lv1)
 * @desc The icon for 1 stack of MP Buff
 * @type number
 * @default 0
 *
 * @param MPBuffIcon2
 * @text MP Buff Icon (Lv2)
 * @desc The icon for 2 stacks of MP Buff
 * @type number
 * @default 0
 *
 * @param MPDebuffIcon1
 * @text MP Debuff Icon (Lv1)
 * @desc The icon for 1 stack of MP Debuff
 * @type number
 * @default 0
 *
 * @param MPDebuffIcon2
 * @text MP Debuff Icon (Lv2)
 * @desc The icon for 2 stacks of MP Debuff
 * @type number
 * @default 0
 *
 * @param ATKBuffIcon1
 * @text ATK Buff Icon (Lv1)
 * @desc The icon for 1 stack of ATK Buff
 * @type number
 * @default 0
 *
 * @param ATKBuffIcon2
 * @text ATK Buff Icon (Lv2)
 * @desc The icon for 2 stacks of ATK Buff
 * @type number
 * @default 0
 *
 * @param ATKDebuffIcon1
 * @text ATK Debuff Icon (Lv1)
 * @desc The icon for 1 stack of ATK Debuff
 * @type number
 * @default 0
 *
 * @param ATKDebuffIcon2
 * @text ATK Debuff Icon (Lv2)
 * @desc The icon for 2 stacks of ATK Debuff
 * @type number
 * @default 0
 *
 * @param DEFDEFBuffIcon1
 * @text DEF Buff Icon (Lv1)
 * @desc The icon for 1 stack of DEF Buff
 * @type number
 * @default 0
 *
 * @param DEFBuffIcon2
 * @text DEF Buff Icon (Lv2)
 * @desc The icon for 2 stacks of DEF Buff
 * @type number
 * @default 0
 *
 * @param DEFDebuffIcon1
 * @text DEF Debuff Icon (Lv1)
 * @desc The icon for 1 stack of DEF Debuff
 * @type number
 * @default 0
 *
 * @param DEFDebuffIcon2
 * @text DEF Debuff Icon (Lv2)
 * @desc The icon for 2 stacks of DEF Debuff
 * @type number
 * @default 0
 *
 * @param MATDEFBuffIcon1
 * @text MAT Buff Icon (Lv1)
 * @desc The icon for 1 stack of MAT Buff
 * @type number
 * @default 0
 *
 * @param MATBuffIcon2
 * @text MAT Buff Icon (Lv2)
 * @desc The icon for 2 stacks of MAT Buff
 * @type number
 * @default 0
 *
 * @param MATDebuffIcon1
 * @text MAT Debuff Icon (Lv1)
 * @desc The icon for 1 stack of MAT Debuff
 * @type number
 * @default 0
 *
 * @param MATDebuffIcon2
 * @text MAT Debuff Icon (Lv2)
 * @desc The icon for 2 stacks of MAT Debuff
 * @type number
 * @default 0
 *
 * @param MDFBuffIcon1
 * @text MDF Buff Icon (Lv1)
 * @desc The icon for 1 stack of MDF Buff
 * @type number
 * @default 0
 *
 * @param MDFBuffIcon2
 * @text MDF Buff Icon (Lv2)
 * @desc The icon for 2 stacks of MDF Buff
 * @type number
 * @default 0
 *
 * @param MDFDebuffIcon1
 * @text MDF Debuff Icon (Lv1)
 * @desc The icon for 1 stack of MDF Debuff
 * @type number
 * @default 0
 *
 * @param MDFDebuffIcon2
 * @text MDF Debuff Icon (Lv2)
 * @desc The icon for 2 stacks of MDF Debuff
 * @type number
 * @default 0
 *
 * @param AGIBuffIcon1
 * @text AGI Buff Icon (Lv1)
 * @desc The icon for 1 stack of AGI Buff
 * @type number
 * @default 0
 *
 * @param AGIBuffIcon2
 * @text AGI Buff Icon (Lv2)
 * @desc The icon for 2 stacks of AGI Buff
 * @type number
 * @default 0
 *
 * @param AGIDebuffIcon1
 * @text AGI Debuff Icon (Lv1)
 * @desc The icon for 1 stack of AGI Debuff
 * @type number
 * @default 0
 *
 * @param AGIDebuffIcon2
 * @text AGI Debuff Icon (Lv2)
 * @desc The icon for 2 stacks of AGI Debuff
 * @type number
 * @default 0
 *
 * @param LUKBuffIcon1
 * @text LUK Buff Icon (Lv1)
 * @desc The icon for 1 stack of LUK Buff
 * @type number
 * @default 0
 *
 * @param LUKBuffIcon2
 * @text LUK Buff Icon (Lv2)
 * @desc The icon for 2 stacks of LUK Buff
 * @type number
 * @default 0
 *
 * @param LUKDebuffIcon1
 * @text LUK Debuff Icon (Lv1)
 * @desc The icon for 1 stack of LUK Debuff
 * @type number
 * @default 0
 *
 * @param LUKDebuffIcon2
 * @text LUK Debuff Icon (Lv2)
 * @desc The icon for 2 stacks of LUK Debuff
 * @type number
 * @default 0
 *
 * @help
 */
//=============================================================================

const UNH_BuffIcons = {};
UNH_BuffIcons.pluginName = 'UNH_BuffIcons';
UNH_BuffIcons.parameters = PluginManager.parameters(UNH_BuffIcons.pluginName);
UNH_BuffIcons.BuffLv1s = [];
UNH_BuffIcons.BuffLv1s.push([UNH_BuffIcons.parameters['HPDebuffIcon2'] || 0, UNH_BuffIcons.parameters['HPDebuffIcon1'] || 0, 0, UNH_BuffIcons.parameters['HPBuffIcon1'] || 0, UNH_BuffIcons.parameters['HPBuffIcon2'] || 0]);
UNH_BuffIcons.BuffLv1s.push([UNH_BuffIcons.parameters['MPDebuffIcon2'] || 0, UNH_BuffIcons.parameters['MPDebuffIcon1'] || 0, 0, UNH_BuffIcons.parameters['MPBuffIcon1'] || 0, UNH_BuffIcons.parameters['MPBuffIcon2'] || 0]);
UNH_BuffIcons.BuffLv1s.push([UNH_BuffIcons.parameters['ATKDebuffIcon2'] || 0, UNH_BuffIcons.parameters['ATKDebuffIcon1'] || 0, 0, UNH_BuffIcons.parameters['ATKBuffIcon1'] || 0, UNH_BuffIcons.parameters['ATKBuffIcon2'] || 0]);
UNH_BuffIcons.BuffLv1s.push([UNH_BuffIcons.parameters['DEFDebuffIcon2'] || 0, UNH_BuffIcons.parameters['DEFDebuffIcon1'] || 0, 0, UNH_BuffIcons.parameters['DEFBuffIcon1'] || 0, UNH_BuffIcons.parameters['DEFBuffIcon2'] || 0]);
UNH_BuffIcons.BuffLv1s.push([UNH_BuffIcons.parameters['MATDebuffIcon2'] || 0, UNH_BuffIcons.parameters['MATDebuffIcon1'] || 0, 0, UNH_BuffIcons.parameters['MATBuffIcon1'] || 0, UNH_BuffIcons.parameters['MATBuffIcon2'] || 0]);
UNH_BuffIcons.BuffLv1s.push([UNH_BuffIcons.parameters['MDFDebuffIcon2'] || 0, UNH_BuffIcons.parameters['MDFDebuffIcon1'] || 0, 0, UNH_BuffIcons.parameters['MDFBuffIcon1'] || 0, UNH_BuffIcons.parameters['MDFBuffIcon2'] || 0]);
UNH_BuffIcons.BuffLv1s.push([UNH_BuffIcons.parameters['AGIDebuffIcon2'] || 0, UNH_BuffIcons.parameters['AGIDebuffIcon1'] || 0, 0, UNH_BuffIcons.parameters['AGIBuffIcon1'] || 0, UNH_BuffIcons.parameters['AGIBuffIcon2'] || 0]);
UNH_BuffIcons.BuffLv1s.push([UNH_BuffIcons.parameters['LUKDebuffIcon2'] || 0, UNH_BuffIcons.parameters['LUKDebuffIcon1'] || 0, 0, UNH_BuffIcons.parameters['LUKBuffIcon1'] || 0, UNH_BuffIcons.parameters['LUKBuffIcon2'] || 0]);

UNH_BuffIcons.BattlerBase_buffIconIndex = Game_BattlerBase.prototype.buffIconIndex;
Game_BattlerBase.prototype.buffIconIndex = function(buffLevel, paramId) {
  const paramArray = UNH_BuffIcons.BuffLv1s[paramId];
  const buffIndex = Math.max(0, buffLevel + 2);
  const buffIconDex = paramArray[buffIndex];
  if (!buffIconDex) {
    return UNH_BuffIcons.BattlerBase_buffIconIndex.call(this, buffLevel, paramId);
  } else if (typeof buffIconDex !== 'number') {
    return UNH_BuffIcons.BattlerBase_buffIconIndex.call(this, buffLevel, paramId);
  } else if (buffIconDex === 0) {
    return UNH_BuffIcons.BattlerBase_buffIconIndex.call(this, buffLevel, paramId);
  } else {
    return buffIconDex;
  }
};
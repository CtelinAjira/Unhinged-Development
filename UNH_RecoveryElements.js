//=============================================================================
// Unhinged Development - Recovery Elements
// UNH_RecoveryElements.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [RecoveryElements]
 * @author Unhinged Developer
 *
 * @param RecHpEle
 * @text HP Recovery Element
 * @desc The default element for HP recovery
 * @type number
 * @default 0
 *
 * @param RecMpEle
 * @text MP Recovery Element
 * @desc The default element for MP recovery
 * @type number
 * @default 0
 *
 * @param RecTpEle
 * @text TP Recovery Element
 * @desc The default element for TP recovery
 * @type number
 * @default 0
 *
 * @param RecItEle
 * @text Item Recovery Element
 * @desc The default element for item-based recovery
 * @type number
 * @default 0
 *
 * @param RecSkEle
 * @text Skill Recovery Element
 * @desc The default element for skill-based recovery
 * @type number
 * @default 0
 *
 * @help
 */
//=============================================================================

const UNH_RecoveryElements = {};
UNH_RecoveryElements.pluginName = 'UNH_RecoveryElements';
UNH_RecoveryElements.parameters = PluginManager.parameters(UNH_RecoveryElements.pluginName);
UNH_RecoveryElements.RecHpEle = Number(UNH_RecoveryElements.parameters['RecHpEle'] || 0);
UNH_RecoveryElements.RecMpEle = Number(UNH_RecoveryElements.parameters['RecMpEle'] || 0);
UNH_RecoveryElements.RecTpEle = Number(UNH_RecoveryElements.parameters['RecTpEle'] || 0);
UNH_RecoveryElements.RecItEle = Number(UNH_RecoveryElements.parameters['RecItEle'] || 0);
UNH_RecoveryElements.RecSkEle = Number(UNH_RecoveryElements.parameters['RecSkEle'] || 0);

Game_Action.prototype.itemEffectRecoverHp = function(target, effect) {
    let value = (target.mhp * effect.value1 + effect.value2) * target.rec;
    if (UNH_RecoveryElements.RecHpEle !== 0) value *= target.elementRate(UNH_RecoveryElements.RecHpEle);
    if (this.isItem()) {
        value *= this.subject().pha;
        if (UNH_RecoveryElements.RecItEle !== 0) value *= target.elementRate(UNH_RecoveryElements.RecItEle);
    } else {
        if (UNH_RecoveryElements.RecSkEle !== 0) value *= target.elementRate(UNH_RecoveryElements.RecSkEle);
    }
    value = Math.floor(value);
    if (value !== 0) {
        target.gainHp(value);
        this.makeSuccess(target);
    }
};

Game_Action.prototype.itemEffectRecoverMp = function(target, effect) {
    let value = (target.mmp * effect.value1 + effect.value2) * target.rec;
    if (UNH_RecoveryElements.RecMpEle !== 0) value *= target.elementRate(UNH_RecoveryElements.RecMpEle);
    if (this.isItem()) {
        value *= this.subject().pha;
        if (UNH_RecoveryElements.RecItEle !== 0) value *= target.elementRate(UNH_RecoveryElements.RecItEle);
    } else {
        if (UNH_RecoveryElements.RecSkEle !== 0) value *= target.elementRate(UNH_RecoveryElements.RecSkEle);
    }
    value = Math.floor(value);
    if (value !== 0) {
        target.gainMp(value);
        this.makeSuccess(target);
    }
};

Game_Action.prototype.itemEffectGainTp = function(target, effect) {
    let value = Math.floor(effect.value1);
    if (UNH_RecoveryElements.RecTpEle !== 0) value *= target.elementRate(UNH_RecoveryElements.RecTpEle);
    if (this.isItem()) {
        if (UNH_RecoveryElements.RecItEle !== 0) value *= target.elementRate(UNH_RecoveryElements.RecItEle);
    } else {
        if (UNH_RecoveryElements.RecSkEle !== 0) value *= target.elementRate(UNH_RecoveryElements.RecSkEle);
    }
    if (value !== 0) {
        target.gainTp(value);
        this.makeSuccess(target);
    }
};
//=============================================================================
// Unhinged Development - Use Item From Menu Override
// UNH_UseFromMenuOverride.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter UNH_MiscFunc
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [UseFromMenuOverride]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * New Variables
 * ============================================================================
 * 
 * $item
 * - the item's object
 * 
 * $subject
 * - the item's user
 */
//=============================================================================

const UNH_UseFromMenuOverride = {};
UNH_UseFromMenuOverride.pluginName = 'UNH_UseFromMenuOverride';

var $subject = $subject || null;
var $item = $item || null;

UNH_UseFromMenuOverride.ItemBase_useItem = Scene_ItemBase.prototype.useItem
Scene_ItemBase.prototype.useItem = function() {
  $subject = this.user();
  $item = this.item();
  UNH_UseFromMenuOverride.ItemBase_useItem.call(this);
};
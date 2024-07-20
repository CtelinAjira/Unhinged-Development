//=============================================================================
// Unhinged Development - Enemy Experience Rate
// UNH_EnemyEXR.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.01] [Unhinged] [EnemyEXR]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 *
 * This plugin just overrides the exp() function for enemies.  This is for the 
 * purposes of turning enemies' EXR into a multiplier to how much EXP they 
 * give.
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 * 1.01 - Updated plugin to include aliases
 */
//=============================================================================

const UNH_EnemyEXR = {};
UNH_EnemyEXR.pluginName = 'UNH_EnemyEXR';

UNH_EnemyEXR.Enemy_exp = Game_Enemy.prototype.exp;
Game_Enemy.prototype.exp = function() {
    let exp = UNH_EnemyEXR.Enemy_exp.call(this);
    exp *= this.exr;
    return exp;
};

UNH_EnemyEXR.Enemy_gold = Game_Enemy.prototype.gold;
Game_Enemy.prototype.gold = function() {
    let gold = UNH_EnemyEXR.Enemy_gold.call(this);
    return gold;
};


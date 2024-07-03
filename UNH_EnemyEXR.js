//=============================================================================
// Unhinged Development - Enemy Experience Rate
// UNH_EnemyEXR.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [EnemyEXR]
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
 */
//=============================================================================

Game_Enemy.prototype.exp = function() {
    let exp = this.enemy().exp;
    exp *= this.exr;
    return exp;
};

Game_Enemy.prototype.gold = function() {
    let gold = this.enemy().gold;
    return gold;
};


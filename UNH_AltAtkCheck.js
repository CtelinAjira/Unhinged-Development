//=============================================================================
// Unhinged Development - Alternate isAttack Check
// UNH_AltAtkCheck.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.01] [Unhinged] [AltAtkCheck]
 * @author Unhinged Developer
 * @orderAfter VisuMZ_4_WeaponUnleash
 *
 * @param isAtkEff
 * @text Include Add State
 * @desc Check for if [Add State: Normal Attack] is in play?
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @param isAtkOvr
 * @parent isAtkEff
 * @text Override Weapon Skills
 * @desc Requires VS Weapon Unleash to be installed
 * Allow non-basic attacks to proc weapon unleashes?
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @help
 * ============================================================================
 * Altered Functions
 * ============================================================================
 * 
 * action.isAttack()
 * - if [Include Add State] is turned on, checks if the current action's 
 *   effects include your weapon's effects
 * 
 * ============================================================================
 * New Functions
 * ============================================================================
 * 
 * action.isBasicAttack()
 * - returns whether the current action is the "Attack" command or not
 * 
 * action.unhIsAttack(code)
 * - returns whether the current action's damage formula contains the code
 *   (code is passed as a String)
 *   - returns as per action.isAttack() for non-damaging abilities
 */
//=============================================================================

const UNH_AltAtkCheck = {};
UNH_AltAtkCheck.pluginName = 'UNH_AltAtkCheck';
UNH_AltAtkCheck.parameters = PluginManager.parameters(UNH_AltAtkCheck.pluginName);
UNH_AltAtkCheck.isAtkEff = !!UNH_AltAtkCheck.parameters['isAtkEff'];
if (!UNH_AltAtkCheck.isAtkEff) {
  UNH_AltAtkCheck.isAtkOvr = false;
} else {
  UNH_AltAtkCheck.isAtkOvr = !!UNH_AltAtkCheck.parameters['isAtkOvr'];
}

Game_Action.prototype.unhIsAttack = function(formula) {
  const item = this.item();
  if (item.damage.type > 0 && item.damage.formula.includes(formula)) {
    return true;
  }
  return this.isAttack();
};

Game_Action.prototype.isBasicAttack = Game_Action.prototype.isAttack;

if (UNH_AltAtkCheck.isAtkEff) {
  Game_Action.prototype.isAttack = function() {
    const hasAtkNull = item.meta ? item.meta['unhNotAttack'] : false;
    if (hasAtkNull) {
      return true;
    } else {
      const hasAtkEff = item.effects.some(function(effect) {
        return (effect.code === 21 && effect.dataId === 0);
      });
      if (hasAtkEff) {
        return true;
      } else {
        return this.isBasicAttack();
      }
    }
  };

  if (!!Imported.VisuMZ_4_WeaponUnleash && !UNH_AltAtkCheck.isAtkOvr) {
    Game_Action.prototype.processUnleashProperties = function () {
      if (!this.subject()) {
        return;
      }
      if (!this.item()) {
        return;
      }
      if (this.isBasicAttack()) {
        this.processUnleashNotetags("WEAPON");
      } else if (this.isGuard()) {
        this.processUnleashNotetags('GUARD');
      }
    };
  }
}
//=============================================================================
// Unhinged Development - Physical VS Magical Defense
// UNH_PhysicMagicDefense.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [PhysicMagicDefense]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * New Attributes
 * ============================================================================
 *
 * phyDef
 * - Used in damage formula
 * magDef
 * - Used in damage formula
 * e.g.
 * - (a.atk * 2) - (b.phyDef * 1)
 * - (a.mat * 2) - (b.magDef * 1)
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * <PhysDef:x>
 * - Use for Actors/Classes/Weapons/Armors/Enemies/States
 * - Gives 'x' as a value for phyDef. (Javascript)
 *   - user covers the battler in question
 * - CASE SENSITIVE
 *
 * <MagDef:x>
 * - Use for Actors/Classes/Weapons/Armors/Enemies/States
 * - Gives 'x' as a value for magDef. (Javascript)
 *   - user covers the battler in question
 * - CASE SENSITIVE
 */
//=============================================================================

const UNH_PhysicMagicDefense = {};
UNH_PhysicMagicDefense.pluginName = 'UNH_PhysicMagicDefense';

Object.defineProperties(Game_BattlerBase.prototype, {
    // Hit Points
    phyDef: {
        get: function() {
            return this.getPhysDef();
        },
        configurable: true
    },
    magDef: {
        get: function() {
            return this.getMagDef();
        },
        configurable: true
    }
});

Game_BattlerBase.prototype.getPhysDef = function() {
  const user = this;
  let phyDef = 0;
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.PhysDef) {
          phyDef += eval(state.meta.PhysDef);
        }
      }
    });
  }
  if (phyDef === undefined) phyDef = 0;
  if (phyDef === null) phyDef = 0;
  return phyDef;
};

Game_BattlerBase.prototype.getMagDef = function() {
  const user = this;
  let magDef = 0;
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.MagDef) {
          magDef += eval(state.meta.MagDef);
        }
      }
    });
  }
  if (magDef === undefined) magDef = 0;
  if (magDef === null) magDef = 0;
  return magDef;
};

Game_Enemy.prototype.getPhysDef = function() {
  const user = this;
  let phyDef = Game_BattlerBase.prototype.getPhysDef.call(this);
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.PhysDef) {
      phyDef += eval(this.enemy().meta.PhysDef);
    }
  }
  if (phyDef === undefined) phyDef = 0;
  if (phyDef === null) phyDef = 0;
  return phyDef;
};

Game_Enemy.prototype.getMagDef = function() {
  const user = this;
  let magDef = Game_BattlerBase.prototype.getMagDef.call(this);
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.MagDef) {
      magDef += eval(this.enemy().meta.MagDef);
    }
  }
  if (magDef === undefined) magDef = 0;
  if (magDef === null) magDef = 0;
  return magDef;
};

Game_Actor.prototype.getPhysDef = function() {
  const user = this;
  const equips = this.weapons().concat(this.armors());
  let phyDef = Game_Battler.prototype.getPhysDef.call(this);
  if (!!this.actor().meta) {
    if (!!this.actor().meta.PhysDef) {
      phyDef += eval(this.actor().meta.PhysDef);
    }
  }
  if (!!this.currentClass().meta) {
    if (!!this.currentClass().meta.PhysDef) {
      phyDef += eval(this.currentClass().meta.PhysDef);
    }
  }
  if (equips.length > 0) {
    equips.forEach(function(equip) {
      if (!!equip.meta) {
        if (!!equip.meta.PhysDef) {
          phyDef += eval(equip.meta.PhysDef);
        }
      }
    });
  }
  if (phyDef === undefined) phyDef = 0;
  if (phyDef === null) phyDef = 0;
  return phyDef;
};

Game_Actor.prototype.getMagDef = function() {
  const user = this;
  const equips = this.weapons().concat(this.armors());
  let magDef = Game_Battler.prototype.getMagDef.call(this);
  if (!!this.actor().meta) {
    if (!!this.actor().meta.MagDef) {
      magDef += eval(this.actor().meta.MagDef);
    }
  }
  if (!!this.currentClass().meta) {
    if (!!this.currentClass().meta.MagDef) {
      magDef += eval(this.currentClass().meta.MagDef);
    }
  }
  if (equips.length > 0) {
    equips.forEach(function(equip) {
      if (!!equip.meta) {
        if (!!equip.meta.MagDef) {
          magDef += eval(equip.meta.MagDef);
        }
      }
    });
  }
  if (magDef === undefined) magDef = 0;
  if (magDef === null) magDef = 0;
  return magDef;
};
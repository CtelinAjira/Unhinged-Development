//=============================================================================
// Unhinged Development - Weapon Power
// UNH_WeaponPower.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [WeaponPower]
 * @author Unhinged Developer
 *
 * @param DefaultWeaponPower
 * @text Baseline Weapon Power
 * @desc The default value for your weapon power
 * @type string
 * @default 0
 *
 * @param DefaultPhysicPower
 * @text Baseline Physical Power
 * @desc The default value for your physical power
 * @type string
 * @default 0
 *
 * @param DefaultMagicPower
 * @text Baseline Magic Power
 * @desc The default value for your magic power
 * @type string
 * @default 0
 *
 * @param DefaultArmorPower
 * @text Baseline Armor Power
 * @desc The default value for your armor power
 * @type string
 * @default 0
 *
 * @param DefaultMagicArmor
 * @text Baseline Magic Armor
 * @desc The default value for your magic armor
 * @type string
 * @default 0
 *
 * @param DefaultCritFactor
 * @text Baseline Critical Factor
 * @desc The default critical factor
 * @type string
 * @default 200
 *
 * @help
 * ============================================================================
 * New Attributes
 * ============================================================================
 *
 * wpnPwr
 * - Used in damage formula
 * armPwr
 * - Used in damage formula
 * pWpnPwr
 * - Used in damage formula
 * mWpnPwr
 * - Used in damage formula
 * mArmPwr
 * - Used in damage formula
 * armBrk
 * - Used in damage formula
 * mgcBrk
 * - Used in damage formula
 * e.g.
 * - ((a.atk + a.pWpnPwr) * a.wpnPwr / 100) - (b.def + b.armPwr - a.armBrk)
 * - ((a.mat + a.mWpnPwr) * a.wpnPwr / 100) - (b.mdf + b.mArmPwr - a.mgcBrk)
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * <WeaponPower:x>
 * - Use for Enemies/Weapons/States
 * - Gives 'x' as a value for wpnPwr.
 * - CASE SENSITIVE
 *
 * <ArmorBreak:x>
 * - Use for Enemies/Weapons/States
 * - Gives 'x' as a value for armBrk.
 * - CASE SENSITIVE
 *
 * <MagicBreak:x>
 * - Use for Enemies/Weapons/States
 * - Gives 'x' as a value for armBrk.
 * - CASE SENSITIVE
 *
 * <MagicPower:x>
 * - Use for Enemies/Weapons/Armors/States
 * - Gives 'x' as a value for mWpnPwr.
 * - CASE SENSITIVE
 *
 * <PhysicPower:x>
 * - Use for Enemies/Weapons/Armors/States
 * - Gives 'x' as a value for pWpnPwr.
 * - CASE SENSITIVE
 *
 * <ArmorPower:x>
 * - Use for Enemies/Weapons/Armors/States
 * - Gives 'x' as a value for armPwr.
 * - CASE SENSITIVE
 *
 * <MagicArmor:x>
 * - Use for Enemies/Weapons/Armors/States
 * - Gives 'x' as a value for mArmPwr.
 * - CASE SENSITIVE
 *
 * <CriticalFactor:x>
 * - Use for Enemies/Weapons
 * - Gives 'x' as a percent for critical multiplier.
 * - CASE SENSITIVE
 *
 * <CriticalPlus:x>
 * - Use for Armors/States
 * - Gives 'x' as a boost to weapons' critical factor.
 * - CASE SENSITIVE
 */
//=============================================================================

const UNH_WeaponPower = {};
UNH_WeaponPower.pluginName = 'UNH_WeaponPower';
UNH_WeaponPower.parameters = PluginManager.parameters(UNH_WeaponPower.pluginName);
UNH_WeaponPower.DefaultWeaponPower = String(UNH_WeaponPower.parameters['DefaultWeaponPower'] || '0');
UNH_WeaponPower.DefaultPhysicPower = String(UNH_WeaponPower.parameters['DefaultPhysicPower'] || '0');
UNH_WeaponPower.DefaultMagicPower = String(UNH_WeaponPower.parameters['DefaultMagicPower'] || '0');
UNH_WeaponPower.DefaultArmorPower = String(UNH_WeaponPower.parameters['DefaultArmorPower'] || '0');
UNH_WeaponPower.DefaultMagicArmor = String(UNH_WeaponPower.parameters['DefaultMagicArmor'] || '0');
UNH_WeaponPower.DefaultCritFactor = String(UNH_WeaponPower.parameters['DefaultCritFactor'] || '0');

Object.defineProperties(Game_BattlerBase.prototype, {
    // Hit Points
    wpnPwr: {
        get: function() {
            return this.getWpnPower();
        },
        configurable: true
    },
    MHPwr: {
        get: function() {
            return this.getWpnPower(0);
        },
        configurable: true
    },
    OHPwr: {
        get: function() {
            return this.getWpnPower(1);
        },
        configurable: true
    },
    pWpnPwr: {
        get: function() {
            return this.getPWpnPower();
        },
        configurable: true
    },
    mWpnPwr: {
        get: function() {
            return this.getMWpnPower();
        },
        configurable: true
    },
    wpnCF: {
        get: function() {
            this.getWpnCritFactor();
        },
        configurable: true
    },
    MHCF: {
        get: function() {
            this.getWpnCritFactor(0);
        },
        configurable: true
    },
    OHCF: {
        get: function() {
            this.getWpnCritFactor(1);
        },
        configurable: true
    },
    armPwr: {
        get: function() {
            this.getArmPower();
        },
        configurable: true
    },
    mArmPwr: {
        get: function() {
            this.getMArmPower();
        },
        configurable: true
    },
    armBrk: {
        get: function() {
            this.getArmBreak();
        },
        configurable: true
    },
    mgcBrk: {
        get: function() {
            this.getMgcBreak();
        },
        configurable: true
    }
});

Game_Battler.prototype.getWpnPower = function() {
  const user = this;
  return eval(UNH_WeaponPower.DefaultWeaponPower);
};

Game_Battler.prototype.getPWpnPower = function() {
  const user = this;
  return eval(UNH_WeaponPower.DefaultPhysicPower);
};

Game_Battler.prototype.getMWpnPower = function() {
  const user = this;
  return eval(UNH_WeaponPower.DefaultMagicPower);
};

Game_Enemy.prototype.getWpnPower = function() {
  const user = this;
  let wpnPwr = 0;
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.WeaponPower) wpnPwr += eval(this.enemy().meta.WeaponPower);
  }
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.WeaponPower) wpnPwr += eval(state.meta.WeaponPower);
      }
    });
  }
  if (wpnPwr === 0) return Game_Battler.prototype.getWpnPower.call(this);
  return wpnPwr;
};

Game_Enemy.prototype.getPWpnPower = function() {
  const user = this;
  let wpnPwr = 0;
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.PhysicPower) wpnPwr += eval(this.enemy().meta.PhysicPower);
  }
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.PhysicPower) wpnPwr += eval(state.meta.PhysicPower);
      }
    });
  }
  if (wpnPwr === 0) return Game_Battler.prototype.getPWpnPower.call(this);
  return wpnPwr;
};

Game_Enemy.prototype.getMWpnPower = function() {
  const user = this;
  let wpnPwr = 0;
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.MagicPower) wpnPwr += eval(this.enemy().meta.MagicPower);
  }
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.MagicPower) wpnPwr += eval(state.meta.MagicPower);
      }
    });
  }
  if (wpnPwr === 0) return Game_Battler.prototype.getMWpnPower.call(this);
  return wpnPwr;
};

Game_Actor.prototype.getWpnPower = function(equipSlot) {
  const equips = this.weapons();
  if (equips.length <= 0) {
    return Game_Battler.prototype.getWpnPower.call(this);
  }
  const user = this;
  let wpnPwr = 0;
  if (!!this.actor().meta) {
    if (!!this.actor().meta.WeaponPower) wpnPwr += eval(this.actor().meta.WeaponPower);
  }
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.WeaponPower) wpnPwr += eval(state.meta.WeaponPower);
      }
    });
  }
  if (equips.length > 0) {
    if (equipSlot === 0 || this.weapons().length === 1) {
      if (!!equips[0].meta) {
        if (!!equips[0].meta.WeaponPower) wpnPwr += eval(equips[0].meta.WeaponPower);
      }
    } else if (equipSlot === 1) {
      if (!!equips[1].meta) {
        if (!!equips[1].meta.WeaponPower) wpnPwr += eval(equips[1].meta.WeaponPower);
      }
    } else {
      let tempWpnPwr = 0;
      equips.forEach(function(equip) {
        if (!!equip.meta) {
          if (!!equip.meta.WeaponPower) tempWpnPwr += eval(equip.meta.WeaponPower);
        }
      });
      if (equips.length > 1) {
        tempWpnPwr *= 3 / 4;
      }
      wpnPwr += tempWpnPwr;
    }
  }
  return wpnPwr;
};

Game_Actor.prototype.getPWpnPower = function() {
  const user = this;
  let wpnPwr = 0;
  if (!!this.actor().meta) {
    if (!!this.actor().meta.PhysicPower) wpnPwr += eval(this.actor().meta.PhysicPower);
  }
  const equips = this.equips().filter(function(equip) {
    return equip !== null;
  });
  const states = this.states();
  if (equips.length > 0) {
    equips.forEach(function(equip) {
      if (!!equip.meta) {
        if (!!equip.meta.PhysicPower) wpnPwr += eval(equip.meta.PhysicPower);
      }
    });
  }
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.PhysicPower) wpnPwr += eval(state.meta.PhysicPower);
      }
    });
  }
  return Math.round(wpnPwr);
};

Game_Actor.prototype.getMWpnPower = function() {
  const user = this;
  let wpnPwr = 0;
  if (!!this.actor().meta) {
    if (!!this.actor().meta.MagicPower) wpnPwr += eval(this.actor().meta.MagicPower);
  }
  const equips = this.equips().filter(function(equip) {
    return equip !== null;
  });
  const states = this.states();
  if (equips.length > 0) {
    equips.forEach(function(equip) {
      if (!!equip.meta) {
        if (!!equip.meta.MagicPower) wpnPwr += eval(equip.meta.MagicPower);
      }
    });
  }
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.MagicPower) wpnPwr += eval(state.meta.MagicPower);
      }
    });
  }
  return Math.round(wpnPwr);
};

Game_Battler.prototype.getWpnCritFactor = function() {
  const user = this;
  let criFact = eval(UNH_WeaponPower.DefaultCritFactor);
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.CriticalPlus) criFact += eval(state.meta.CriticalPlus);
      }
    });
  }
  return criFact;
};

Game_Enemy.prototype.getWpnCritFactor = function() {
  const user = this;
  let criFact = 0;
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.CriticalFactor) criFact = eval(this.enemy().meta.CriticalFactor);
    if (!!this.enemy().meta.CriticalPlus) criFact += eval(this.enemy().meta.CriticalPlus);
  }
  criFact += Game_Battler.prototype.getWpnCritFactor.call(this);
  return criFact;
};

Game_Actor.prototype.getWpnCritFactor = function(equipSlot) {
  const user = this;
  let criFact = eval(UNH_WeaponPower.DefaultCritFactor);
  const weapons = this.weapons();
  const armors = this.armors();
  const equips = weapons.concat(armors);
  if (!!this.actor().meta) {
    if (!!this.actor().meta.CriticalFactor) criFact = eval(this.actor().meta.CriticalFactor);
  }
  if (weapons.length > 0) {
    if (equipSlot === 0 || this.weapons().length === 1) {
      if (!!weapons[0].meta) {
        if (!!weapons[0].meta.CriticalFactor) criFact = eval(weapons[0].meta.CriticalFactor);
      }
    } else if (equipSlot === 1) {
      if (!!weapons[1].meta) {
        if (!!weapons[1].meta.CriticalFactor) criFact = eval(weapons[1].meta.CriticalFactor);
      }
    } else {
      weapons.forEach(function(weapon) {
        if (!!weapon.meta) {
          if (!!weapon.meta.CriticalFactor) criFact = Math.max(eval(weapon.meta.CriticalFactor), criFact);
        }
      });
    }
  }
  if (!!this.actor().meta) {
    if (!!this.actor().meta.CriticalPlus) criFact += eval(this.actor().meta.CriticalPlus);
  }
  if (equips.length > 0) {
    equips.forEach(function(armor) {
      if (!!armor.meta) {
        if (!!armor.meta.CriticalPlus) criFact += eval(armor.meta.CriticalPlus);
      }
    });
  }
  criFact += Game_Battler.prototype.getWpnCritFactor.call(this);
  return criFact;
};

Game_Battler.prototype.getArmPower = function() {
  const user = this;
  return eval(UNH_WeaponPower.DefaultArmorPower);
};

Game_Battler.prototype.getMArmPower = function() {
  const user = this;
  return eval(UNH_WeaponPower.DefaultArmorPower);
};

Game_Enemy.prototype.getArmPower = function() {
  const user = this;
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.ArmorPower) return eval(this.enemy().meta.ArmorPower);
  }
  return Game_Battler.prototype.getArmPower.call(this);
};

Game_Enemy.prototype.getMArmPower = function() {
  const user = this;
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.MagicArmor) return eval(this.enemy().meta.MagicArmor);
  }
  return Game_Battler.prototype.getMArmPower.call(this);
};

Game_Actor.prototype.getArmPower = function() {
  const user = this;
  let armPwr = 0;
  if (!!this.actor().meta) {
    if (!!this.actor().meta.ArmorPower) armPwr += eval(this.actor().meta.ArmorPower);
  }
  const equips = this.equips().filter(function(equip) {
    return equip !== null;
  });
  if (equips.length > 0) {
    equips.forEach(function(equip) {
      if (!!equip.meta) {
        if (!!equip.meta.ArmorPower) armPwr += eval(equip.meta.ArmorPower);
      }
    });
  }
  return armPwr;
};

Game_Actor.prototype.getMArmPower = function() {
  const user = this;
  let armPwr = 0;
  if (!!this.actor().meta) {
    if (!!this.actor().meta.MagicArmor) armPwr += eval(this.actor().meta.MagicArmor);
  }
  const equips = this.equips().filter(function(equip) {
    return equip !== null;
  });
  if (equips.length > 0) {
    equips.forEach(function(equip) {
      if (!!equip.meta) {
        if (!!equip.meta.MagicArmor) armPwr += eval(equip.meta.MagicArmor);
      }
    });
  }
  return armPwr;
};

Game_Battler.prototype.getArmBreak = function() {
  return 0;
};

Game_Enemy.prototype.getArmBreak = function() {
  const user = this;
  let wpnPwr = 0;
  if (!!this.enemy().meta.ArmorBreak) wpnPwr += eval(this.enemy().meta.ArmorBreak);
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta.ArmorBreak) wpnPwr += eval(state.meta.ArmorBreak);
    });
  }
  if (wpnPwr === 0) return Game_Battler.prototype.getArmBreak.call(this);
  return wpnPwr;
};

Game_Actor.prototype.getArmBreak = function(equipSlot) {
  const user = this;
  let wpnPwr = 0;
  if (!!this.actor().meta.ArmorBreak) wpnPwr += eval(this.actor().meta.ArmorBreak);
  const equips = this.weapons();
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.ArmorBreak) wpnPwr += eval(state.meta.ArmorBreak);
      }
    });
  }
  if (equips.length > 0) {
    if (equipSlot === 0 || this.weapons().length === 1) {
      if (!!equips[0].meta) {
        if (!!equips[0].meta.ArmorBreak) wpnPwr += eval(equips[0].meta.ArmorBreak);
      }
    } else if (equipSlot === 1) {
      if (!!equips[1].meta) {
        if (!!equips[1].meta.ArmorBreak) wpnPwr += eval(equips[1].meta.ArmorBreak);
      }
    } else {
      equips.forEach(function(equip) {
        if (!!equip.meta) {
          if (!!equip.meta.ArmorBreak) wpnPwr += eval(equip.meta.ArmorBreak);
        }
      });
    }
  }
  return Math.round(wpnPwr);
};

Game_Battler.prototype.getMgcBreak = function() {
  return 0;
};

Game_Enemy.prototype.getMgcBreak = function() {
  const user = this;
  let wpnPwr = 0;
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.MagicBreak) wpnPwr += eval(this.enemy().meta.MagicBreak);
  }
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.MagicBreak) wpnPwr += eval(state.meta.MagicBreak);
      }
    });
  }
  if (wpnPwr === 0) return Game_Battler.prototype.getMgcBreak.call(this);
  return wpnPwr;
};

Game_Actor.prototype.getMgcBreak = function(equipSlot) {
  const user = this;
  let wpnPwr = 0;
  if (!!this.actor().meta) {
    if (!!this.actor().meta.MagicBreak) wpnPwr += eval(this.actor().meta.MagicBreak);
  }
  const equips = this.weapons();
  const states = this.states();
  if (states.length > 0) {
    states.forEach(function(state) {
      if (!!state.meta) {
        if (!!state.meta.MagicBreak) wpnPwr += eval(state.meta.MagicBreak);
      }
    });
  }
  if (equips.length > 0) {
    if (equipSlot === 0 || this.weapons().length === 1) {
      if (!!equips[0].meta) {
        if (!!equips[0].meta.MagicBreak) wpnPwr += eval(equips[0].meta.MagicBreak);
      }
    } else if (equipSlot === 1) {
      if (!!equips[1].meta) {
        if (!!equips[1].meta.MagicBreak) wpnPwr += eval(equips[1].meta.MagicBreak);
      }
    } else {
      equips.forEach(function(equip) {
        if (!!equip.meta) {
          if (!!equip.meta.MagicBreak) wpnPwr += eval(equip.meta.MagicBreak);
        }
      });
    }
  }
  return Math.round(wpnPwr);
};

UNH_WeaponPower.Action_applyCritical = Game_Action.prototype.applyCritical;
Game_Action.prototype.applyCritical = function(damage) {
  const user = this.subject();
  if (user.wpnCF === undefined) return UNH_WeaponPower.Action_applyCritical.call(this);
  if (typeof user.wpnCF !== 'number') return UNH_WeaponPower.Action_applyCritical.call(this);
  if (user.MHCF === undefined) return UNH_WeaponPower.Action_applyCritical.call(this);
  if (typeof user.MHCF !== 'number') return UNH_WeaponPower.Action_applyCritical.call(this);
  if (user.OHCF === undefined) return UNH_WeaponPower.Action_applyCritical.call(this);
  if (typeof user.OHCF !== 'number') return UNH_WeaponPower.Action_applyCritical.call(this);
  return damage * (user.MHCF + user.OHCF) / 200;
};
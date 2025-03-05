//=============================================================================
// Unhinged Development - Custom Parameters
// UNH_CustParams.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_CustParams = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [CustParams]
 * @author Unhinged Developer
 * @base UNH_MiscFunc
 * @orderAfter UNH_MiscFunc
 *
 * @param LevelScale
 * @text Level Scaling Divisor
 * @desc The number of levels needed to double HP & damage
 * @type number
 * @default 10
 *
 * @help
 */
//=============================================================================

const UNH_CustParams = {};
UNH_CustParams.pluginName = 'UNH_CustParams';
UNH_CustParams.parameters = PluginManager.parameters(UNH_CustParams.pluginName);
UNH_CustParams.LevelScale = Number(UNH_CustParams.parameters['LevelScale'] || 10);

UNH_CustParams.levelScaling = function(level) {
  const scaling = UNH_CustParams.LevelScale - 1;
  return ((scaling + level) / (scaling + 1));
};

Object.defineProperties(Game_Actor.prototype, {
  lvScale: {
    get: function() {
      const scaling = UNH_CustParams.LevelScale - 1;
      return ((scaling + this.level) / (scaling + 1));
    }, configurable: true
  }, armCheck: {
    get: function() {
      return (this.lgtArmCheck() || this.medArmCheck() || this.hvyArmCheck());
    }, configurable: true
  }, floorDmg: {
    get: function() {
      const note1 = 'Floor Damage Plus';
      const note2 = 'Floor Damage Rate';
      const user = this;
      const battler = this.enemy();
      const curClass = ((Imported.UNH_VS_EnemyWeapons) ? (this.currentClass()) : (null));
      const equips = ((Imported.UNH_VS_EnemyWeapons) ? (this.equips()) : ([]));
      const states = this.states();
      let buffer = 1;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (state.meta[note1] === undefined) continue;
        buffer += eval(state.meta[note1]);
      }
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (equip.meta[note1] === undefined) continue;
        buffer += eval(equip.meta[note1]);
      }
      if (!!curClass) {
        if (!!curClass.meta) {
          if (curClass.meta[note1] !== undefined) {
            buffer += eval(curClass.meta[note1]);
          }
        }
      }
      if (!!battler.meta) {
        if (battler.meta[note1] !== undefined) {
          buffer += eval(battler.meta[note1]);
        }
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (state.meta[note2] === undefined) continue;
        buffer *= eval(state.meta[note2]);
      }
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (equip.meta[note2] === undefined) continue;
        buffer *= eval(equip.meta[note2]);
      }
      if (!!curClass) {
        if (!!curClass.meta) {
          if (curClass.meta[note2] !== undefined) {
            buffer *= eval(curClass.meta[note2]);
          }
        }
      }
      if (!!battler.meta) {
        if (battler.meta[note2] !== undefined) {
          buffer *= eval(battler.meta[note2]);
        }
      }
      return buffer;
    }, configurable: true
  }, kPar: {
    get: function() {
      const note = 'Key Stat';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const equips = this.equips();
      const weapons = this.weapons();
      const armors = this.armors();
      const states = this.states();
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (state.meta[note] === undefined) continue;
        return eval(state.meta[note]);
      }
      if (Imported.VisuMZ_1_BattleCore) {
        const weapon = this.equips()[this._activeWeaponSlot || 0];
        if (DataManager.isWeapon(weapon)) {
          if (!!weapon.meta) {
            if (weapon.meta[note] === undefined) {
              return eval(weapon.meta[note]);
            }
          }
        }
      } else if (weapons.length > 0) {
        const weaponSum = weapons.reduce(function(r, weapon) {
          if (!weapon) return r;
          if (!weapon.meta) return r;
          if (weapon.meta[note] === undefined) return r;
          return r + eval(weapon.meta[note]);
        }, 0);
        return (weaponSum / weapons.length);
      }
      if (!!curClass) {
        if (!!curClass.meta) {
          if (curClass.meta[note] !== undefined) {
            return eval(curClass.meta[note]);
          }
        }
      }
      if (!!battler.meta) {
        if (battler.meta[note] !== undefined) {
          return eval(battler.meta[note]);
        }
      }
      return 0;
    }, configurable: true
  }, pArm: {
    get: function() {
      const note = 'Physical Armor';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mArm: {
    get: function() {
      const note = 'Magical Armor';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pBrk: {
    get: function() {
      const note = 'Physical Drop';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const weapons = this.weapons();
      let buffer = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      if (Imported.VisuMZ_1_BattleCore) {
        weapon = weapons[this._activeWeaponSlot || 0];
        if (!!weapon) {
          if (!weapon.meta) {
            if (!weapon.meta[note]) {
              buffer += eval(weapon.meta[note]);
            }
          }
        }
      } else {
        for (const weapon of weapons) {
          if (!weapon) continue;
          if (!weapon.meta) continue;
          if (!weapon.meta[note]) continue;
          buffer += eval(weapon.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mBrk: {
    get: function() {
      const note = 'Magical Break';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const weapons = this.weapons();
      let buffer = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      if (Imported.VisuMZ_1_BattleCore) {
        weapon = weapons[this._activeWeaponSlot || 0];
        if (!!weapon) {
          if (!weapon.meta) {
            if (!weapon.meta[note]) {
              buffer += eval(weapon.meta[note]);
            }
          }
        }
      } else {
        for (const weapon of weapons) {
          if (!weapon) continue;
          if (!weapon.meta) continue;
          if (!weapon.meta[note]) continue;
          buffer += eval(weapon.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pRes: {
    get: function() {
      const note = 'Physical Resist';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mRes: {
    get: function() {
      const note = 'Magical Resist';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pBuf: {
    get: function() {
      const note = 'Physical Buffer';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, mBuf: {
    get: function() {
      const note = 'Magical Buffer';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, pEnh: {
    get: function() {
      const note = 'Physical Enhance';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, mEnh: {
    get: function() {
      const note = 'Magical Enhance';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, spdBoost: {
    get: function() {
      const note = 'Speed Boost';
      const user = this;
      const states = this.states();
      const equips = this.equips();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, physDmgPlus: {
    get: function() {
      const note = 'Physical Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, acnDmgPlus: {
    get: function() {
      const note = 'Arcane Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, psiDmgPlus: {
    get: function() {
      const note = 'Psionic Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, auraDmgPlus: {
    get: function() {
      const note = 'Aura Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, domDmgPlus: {
    get: function() {
      const note = 'Domain Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }
});
Object.defineProperties(Game_Enemy.prototype, {
  lvScale: {
    get: function() {
      const scaling = UNH_CustParams.LevelScale - 1;
      return ((scaling + this.level) / (scaling + 1));
    }, configurable: true
  }, armCheck: {
    get: function() {
      return (this.lgtArmCheck() || this.medArmCheck() || this.hvyArmCheck());
    }, configurable: true
  }, floorDmg: {
    get: function() {
      const note1 = 'Floor Damage Plus';
      const note2 = 'Floor Damage Rate';
      const user = this;
      const battler = this.enemy();
      const curClass = ((Imported.UNH_VS_EnemyWeapons) ? (this.currentClass()) : (null));
      const equips = ((Imported.UNH_VS_EnemyWeapons) ? (this.equips()) : ([]));
      const states = this.states();
      let buffer = 1;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (state.meta[note1] === undefined) continue;
        buffer += eval(state.meta[note1]);
      }
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (equip.meta[note1] === undefined) continue;
        buffer += eval(equip.meta[note1]);
      }
      if (!!curClass) {
        if (!!curClass.meta) {
          if (curClass.meta[note1] !== undefined) {
            buffer += eval(curClass.meta[note1]);
          }
        }
      }
      if (!!battler.meta) {
        if (battler.meta[note1] !== undefined) {
          buffer += eval(battler.meta[note1]);
        }
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (state.meta[note2] === undefined) continue;
        buffer *= eval(state.meta[note2]);
      }
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (equip.meta[note2] === undefined) continue;
        buffer *= eval(equip.meta[note2]);
      }
      if (!!curClass) {
        if (!!curClass.meta) {
          if (curClass.meta[note2] !== undefined) {
            buffer *= eval(curClass.meta[note2]);
          }
        }
      }
      if (!!battler.meta) {
        if (battler.meta[note2] !== undefined) {
          buffer *= eval(battler.meta[note2]);
        }
      }
      return buffer;
    }, configurable: true
  }, kPar: {
    get: function() {
      const note = 'Key Stat';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const equips = this.equips();
      const weapons = this.weapons();
      const armors = this.armors();
      const states = this.states();
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (state.meta[note] === undefined) continue;
        return eval(state.meta[note]);
      }
      const weapon = this.equips()[this._activeWeaponSlot || 0];
      if (DataManager.isWeapon(weapon)) {
        if (!!weapon.meta) {
          if (weapon.meta[note] === undefined) {
            return eval(weapon.meta[note]);
          }
        }
      }
      if (!!curClass) {
        if (!!curClass.meta) {
          if (curClass.meta[note] !== undefined) {
            return eval(curClass.meta[note]);
          }
        }
      }
      if (!!battler.meta) {
        if (battler.meta[note] !== undefined) {
          return eval(battler.meta[note]);
        }
      }
      return 0;
    }, configurable: true
  }, pArm: {
    get: function() {
      const note = 'Physical Armor';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mArm: {
    get: function() {
      const note = 'Magical Armor';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pBrk: {
    get: function() {
      const note = 'Physical Drop';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const weapons = this.weapons();
      let buffer = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      if (Imported.VisuMZ_1_BattleCore) {
        weapon = weapons[this._activeWeaponSlot || 0];
        if (!!weapon) {
          if (!weapon.meta) {
            if (!weapon.meta[note]) {
              buffer += eval(weapon.meta[note]);
            }
          }
        }
      } else {
        for (const weapon of weapons) {
          if (!weapon) continue;
          if (!weapon.meta) continue;
          if (!weapon.meta[note]) continue;
          buffer += eval(weapon.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mBrk: {
    get: function() {
      const note = 'Magical Drop';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const weapons = this.weapons();
      let buffer = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      if (Imported.VisuMZ_1_BattleCore) {
        weapon = weapons[this._activeWeaponSlot || 0];
        if (!!weapon) {
          if (!weapon.meta) {
            if (!weapon.meta[note]) {
              buffer += eval(weapon.meta[note]);
            }
          }
        }
      } else {
        for (const weapon of weapons) {
          if (!weapon) continue;
          if (!weapon.meta) continue;
          if (!weapon.meta[note]) continue;
          buffer += eval(weapon.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pRes: {
    get: function() {
      const note = 'Physical Resist';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, mRes: {
    get: function() {
      const note = 'Magical Resist';
      const user = this;
      const battler = this.object();
      const states = this.states();
      const armors = this.armors();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      for (const equip of armors) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        buffer += eval(equip.meta[note]);
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          buffer += eval(battler.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, pBuf: {
    get: function() {
      const note = 'Physical Buffer';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, mBuf: {
    get: function() {
      const note = 'Magical Buffer';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, pEnh: {
    get: function() {
      const note = 'Physical Enhance';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, mEnh: {
    get: function() {
      const note = 'Magical Enhance';
      const user = this;
      const states = this.states();
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      return buffer;
    }, configurable: true
  }, spdBoost: {
    get: function() {
      const note = 'Speed Boost';
      const user = this;
      const states = this.states();
      const equips = ((Imported.UNH_VS_EnemyWeapons) ? (this.equips()) : ([]));
      let buffer = 0;
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        buffer += eval(state.meta[note]);
      }
      if (Imported.UNH_VS_EnemyWeapons) {
        for (const equip of equips) {
          if (!equip) continue;
          if (!equip.meta) continue;
          if (!equip.meta[note]) continue;
          buffer += eval(equip.meta[note]);
        }
      }
      return buffer;
    }, configurable: true
  }, physDmgPlus: {
    get: function() {
      const note = 'Physical Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, acnDmgPlus: {
    get: function() {
      const note = 'Arcane Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, psiDmgPlus: {
    get: function() {
      const note = 'Psionic Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, auraDmgPlus: {
    get: function() {
      const note = 'Aura Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }, domDmgPlus: {
    get: function() {
      const note = 'Domain Damage';
      const user = this;
      const battler = this.object();
      const curClass = this.currentClass();
      const states = this.states();
      const equips = this.equips();
      let dmg = 0;
      const isDoublehand = user.unhIsDoublehand();
      for (const equip of equips) {
        if (!equip) continue;
        if (!equip.meta) continue;
        if (!equip.meta[note]) continue;
        dmg += eval(equip.meta[note]);
      }
      for (const state of states) {
        if (!state) continue;
        if (!state.meta) continue;
        if (!state.meta[note]) continue;
        dmg += eval(state.meta[note]);
      }
      if (!!curClass.meta) {
        if (!!curClass.meta[note]) {
          dmg += eval(curClass.meta[note]);
        }
      }
      if (!!battler.meta) {
        if (!!battler.meta[note]) {
          dmg += eval(battler.meta[note]);
        }
      }
      return dmg;
    }, configurable: true
  }
});

UNH_CustParams.weaponSkill = function(user, wtypeId) {
  if (!Imported.UNH_SkillLevels) return 0;
  const wtypes = $dataSystem.weaponTypes;
  let note = "Unarmed Master";
  if (wtypeId > 0 && wtypeId < wtypes.length) note = wtypes[wtypeId] + " Master";
  const skillId = 12 + wtypeId;
  const battler = user.object();
  const curClass = user.currentClass();
  const states = user.states();
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (!!state.meta[note]) return user.unhSkillLevel(skillId);
  }
  if (!!curClass.meta) {
    if (!!curClass.meta[note]) {
      return user.unhSkillLevel(skillId);
    }
  }
  if (!!battler.meta) {
    if (!!battler.meta[note]) {
      return user.unhSkillLevel(skillId);
    }
  }
  return 0;
};

Game_Action.prototype.tLv = function(target) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const note = 'UnhLevelPlus';
  let actnLv = 0;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        actnLv = Number(eval(obj.meta[note]));
        if (isNaN(actnLv)) actnLv = 0;
      }
    }
  }
  let retAdd;
  const userLv = user.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    retAdd = Number(eval(obj.meta[note]));
    if (isNaN(retAdd)) return r;
    return r + retAdd;
  }, user.level);
  const targLv = target.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    retAdd = Number(eval(obj.meta[note]));
    if (isNaN(retAdd)) return r;
    return r + retAdd;
  }, target.level);
  return (actnLv + userLv - targLv);
};

Game_Action.prototype.tLvScl = function(target) {
  const action = this;
  const item = this.item();
  const user = this.subject();
  return UNH_CustParams.levelScaling(user.level + this.tLv(target));
};

Game_BattlerBase.prototype.bossScale = function() {
  const action = this;
  const item = this.item();
  const user = this.subject();
  const note = 'UnhLevelPlus';
  let retAdd;
  const level = user.traitObjects().reduce(function(r, obj) {
    if (!obj) return r;
    if (!obj.meta) return r;
    retAdd = Number(eval(obj.meta[note]));
    if (isNaN(retAdd)) return r;
    return r + retAdd;
  }, user.level);
  return UNH_CustParams.levelScaling(level);
};

Game_Action.prototype.wMag = function(target, handDex) {
  const action = this;
  const item = this.item();
  const note = 'Magic Weapon';
  const user = this.subject();
  const equips = user.equips();
  const weapons = user.weapons();
  const armors = user.armors();
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  const isDisarmed = states.some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    return !!state.meta['Disarm State'];
  });
  if (!!item) {
    if (!!item.meta) {
      if (item.meta[note] !== undefined) {
        if (!!eval(item.meta[note])) return true;
      }
    }
  }
  if (this.hasNoWeapons()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  if (handDex > equips.length) handDex = equips.length - 1;
  if (!isDisarmed) {
    const weapon = equips[handDex];
    if (DataManager.isWeapon(weapon)) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          if (!!eval(weapon.meta[note])) return true;
        }
      }
    }
  }
  return states.some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
};

Game_Action.prototype.wPow = function(target, handDex) {
  const note = 'Weapon Power';
  const action = this;
  const item = this.item();
  const user = this.subject();
  const battler = user.object();
  const curClass = user.currentClass();
  const equips = user.equips();
  const weapons = user.weapons();
  const armors = user.armors();
  const states = user.states();
  if (!!item) {
    if (!!item.meta) {
      if (item.meta[note] !== undefined) {
        if (!!eval(item.meta[note])) return true;
      }
    }
  }
  if (user.hasNoWeapons()) {
    for (const state of states) {
      if (!state) continue;
      if (!state.meta) continue;
      if (state.meta[note] === undefined) continue;
      const power = eval(state.meta[note]);
      return power;
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (curClass.meta[note] !== undefined) {
          const power = eval(curClass.meta[note]);
          return power;
        }
      }
    }
    if (!!battler.meta) {
      if (battler.meta[note] !== undefined) {
        const power = eval(battler.meta[note]);
        return power;
      }
    }
    return 0;
  }
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  if (handDex > equips.length) handDex = equips.length - 1;
  const isDoublehand = user.unhIsDoublehand();
  const isDisarmed = states.some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    return !!state.meta['Disarm State'];
  });
  if (!isDisarmed) {
    const weapon = equips[handDex];
    if (DataManager.isWeapon(weapon)) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          const power = eval(weapon.meta[note]);
          if (isDoublehand) return (power * 1.5);
          return (power / Math.pow(2, handDex));
        }
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    const power = eval(state.meta[note]);
    if (isDoublehand) return (power * 1.5);
    return (power / Math.pow(2, handDex));
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (curClass.meta[note] !== undefined) {
        const power = eval(curClass.meta[note]);
        if (isDoublehand) return (power * 1.5);
        return (power / Math.pow(2, handDex));
      }
    }
  }
  if (!!battler.meta) {
    if (battler.meta[note] !== undefined) {
      const power = eval(battler.meta[note]);
      if (isDoublehand) return (power * 1.5);
      return (power / Math.pow(2, handDex));
    }
  }
  return 0;
};

Game_BattlerBase.prototype.lgtArmCheck = function() {
  const user = this;
  const note = 'Light Armor';
  const stateArmor = this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
  if (stateArmor) return true;
  return this.armors().some(function(armor) {
    if (!armor) return false;
    if (!armor.meta) return false;
    if (!armor.meta[note]) return false;
    return !!eval(armor.meta[note]);
  });
};

Game_BattlerBase.prototype.medArmCheck = function() {
  const user = this;
  const note = 'Medium Armor';
  const stateArmor = this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
  if (stateArmor) return true;
  return this.armors().some(function(armor) {
    if (!armor) return false;
    if (!armor.meta) return false;
    if (!armor.meta[note]) return false;
    return !!eval(armor.meta[note]);
  });
};

Game_BattlerBase.prototype.hvyArmCheck = function() {
  const user = this;
  const note = 'Heavy Armor';
  const stateArmor = this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
  if (stateArmor) return true;
  return this.armors().some(function(armor) {
    if (!armor) return false;
    if (!armor.meta) return false;
    if (!armor.meta[note]) return false;
    return !!eval(armor.meta[note]);
  });
};

Game_BattlerBase.prototype.tpHpDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage by HP';
  const states = this.states();
  const equips = this.equips();
  const object = this.object();
  const curClass = this.currentClass();
  const max = this.maxTp();
  let tpGain = 1;
  for (const equip of equips) {
    if (!equip) continue;
    if (!equip.note) continue;
    if (!equip.meta[note]) continue;
    tpGain *= eval(equip.meta[note]);
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.note) continue;
    if (!state.meta[note]) continue;
    tpGain *= eval(state.meta[note]);
  }
  if (!!object) {
    if (!!object.meta) {
      if (!!object.meta[note]) {
        tpGain *= eval(object.meta[note]);
      }
    }
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        tpGain *= eval(curClass.meta[note]);
      }
    }
  }
  return tpGain;
};

Game_BattlerBase.prototype.tpMpDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage by MP';
  const states = this.states();
  const equips = this.equips();
  const object = this.object();
  const curClass = this.currentClass();
  const max = this.maxTp();
  let tpGain = 1;
  for (const equip of equips) {
    if (!equip) continue;
    if (!equip.note) continue;
    if (!equip.meta[note]) continue;
    tpGain *= eval(equip.meta[note]);
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.note) continue;
    if (!state.meta[note]) continue;
    tpGain *= eval(state.meta[note]);
  }
  if (!!object) {
    if (!!object.meta) {
      if (!!object.meta[note]) {
        tpGain *= eval(object.meta[note]);
      }
    }
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        tpGain *= eval(curClass.meta[note]);
      }
    }
  }
  return tpGain;
};

Game_BattlerBase.prototype.tpTakeDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage In';
  const states = this.states();
  const equips = this.equips();
  const object = this.object();
  const curClass = this.currentClass();
  const max = this.maxTp();
  let tpGain = 1;
  for (const equip of equips) {
    if (!equip) continue;
    if (!equip.note) continue;
    if (!equip.meta[note]) continue;
    tpGain *= eval(equip.meta[note]);
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.note) continue;
    if (!state.meta[note]) continue;
    tpGain *= eval(state.meta[note]);
  }
  if (!!object) {
    if (!!object.meta) {
      if (!!object.meta[note]) {
        tpGain *= eval(object.meta[note]);
      }
    }
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        tpGain *= eval(curClass.meta[note]);
      }
    }
  }
  return tpGain;
};

Game_BattlerBase.prototype.tpDealDmgMult = function() {
  const user = this;
  const note = 'Unh TP Damage Out';
  const states = this.states();
  const equips = this.equips();
  const object = this.object();
  const curClass = this.currentClass();
  const max = this.maxTp();
  let tpGain = 1;
  for (const equip of equips) {
    if (!equip) continue;
    if (!equip.note) continue;
    if (!equip.meta[note]) continue;
    tpGain *= eval(equip.meta[note]);
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.note) continue;
    if (!state.meta[note]) continue;
    tpGain *= eval(state.meta[note]);
  }
  if (!!object) {
    if (!!object.meta) {
      if (!!object.meta[note]) {
        tpGain *= eval(object.meta[note]);
      }
    }
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        tpGain *= eval(curClass.meta[note]);
      }
    }
  }
  return tpGain;
};

Game_BattlerBase.prototype.tpGainRegen = function() {
  const user = this;
  const note = 'Unh TP Regen';
  const states = this.states();
  const equips = this.equips();
  const object = this.object();
  const curClass = this.currentClass();
  const max = this.maxTp();
  let tpGain = 0;
  for (const equip of equips) {
    if (!equip) continue;
    if (!equip.note) continue;
    if (!equip.meta[note]) continue;
    tpGain += eval(equip.meta[note]);
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.note) continue;
    if (!state.meta[note]) continue;
    tpGain += eval(state.meta[note]);
  }
  if (!!object) {
    if (!!object.meta) {
      if (!!object.meta[note]) {
        tpGain += eval(object.meta[note]);
      }
    }
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        tpGain += eval(curClass.meta[note]);
      }
    }
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.tpGainDeadMembers = function() {
  const user = this;
  const note = 'Unh TP Per Dead Ally';
  const states = this.states();
  const equips = this.equips();
  const object = this.object();
  const curClass = this.currentClass();
  const max = this.maxTp();
  let tpGain = 0;
  for (const equip of equips) {
    if (!equip) continue;
    if (!equip.note) continue;
    if (!equip.meta[note]) continue;
    tpGain += eval(equip.meta[note]);
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.note) continue;
    if (!state.meta[note]) continue;
    tpGain += eval(state.meta[note]);
  }
  if (!!object) {
    if (!!object.meta) {
      if (!!object.meta[note]) {
        tpGain += eval(object.meta[note]);
      }
    }
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        tpGain += eval(curClass.meta[note]);
      }
    }
  }
  if (this.isActor()) {
    return Math.round(tpGain * $gameParty.deadMembers().length);
  } else {
    return Math.round(tpGain * $gameTroop.deadMembers().length);
  }
};

Game_BattlerBase.prototype.tpGainEvade = function() {
  const user = this;
  const note = 'Unh TP Evasion';
  const states = this.states();
  const equips = this.equips();
  const object = this.object();
  const curClass = this.currentClass();
  const max = this.maxTp();
  let tpGain = 0;
  for (const equip of equips) {
    if (!equip) continue;
    if (!equip.note) continue;
    if (!equip.meta[note]) continue;
    tpGain += eval(equip.meta[note]);
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.note) continue;
    if (!state.meta[note]) continue;
    tpGain += eval(state.meta[note]);
  }
  if (!!object) {
    if (!!object.meta) {
      if (!!object.meta[note]) {
        tpGain += eval(object.meta[note]);
      }
    }
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        tpGain += eval(curClass.meta[note]);
      }
    }
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.tpGainSolo = function() {
  const user = this;
  const note = 'Unh TP Last Standing';
  const states = this.states();
  const equips = this.equips();
  const object = this.object();
  const curClass = this.currentClass();
  const max = this.maxTp();
  let tpGain = 0;
  for (const equip of equips) {
    if (!equip) continue;
    if (!equip.note) continue;
    if (!equip.meta[note]) continue;
    tpGain += eval(equip.meta[note]);
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.note) continue;
    if (!state.meta[note]) continue;
    tpGain += eval(state.meta[note]);
  }
  if (!!object) {
    if (!!object.meta) {
      if (!!object.meta[note]) {
        tpGain += eval(object.meta[note]);
      }
    }
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        tpGain += eval(curClass.meta[note]);
      }
    }
  }
  return Math.round(tpGain);
};

Game_Actor.prototype.tpGainSolo = function() {
  if ($gameParty.deadMembers().length <= 0) return 0;
  return Game_BattlerBase.prototype.tpGainSolo.call(this);
};

Game_Enemy.prototype.tpGainSolo = function() {
  if ($gameTroop.deadMembers().length <= 0) return 0;
  return Game_BattlerBase.prototype.tpGainSolo.call(this);
};

Game_BattlerBase.prototype.tpGainAllyDeath = function() {
  const user = this;
  const note = 'Unh TP Ally Death';
  const states = this.states();
  const equips = this.equips();
  const object = this.object();
  const curClass = this.currentClass();
  const max = this.maxTp();
  let tpGain = 0;
  for (const equip of equips) {
    if (!equip) continue;
    if (!equip.note) continue;
    if (!equip.meta[note]) continue;
    tpGain += eval(equip.meta[note]);
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.note) continue;
    if (!state.meta[note]) continue;
    tpGain += eval(state.meta[note]);
  }
  if (!!object) {
    if (!!object.meta) {
      if (!!object.meta[note]) {
        tpGain += eval(object.meta[note]);
      }
    }
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        tpGain += eval(curClass.meta[note]);
      }
    }
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.tpGainEnemyDeath = function() {
  const user = this;
  const note = 'Unh TP Enemy Death';
  const states = this.states();
  const equips = this.equips();
  const object = this.object();
  const curClass = this.currentClass();
  const max = this.maxTp();
  let tpGain = 0;
  for (const equip of equips) {
    if (!equip) continue;
    if (!equip.note) continue;
    if (!equip.meta[note]) continue;
    tpGain += eval(equip.meta[note]);
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.note) continue;
    if (!state.meta[note]) continue;
    tpGain += eval(state.meta[note]);
  }
  if (!!object) {
    if (!!object.meta) {
      if (!!object.meta[note]) {
        tpGain += eval(object.meta[note]);
      }
    }
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (!!curClass.meta[note]) {
        tpGain += eval(curClass.meta[note]);
      }
    }
  }
  return Math.round(tpGain);
};

Game_BattlerBase.prototype.unhProne = function() {
  const user = this;
  const note = 'Prone';
  return this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
};

Game_BattlerBase.prototype.unhIsDoublehand = function() {
  const user = this;
  const note = 'unhDoublehand';
  return this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
};

Game_BattlerBase.prototype.unhIsSkyward = function() {
  const user = this;
  const note = 'unhSkyward';
  return this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
};

Game_Action.prototype.isWeapon = function(target) {
  return this.item().damage.formula.includes('this.wpnPow()');
};

Game_Action.prototype.wpnPow = function(target) {
  const user = this.subject();
  if (!Imported.VisuMZ_1_BattleCore) return ((this.wPow(target, 0) + this.wPow(target, 1)));
  const weaponSlot = user._activeWeaponSlot || 0;
  const dblWpn = user.unhDblWpn(weaponSlot) ? 0.5 : 1;
  return (this.wPow(Math.max(Math.min(target, weaponSlot, 1), 0)) * dblWpn);
};

Game_Action.prototype.wpnMag = function(target) {
  if (!this.isWeapon(target)) return false;
  const user = this.subject();
  if (!Imported.VisuMZ_1_BattleCore) return (this.wMag(target, 0) || this.wMag(target, 1));
  const weaponSlot = user._activeWeaponSlot || 0;
  return this.wMag(target, weaponSlot);
};

Game_BattlerBase.prototype.wpnTr = function(index) {
  const retArr = $dataSystem.weaponTypes.map(function(wtype, id) {
    return UNH_CustParams.weaponSkill(this, id);
  }, this);
  if (!index) index = 0;
  if (typeof index !== 'number') index = 0;
  if (isNaN(index)) index = 0;
  index = index % retArr.length;
  return retArr[index];
};

Game_BattlerBase.prototype.unhDblWpn = function(index) {
  const user = this;
  const note = 'Double Weapon';
  const statesDouble = this.states().some(function(state) {
    if (!state) return false;
    if (!state.meta) return false;
    if (!state.meta[note]) return false;
    return !!eval(state.meta[note]);
  });
  if (statesDouble) return true;
  if (this.hasNoWeapons()) {
    const statesNoFist = this.states().some(function(state) {
      if (!state) return false;
      if (!state.meta) return false;
      if (!state.meta['No Fist']) return false;
      return !!eval(state.meta['No Fist']);
    });
    if (statesNoFist) return true;
    const offhand = user.equips()[1];
    if (!DataManager.isArmor(offhand)) return true;
    const meta = offhand.meta;
    if (!meta) return true;
    return !meta['No Fist'];
  }
  const weaponsDouble = this.weapons().some(function(weapon) {
    if (!weapon) return false;
    if (!weapon.meta) return false;
    if (!weapon.meta[note]) return false;
    return !!eval(weapon.meta[note]);
  });
  if (index === undefined) return weaponsDouble;
  if (index === null) return weaponsDouble;
  if (typeof index !== 'number') return weaponsDouble;
  if (isNaN(index)) return weaponsDouble;
  const weapon = this.weapons()[index];
  if (!weapon) return false;
  if (!weapon.meta) return false;
  if (!weapon.meta[note]) return false;
  return true;
};

Game_Action.prototype.physBlock = function(target) {
  if (this.isCertainHit()) return false;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && user.wpnMag()) return false;
  if (this.isMagical() && !user.wpnMag()) return false;
  const note = 'Physical Block';
  const states = target.states();
  if (target.unhIsDoublehand()) return false;
  if (target.weapons().length > 1) return false;
  const equips = target.equips();
  const shield = equips[1];
  if (!shield) return false;
  if (!shield.meta) return false;
  if (shield.meta[note] === undefined) return false;
  let parry = eval(shield.meta[note]);
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    parry += eval(state.meta[note]);
  }
  const random = Math.randomInt(10000);
  return random < parry;
};

Game_Action.prototype.magBlock = function(target) {
  if (this.isCertainHit()) return false;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && !user.wpnMag()) return false;
  if (this.isMagical() && user.wpnMag()) return false;
  const note = 'Magical Block';
  const states = target.states();
  if (target.unhIsDoublehand()) return false;
  if (target.weapons().length > 1) return false;
  const equips = target.equips();
  const shield = equips[1];
  if (!shield) return false;
  if (!shield.meta) return false;
  if (shield.meta[note] === undefined) return false;
  let parry = eval(shield.meta[note]);
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    parry += eval(state.meta[note]);
  }
  const random = Math.randomInt(10000);
  return random < parry;
};

Game_Action.prototype.physParry = function(target) {
  if (this.isCertainHit()) return false;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && user.wpnMag()) return false;
  if (this.isMagical() && !user.wpnMag()) return false;
  const note = 'Physical Parry';
  const note2 = 'Physical Parry Plus';
  const battler = target.object();
  const curClass = target.currentClass();
  const states = target.states();
  const weapons = target.weapons();
  const isDoublehand = target.unhIsDoublehand();
  let wpnPry = [];
  for (const weapon of weapons) {
    if (!weapon) continue;
    if (!weapon.meta) continue;
    if (weapon.meta[note] === undefined) continue;
    wpnPry.push(eval(weapon.meta[note]));
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    wpnPry.push(eval(state.meta[note]));
  }
  if (wpnPry.length < 0) return false;
  let parry = 0;
  let parries = [];
  for (let i = 0; i < wpnPry.length; i++) {
    parries.push(wpnPry[i]);
  }
  for (let i = 0; i < parries.length; i++) {
    parry = parries[i];
    for (const state of states) {
      if (!state) continue;
      if (!state.meta) continue;
      if (state.meta[note2] === undefined) continue;
      parry += eval(state.meta[note2]);
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (curClass.meta[note2] !== undefined) {
          parry += eval(curClass.meta[note2]);
        }
      }
    }
    if (!!battler.meta) {
      if (battler.meta[note2] !== undefined) {
        parry += eval(battler.meta[note2]);
      }
    }
    if (isDoublehand) parry = parry * 1.5;
    wpnPry[i] = parry;
  }
  return wpnPry.some(function(pry) {
    const random = Math.randomInt(10000);
    return random < pry;
  });
};

Game_Action.prototype.magParry = function(target) {
  if (this.isCertainHit()) return false;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && !user.wpnMag()) return false;
  if (this.isMagical() && user.wpnMag()) return false;
  const note = 'Magical Parry';
  const note2 = 'Magical Parry Plus';
  const battler = target.object();
  const curClass = target.currentClass();
  const states = target.states();
  const weapons = target.weapons();
  const isDoublehand = target.unhIsDoublehand();
  let wpnPry = [];
  for (const weapon of weapons) {
    if (!weapon) continue;
    if (!weapon.meta) continue;
    if (weapon.meta[note] === undefined) continue;
    wpnPry.push(eval(weapon.meta[note]));
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    wpnPry.push(eval(state.meta[note]));
  }
  if (wpnPry.length < 0) return false;
  let parry = 0;
  let parries = [];
  for (let i = 0; i < wpnPry.length; i++) {
    parries.push(wpnPry[i]);
  }
  for (let i = 0; i < parries.length; i++) {
    parry = parries[i];
    for (const state of states) {
      if (!state) continue;
      if (!state.meta) continue;
      if (state.meta[note2] === undefined) continue;
      parry += eval(state.meta[note2]);
    }
    if (!!curClass) {
      if (!!curClass.meta) {
        if (curClass.meta[note2] !== undefined) {
          parry += eval(curClass.meta[note2]);
        }
      }
    }
    if (!!battler.meta) {
      if (battler.meta[note2] !== undefined) {
        parry += eval(battler.meta[note2]);
      }
    }
    if (isDoublehand) parry = parry * 1.5;
    wpnPry[i] = parry;
  }
  return wpnPry.some(function(pry) {
    const random = Math.randomInt(10000);
    return random < pry;
  });
};

Game_Action.prototype.checkPhysBreak = function(target, handDex) {
  if (this.isCertainHit()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && user.wpnMag()) return false;
  if (this.isMagical() && !user.wpnMag()) return false;
  const note = 'Physical Break';
  const battler = this.object();
  const curClass = this.currentClass();
  const states = this.states();
  const isDoublehand = this.unhIsDoublehand();
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    feint += eval(state.meta[note]);
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (curClass.meta[note] !== undefined) {
        feint += eval(curClass.meta[note]);
      }
    }
  }
  if (!!battler.meta) {
    if (battler.meta[note] !== undefined) {
      feint += eval(battler.meta[note]);
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.checkMagBreak = function(target, handDex) {
  if (this.isCertainHit()) return false;
  if (!this.isPhysical()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && !user.wpnMag()) return false;
  if (this.isMagical() && user.wpnMag()) return false;
  const note = 'Magical Break';
  const battler = this.object();
  const curClass = this.currentClass();
  const states = this.states();
  const isDoublehand = this.unhIsDoublehand();
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    feint += eval(state.meta[note]);
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (curClass.meta[note] !== undefined) {
        feint += eval(curClass.meta[note]);
      }
    }
  }
  if (!!battler.meta) {
    if (battler.meta[note] !== undefined) {
      feint += eval(battler.meta[note]);
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.checkPhysFeint = function(target, handDex) {
  if (this.isCertainHit()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && user.wpnMag()) return false;
  if (this.isMagical() && !user.wpnMag()) return false;
  const note = 'Physical Feint';
  const battler = this.object();
  const curClass = this.currentClass();
  const states = this.states();
  const isDoublehand = this.unhIsDoublehand();
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    feint += eval(state.meta[note]);
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (curClass.meta[note] !== undefined) {
        feint += eval(curClass.meta[note]);
      }
    }
  }
  if (!!battler.meta) {
    if (battler.meta[note] !== undefined) {
      feint += eval(battler.meta[note]);
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.checkMagFeint = function(target, handDex) {
  if (this.isCertainHit()) return false;
  if (!handDex) handDex = 0;
  if (typeof handDex !== 'number') handDex = 0;
  if (isNaN(handDex)) handDex = 0;
  if (handDex < 0) handDex = 0;
  const weapons = this.weapons();
  if (handDex > weapons.length) handDex = weapons.length - 1;
  const action = this;
  if (!action.isWeapon(target)) return false;
  const user = this.subject();
  if (this.isPhysical() && !user.wpnMag()) return false;
  if (this.isMagical() && user.wpnMag()) return false;
  const note = 'Magical Feint';
  const battler = this.object();
  const curClass = this.currentClass();
  const states = this.states();
  const isDoublehand = this.unhIsDoublehand();
  let feint = 0;
  if (!this.hasNoWeapons()) {
    const weapon = weapons[handDex];
    if (!!weapon) {
      if (!!weapon.meta) {
        if (weapon.meta[note] !== undefined) {
          feint += eval(weapon.meta[note]);
        }
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (state.meta[note] === undefined) continue;
    feint += eval(state.meta[note]);
  }
  if (!!curClass) {
    if (!!curClass.meta) {
      if (curClass.meta[note] !== undefined) {
        feint += eval(curClass.meta[note]);
      }
    }
  }
  if (!!battler.meta) {
    if (battler.meta[note] !== undefined) {
      feint += eval(battler.meta[note]);
    }
  }
  const random = Math.randomInt(10000);
  return (random < feint);
};

Game_Action.prototype.physBreak = function(target) {
  if (!action.isPhysical()) return false;
  if (!Imported.VisuMZ_1_BattleCore) return (this.checkPhysBreak(target, 0) || this.checkPhysBreak(target, 1));
  if (!!user._activeWeaponSlot) return this.checkPhysBreak(target, 1);
  return this.checkPhysBreak(target, 0);
};

Game_Action.prototype.magBreak = function(target) {
  if (!action.isMagical()) return false;
  if (!Imported.VisuMZ_1_BattleCore) return (this.checkMagBreak(target, 0) || this.checkMagBreak(target, 1));
  if (!!user._activeWeaponSlot) return this.checkMagBreak(target, 1);
  return this.checkMagBreak(target, 0);
};

Game_Action.prototype.physFeint = function(target) {
  if (!action.isPhysical()) return false;
  if (!Imported.VisuMZ_1_BattleCore) return (this.checkPhysFeint(target, 0) || this.checkPhysFeint(target, 1));
  if (!!user._activeWeaponSlot) return this.checkPhysFeint(target, 1);
  return this.checkPhysFeint(target, 0);
};

Game_Action.prototype.magFeint = function(target) {
  if (!action.isMagical()) return false;
  if (!Imported.VisuMZ_1_BattleCore) return (this.checkMagFeint(target, 0) || this.checkMagFeint(target, 1));
  if (!!user._activeWeaponSlot) return this.checkMagFeint(target, 1);
  return this.checkMagFeint(target, 0);
};

Game_Action.prototype.blockExec = function(target) {
  if (!action.isPhysical()) return action.physBlock(target);
  if (!action.isMagical()) return action.magBlock(target);
  return false;
};

Game_Action.prototype.parryExec = function(target) {
  if (action.isPhysical()) return action.physParry(target);
  if (action.isMagical()) return action.magParry(target);
  return false;
};

Game_Action.prototype.breakExec = function(target) {
  if (action.isPhysical()) return action.physBreak(target);
  if (action.isMagical()) return action.magBreak(target);
  return false;
};

Game_Action.prototype.feintExec = function(target) {
  if (action.isPhysical()) return action.physFeint(target);
  if (action.isMagical()) return action.magFeint(target);
  return false;
};

Game_Action.prototype.advHit = function(target) {
  const action = this;
  const user = this.subject();
  const item = this.item();
  let advLvl = 0;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta['Accuracy Advantage']) advLvl += Number(eval(item.meta['Accuracy Advantage']));
      if (!!item.meta['Accuracy Disadvantage']) advLvl -= Number(eval(item.meta['Accuracy Disadvantage']));
    }
  }
  for (const obj of user.traitObjects()) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!!obj.meta['Accuracy Advantage']) advLvl += Number(eval(obj.meta['Accuracy Advantage']));
    if (!!obj.meta['Accuracy Disadvantage']) advLvl -= Number(eval(obj.meta['Accuracy Disadvantage']));
  }
  for (const obj of target.traitObjects()) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!!obj.meta['Evasion Advantage']) advLvl -= Number(eval(obj.meta['Evasion Advantage']));
    if (!!obj.meta['Evasion Disadvantage']) advLvl += Number(eval(obj.meta['Evasion Disadvantage']));
  }
  return advLvl;
};

Game_Action.prototype.advCrit = function(target) {
  const action = this;
  const user = this.subject();
  const item = this.item();
  let advLvl = 0;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta['Critrate Advantage']) advLvl += Number(eval(item.meta['Critrate Advantage']));
      if (!!item.meta['Critrate Disadvantage']) advLvl -= Number(eval(item.meta['Critrate Disadvantage']));
    }
  }
  for (const obj of user.traitObjects()) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!!obj.meta['Critrate Advantage']) advLvl += Number(eval(obj.meta['Critrate Advantage']));
    if (!!obj.meta['Critrate Disadvantage']) advLvl -= Number(eval(obj.meta['Critrate Disadvantage']));
  }
  for (const obj of target.traitObjects()) {
    if (!obj) continue;
    if (!obj.meta) continue;
    if (!!obj.meta['Critavoid Advantage']) advLvl -= Number(eval(obj.meta['Critavoid Advantage']));
    if (!!obj.meta['Critavoid Disadvantage']) advLvl += Number(eval(obj.meta['Critavoid Disadvantage']));
  }
  return advLvl;
};

Game_Action.prototype.orcCount = function(target) {
  if (!Imported.VisuMZ_1_ElementStatusCore) return 0;
  const user = this.subject();
  let orcCount = 0;
  for (const member of user.friendUnit().aliveMembers()) {
    if (member.hasTraitSet('orc')) orcCount += 0.5;
  }
  for (const member of target.friendUnit().aliveMembers()) {
    if (member.hasTraitSet('orc')) orcCount -= 0.5;
  }
  return orcCount;
};

Game_Action.prototype.gobCount = function(target) {
  if (!Imported.VisuMZ_1_ElementStatusCore) return 0;
  const user = this.subject();
  let gobCount = 0;
  for (const member of user.friendUnit().aliveMembers()) {
    if (member.hasTraitSet('goblin')) gobCount += 0.5;
  }
  for (const member of target.friendUnit().aliveMembers()) {
    if (member.hasTraitSet('goblin')) gobCount -= 0.5;
  }
  return gobCount;
};

Game_Action.prototype.gnomeAct = function(target) {
  if (!Imported.VisuMZ_1_ElementStatusCore) return 0;
  const user = this.subject();
  const random = Math.randomInt(300);
  if (user.hasTraitSet('gnome') && target.hasTraitSet('gnome')) {
    return ((random % 5) - 2);
  }
  if (user.hasTraitSet('gnome')) {
    return ((random % 3) - 1);
  }
  if (target.hasTraitSet('gnome')) {
    return ((random % 3) - 1);
  }
  return 0;
};

Game_Battler.prototype.unhIsRanged = function(curWpn) {
  const user = this;
  const note = 'unhRanged';
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  let isRanged = false;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        isRanged = eval(item.meta[note]);
        if (!!isRanged) return true;
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (!state.meta[note]) continue;
    if (!!eval(state.meta[note])) return true;
  }
  if (user.hasNoWeapons()) return false;
  const weapons = user.weapons();
  if (!curWpn) curWpn = 0;
  if (typeof curWpn !== 'number') curWpn = 0;
  if (isNaN(curWpn)) curWpn = 0;
  curWpn = Math.max(curWpn, 0);
  curWpn = Math.min(curWpn, weapons.length);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        try {
          isRanged = eval(weapon.meta[note]);
          if (isRanged) return true;
        } catch (e) {
          return false;
        }
      }
    }
  }
  return false;
};

Game_Action.prototype.unhIsRanged = function(target, curWpn) {
  if (this.isMagical()) return true;
  const action = this;
  const user = this.subject();
  const note = 'unhRanged';
  const item = action.item();
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  let isRanged = false;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        isRanged = eval(item.meta[note]);
        if (!!isRanged) return true;
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (!state.meta[note]) continue;
    if (!!eval(state.meta[note])) return true;
  }
  if (user.hasNoWeapons()) return false;
  const weapons = user.weapons();
  if (!curWpn) curWpn = 0;
  if (typeof curWpn !== 'number') curWpn = 0;
  if (isNaN(curWpn)) curWpn = 0;
  curWpn = Math.max(curWpn, 0);
  curWpn = Math.min(curWpn, weapons.length);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        try {
          isRanged = eval(weapon.meta[note]);
          if (isRanged) return true;
        } catch (e) {
          return false;
        }
      }
    }
  }
  return false;
};

Game_Action.prototype.unhIsReach = function(target, curWpn) {
  if (this.unhIsRanged(target, curWpn)) return true;
  const action = this;
  const user = this.subject();
  const note = 'unhReach';
  const item = action.item();
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  let isRanged = false;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        isRanged = eval(item.meta[note]);
        if (!!isRanged) return true;
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (!state.meta[note]) continue;
    if (!!eval(state.meta[note])) return true;
  }
  if (user.hasNoWeapons()) return false;
  const weapons = user.weapons();
  if (!curWpn) curWpn = 0;
  if (typeof curWpn !== 'number') curWpn = 0;
  if (isNaN(curWpn)) curWpn = 0;
  curWpn = Math.max(curWpn, 0);
  curWpn = Math.min(curWpn, weapons.length);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        try {
          isRanged = eval(weapon.meta[note]);
          if (isRanged) return true;
        } catch (e) {
          return false;
        }
      }
    }
  }
  return false;
};

Game_Action.prototype.unhIsNoContact = function(target, curWpn) {
  if (this.unhIsRanged(target, curWpn)) return true;
  const action = this;
  const user = this.subject();
  const note = 'unhNoContact';
  const item = action.item();
  const states = user.states();
  const isDoublehand = user.unhIsDoublehand();
  let isRanged = false;
  if (!!item) {
    if (!!item.meta) {
      if (!!item.meta[note]) {
        isRanged = eval(item.meta[note]);
        if (!!isRanged) return true;
      }
    }
  }
  for (const state of states) {
    if (!state) continue;
    if (!state.meta) continue;
    if (!state.meta[note]) continue;
    if (!!eval(state.meta[note])) return true;
  }
  if (user.hasNoWeapons()) return false;
  const weapons = user.weapons();
  if (!curWpn) curWpn = 0;
  if (typeof curWpn !== 'number') curWpn = 0;
  if (isNaN(curWpn)) curWpn = 0;
  curWpn = Math.max(curWpn, 0);
  curWpn = Math.min(curWpn, weapons.length);
  const weapon = weapons[curWpn];
  if (!!weapon) {
    if (!!weapon.meta) {
      if (!!weapon.meta[note]) {
        try {
          isRanged = eval(weapon.meta[note]);
          if (isRanged) return true;
        } catch (e) {
          return false;
        }
      }
    }
  }
  return false;
};
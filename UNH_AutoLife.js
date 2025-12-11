//=============================================================================
// Unhinged Development - Auto-Life
// UNH_AutoLife.js
//=============================================================================

var Imported = Imported || {};

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [AutoLife]
 * @author Unhinged Developer
 *
 * @param AutoLifeAmt
 * @text Auto Life Healing
 * @desc The HP restored upon revival
 * @type string
 * @default 20 * max / 100
 *
 * @param AutoLifeVar
 * @text Auto Life Variance
 * @desc The healing variance upon revival
 * @type number
 * @default 20
 *
 * @param AutoLifeAni
 * @text Auto Life Animation
 * @desc The animation played upon revival
 * @type animation
 * @default 0
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <UnhAutoLife>
 * - Use for States
 * - Flag a state as an Auto-Life state
 * <Unh Auto Life Heal: X>
 * - Use for States
 * - Sets an amount X to revive with (JavaScript)
 *   - origin: the source of the autolife state (VS Skills & States Core only)
 *   - target: the guy affected by the autolife state
 *   - max: "target"'s maximum HP
 * <Unh Auto Life Variance: X>
 * - Use for States
 * - Sets variance X for healing amount when unit revives (Number)
 * <Unh Auto Life Animation: X>
 * - Use for States
 * - Sets animation X to play when unit revives (Number)
 */
//=============================================================================

const UNH_AutoLife = {};
UNH_AutoLife.pluginName = 'UNH_AutoLife';
UNH_AutoLife.parameters = PluginManager.parameters(UNH_AutoLife.pluginName);
UNH_AutoLife.AutoLifeAmt = String(UNH_AutoLife.parameters['AutoLifeAmt'] || '0');
UNH_AutoLife.AutoLifeVar = Number(UNH_AutoLife.parameters['AutoLifeVar'] || 0);
UNH_AutoLife.AutoLifeAni = Number(UNH_AutoLife.parameters['AutoLifeAni'] || 0);

UNH_AutoLife.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_AutoLife.DataManager_isDatabaseLoaded.call(this)) return false;

  if (!UNH_AutoLife._loaded) {
	this.processUnhReraiseNotetags($dataEnemies);
	this.processUnhReraiseNotetags($dataArmors);
	this.processUnhReraiseNotetags($dataStates);
    UNH_AutoLife._loaded = true;
  }
  return true;
};

DataManager.processUnhReraiseNotetags = function(group) {
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);
    if (!!obj.meta) {
      if (!!obj.meta.UnhAutoLife) {
        obj.reviveAmt = String(UNH_AutoLife.AutoLifeAmt);
        obj.reviveVar = Number(UNH_AutoLife.AutoLifeVar);
        obj.reviveAniId = Number(UNH_AutoLife.AutoLifeAni);
        for (let i = 0; i < notedata.length; i++) {
          const line = notedata[i];
          if (line.match(/<Unh Auto Life Heal:[ ](.*)>/i)) {
            obj.reviveAmt = String(RegExp.$1);
          } else {
            obj.reviveAmt = String(UNH_AutoLife.AutoLifeAmt);
          }
          if (line.match(/<Unh Auto Life Variance:[ ](\d+)>/i)) {
            obj.reviveVar = Number(RegExp.$1);
          } else {
            obj.reviveVar = Number(UNH_AutoLife.AutoLifeVar);
          }
          if (line.match(/<Unh Auto Life Animation:[ ](\d+)>/i)) {
            obj.reviveAniId = Number(RegExp.$1);
          } else {
            obj.reviveAniId = Number(UNH_AutoLife.AutoLifeAni);
          }
        }
      } else {
        obj.reviveAmt = "0";
        obj.reviveVar = 0;
        obj.reviveAniId = Number(UNH_AutoLife.AutoLifeAni);
      }
    } else {
      obj.reviveAmt = "0";
      obj.reviveVar = 0;
      obj.reviveAniId = UNH_AutoLife.AutoLifeAni;
    }
  }
};

Game_Battler.prototype.unhReraiseAni = function(targets, object) {
  const aniId = object.reviveAniId;
  if (aniId !== 0) $gameTemp.requestAnimation(targets, aniId);
};

Game_Battler.prototype.unhReraiseStates = function() {
  const states = [];
  for (const state of this.states()) {
    if (!!state.meta) {
      if (!!state.meta.UnhAutoLife) {
        states.push(state);
      }
    }
  }
  return states;
};

Game_Battler.prototype.unhReraiseArmors = function() {
  if (this.isEnemy() && !Imported.UNH_VS_EnemyWeapons) return [];
  const armors = [];
  for (const armor of this.armors()) {
    if (!!armor.meta) {
      if (!!armor.meta.UnhAutoLife) {
        armors.push(armor);
      }
    }
  }
  return armors;
};

Game_Battler.prototype.unhSetArmorReraise = function(value) {
  if (this.isActor()) return;
  if (value === undefined) {
    if (this._armorRaised === undefined) this._armorRaised = 0;
  } else if (typeof value !== 'number') {
    if (this._armorRaised === undefined) this._armorRaised = 0;
  } else if (isNaN(value)) {
    if (this._armorRaised === undefined) this._armorRaised = 0;
  } else {
    this._armorRaised = value;
  }
  this._armorRaised = value;
};

Game_Battler.prototype.unhGetArmorReraise = function() {
  if (this.isActor()) return 0;
  return (this._armorRaised || 0);
};

Game_Battler.prototype.unhSetCanReraise = function(value) {
  if (this.isActor()) return;
  this._unhCanRaise = !!value;
};

Game_Battler.prototype.unhGetCanReraise = function() {
  if (this.isActor()) return false;
  return !!this._unhCanRaise;
};

Game_Battler.prototype.unhSetReraiseCt = function(value) {
  if (this.isActor()) return;
  if (value === undefined) {
    if (this._reraiseCt === undefined) this._reraiseCt = 0;
  } else if (typeof value !== 'number') {
    if (this._reraiseCt === undefined) this._reraiseCt = 0;
  } else if (isNaN(value)) {
    if (this._reraiseCt === undefined) this._reraiseCt = 0;
  } else {
    this._reraiseCt = value;
  }
  this.unhSetCanReraise(this._reraiseCt > 0);
};

Game_Battler.prototype.unhGetReraiseCt = function() {
  if (this.isActor()) return 0;
  if (this._reraiseCt === undefined) {
    this.unhInitReraiseCt();
  }
  return this._reraiseCt;
};

Game_Battler.prototype.unhInitReraiseCt = function() {
  if (this.isActor()) return;
  const enemy = user.enemy();
  if (!enemy) return;
  const meta = enemy.meta;
  if (!enemy.meta) {
    return;
  } else if (!enemy.meta.UnhAutoLife) {
    this.unhSetReraiseCt(0);
  } else if (isNaN(enemy.meta.UnhAutoLife)) {
    this.unhSetReraiseCt(0);
  } else {
    this.unhSetReraiseCt(Number(armor.meta.UnhAutoLife));
  }
};

Game_Battler.prototype.unhIsReraise = function() {
  if (this.unhReraiseStates().length > 0) return true;
  if (this.unhReraiseArmors().length > 0) return true;
  if (this.unhGetReraiseCt() > 0) return true;
  return false;
};

UNH_AutoLife.startBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
  for (const member of $gameTroop.members()) {
    member._armorRaised = 0;
    member.unhInitReraiseCt();
  }
  UNH_AutoLife.startBattle.call(this);
};

Game_Battler.prototype.unhStateHealing = function(state) {
  if (typeof state === 'number') {
    state = $dataStates[state];
  }
  const stateId = state.id;
  const value = state.reviveAmt;
  const variance = state.reviveVar;
  const target = this;
  const max = this.mhp;
  let origin;
  if (Imported.VisuMZ_1_SkillsStatesCore) {
    origin = this.getStateOrigin(stateId);
  } else {
    origin = this;
  }
  const retVal = Math.round(Number(eval(value)));
  const amp = Math.floor(Math.max((Math.abs(retVal) * eval(variance)) / 100, 0));
  const v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
  return retVal + v;
};

Game_Battler.prototype.unhArmorHealing = function(armor) {
  if (typeof armor === 'number') {
    armor = $dataArmors[armor];
  }
  const value = armor.reviveAmt;
  const variance = armor.reviveVar;
  const target = this;
  const max = this.mhp;
  const origin = this;
  const retVal = Math.round(Number(eval(value)));
  const amp = Math.floor(Math.max((Math.abs(retVal) * eval(variance)) / 100, 0));
  const v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
  return retVal + v;
};

Game_Battler.prototype.unhSelfHealing = function() {
  if (this.isActor()) return 0;
  const value = this.enemy().reviveAmt;
  const variance = this.enemy().reviveVar;
  const target = this;
  const max = this.mhp;
  const origin = this;
  const retVal = Math.round(Number(eval(value)));
  const amp = Math.floor(Math.max((Math.abs(retVal) * eval(variance)) / 100, 0));
  const v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
  return retVal + v;
};

UNH_AutoLife.Battler_addNewState = Game_Battler.prototype.addNewState;
Game_Battler.prototype.addNewState = function (stateId) {
  if (!this.unhIsReraise()) {
    UNH_AutoLife.Battler_addNewState.call(this, stateId);
    return;
  }
  if (stateId === this.deathStateId()) {
    const states = this.unhReraiseStates();
    const armors = this.unhReraiseArmors();
    const armorCt = this.unhGetArmorReraise();
    const raiseCt = this.unhGetReraiseCt();
    if (states.length > 0) {
      const reraiseState = states[Math.randomInt(states.length)];
      const reraiseHeal = this.unhStateHealing(reraiseState);
      if (reraiseHeal > 0) {
        this._hp = reraiseHeal;
        this.unhReraiseAni([this], reraiseState);
      }
      this.removeState(reraiseState.id);
    } else if (armors.length > armorCt) {
      const reraiseArmor = armors[Math.randomInt(armors.length)];
      const reraiseHeal = this.unhArmorHealing(reraiseArmor);
      if (reraiseHeal > 0) {
        this._hp = reraiseHeal;
        this.unhReraiseAni([this], reraiseArmor);
      }
      this.unhSetArmorReraise(armorCt + 1);
    } else if (raiseCt > 0 && this.isEnemy()) {
      const reraiseHeal = this.unhSelfHealing();
      if (reraiseHeal > 0) {
        this._hp = reraiseHeal;
        this.unhReraiseAni([this], this.enemy());
      }
      this.unhSetReraiseCt(raiseCt - 1);
    }
  }
  UNH_AutoLife.Battler_addNewState.call(this, stateId);
};

/*UNH_AutoLife.Battler_refresh = Game_Battler.prototype.refresh;
Game_Battler.prototype.refresh = function() {
  if (this.hp <= 0 || this.isDeathStateAffected()) {
    const states = this.unhReraiseStates();
    if (states.length > 0) {
      const reraiseState = states[Math.randomInt(states.length)];
      const reraiseHeal = this.unhReraiseHealing(reraiseState);
      this._hp = reraiseHeal;
      this.unhReraiseAni([this], reraiseState);
      this.removeState(reraiseState.id);
    }
  }
  UNH_AutoLife.Battler_refresh.call(this);
};*/
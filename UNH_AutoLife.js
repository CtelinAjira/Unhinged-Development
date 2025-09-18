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
        obj.reviveAmt = UNH_AutoLife.AutoLifeAmt;
        obj.reviveVar = UNH_AutoLife.AutoLifeVar;
        obj.reviveAniId = UNH_AutoLife.AutoLifeAni;
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
        obj.reviveAniId = 0;
      }
    } else {
      obj.reviveAmt = "0";
      obj.reviveVar = 0;
      obj.reviveAniId = 0;
    }
  }
};

Game_Battler.prototype.unhReraiseAni = function(targets, state) {
  const aniId = (state.reviveAniId === 0) ? UNH_AutoLife.AutoLifeAni : state.reviveAniId;
  $gameTemp.requestAnimation(targets, aniId);
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

Game_Battler.prototype.unhIsReraise = function() {
  return (this.unhReraiseStates().length > 0);
};

Game_Battler.prototype.unhReraiseHealing = function(state) {
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

UNH_AutoLife.Battler_refresh = Game_Battler.prototype.refresh;
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
};
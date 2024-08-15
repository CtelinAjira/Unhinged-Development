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
 * @param MirrorAnim
 * @parent AutoLifeAni
 * @text Mirror Animation
 * @desc Mirror the effect animation?
 * @type boolean
 * @on Mirror
 * @off Normal
 * @default false
 *
 * @param EnemyFlip
 * @parent AutoLifeAni
 * @text Enemy Flip?
 * @desc Flip the animation for enemies?
 * @type boolean
 * @on Flip for Enemies
 * @off No Flip
 * @default false
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

var UNH_AutoLife = {};
UNH_AutoLife.pluginName = 'UNH_AutoLife';
UNH_AutoLife.parameters = PluginManager.parameters(UNH_AutoLife.pluginName);
UNH_AutoLife.AutoLifeAmt = String(UNH_AutoLife.parameters['AutoLifeAmt'] || '0');
UNH_AutoLife.AutoLifeVar = Number(UNH_AutoLife.parameters['AutoLifeVar'] || 0);
UNH_AutoLife.AutoLifeAni = Number(UNH_AutoLife.parameters['AutoLifeAni'] || 0);
UNH_AutoLife.MirrorAnim = !!UNH_AutoLife.parameters['MirrorAnim'];
UNH_AutoLife.EnemyFlip = !!UNH_AutoLife.parameters['EnemyFlip'];

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
  for (var n = 1; n < group.length; n++) {
    var obj = group[n];
    var notedata = obj.note.split(/[\r\n]+/);
    if (!!obj.meta) {
      if (!!obj.meta.UnhAutoLife) {
        obj.reviveAmt = UNH_AutoLife.AutoLifeAmt;
        obj.reviveVar = UNH_AutoLife.AutoLifeVar;
        obj.reviveAniId = UNH_AutoLife.AutoLifeAni;
        for (var i = 0; i < notedata.length; i++) {
          var line = notedata[i];
          if (line.match(/<Unh Auto Life Heal:[ ](.*)>/i)) {
            obj.reviveAmt = String(RegExp.$1);
          }
          if (line.match(/<Unh Auto Life Variance:[ ](\d+)>/i)) {
            obj.reviveVar = Number(RegExp.$1);
          }
          if (line.match(/<Unh Auto Life Animation:[ ](\d+)>/i)) {
            obj.reviveAniId = Number(RegExp.$1);
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
  if (aniId === undefined) aniId = UNH_AutoLife.AutoLifeAni;
  var mirror = UNH_AutoLife.MirrorAnim;
  if (UNH_AutoLife.EnemyFlip) mirror = !mirror;
  $gameTemp.requestAnimation(targets, state.reviveAniId, mirror);
};

Game_Battler.prototype.unhReraiseProcess = function() {
  var states = [];
  for (var state of this.states()) {
    if (!!state.meta) {
      if (!!state.meta.UnhAutoLife) {
        states.push(state);
      }
    }
  }
  return states;
};

Game_Battler.prototype.unhReraiseHealing = function(state) {
  var value = state.reviveAmt;
  var variance = state.reviveVar;
  var target = this;
  var max = this.mhp;
  var origin;
  if (Imported.VisuMZ_1_SkillsStatesCore) {
    origin = this.getStateOrigin(state.id);
  } else {
    origin = this;
  }
  var retVal = Math.round(eval(value));
  var amp = Math.floor(Math.max((Math.abs(retVal) * variance) / 100, 0));
  var v = Math.randomInt(amp + 1) + Math.randomInt(amp + 1) - amp;
  return retVal + v;
};

UNH_AutoLife.Battler_refresh = Game_Battler.prototype.refresh;
Game_Battler.prototype.refresh = function() {
  if (this.hp <= 0 || this.isDeathStateAffected()) {
    var states = this.unhReraiseProcess();
    if (states.length > 0) {
      var reraiseState = states[Math.randomInt(states.length)];
      var reraiseHeal = this.unhReraiseHealing(reraiseState);
      this.setHp(0);
      this.gainHp(reraiseHeal);
      this.unhReraiseAni([this], reraiseState);
      this.removeState(reraiseState.id);
    }
  }
  UNH_AutoLife.Battler_refresh.call(this);
};

//=============================================================================
// Unhinged Development - Victory Variables
// UNH_VictoryVar.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_VictoryVar = true;

/*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VictoryVar]
 * @author Unhinged Developer
 * 
 * @help
 * <Variable X Reward: Y>
 * - Used for Enemies
 *   - Rewards +X (Number) to Variable Y (Number)
 */

const UNH_VictoryVar = {};
UNH_VictoryVar.pluginName = 'UNH_VictoryVar';
UNH_VictoryVar.parameters = PluginManager.parameters(UNH_VictoryVar.pluginName);
UNH_VictoryVar.varReward = JSON.parse(UNH_VictoryVar.parameters['varReward']);
UNH_VictoryVar.varCount = UNH_VictoryVar.varReward.length;

UNH_VictoryVar.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_VictoryVar.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_VictoryVar._loaded_UNH_VictoryVar) {
    this.processVarRewardsNotetags($dataEnemies);
    UNH_VictoryVar._loaded_UNH_VictoryVar = true;
  }
  return true;
};

DataManager.processVarRewardsNotetags = function(group) {
  let obj, notedata, line, varId, amt;
  for (let n = 1; n < group.length; n++) {
    obj = group[n];
    obj.varRewards = [];
    notedata = obj.note.split(/[\r\n]+/);
    for (let i = 0; i < notedata.length; i++) {
      line = notedata[i];
      if (line.match(/<VARIABLE (\d+) REWARD: (\d+)>/i)) {
        varId = Number(RegExp.$1);
        amt = 0;
        try {
          amt = Number(RegExp.$2);
        } catch (e) {
          amt = 0;
        }
        if (!obj.varRewards[varId]) {
          obj.varRewards[varId] = amt;
        } else {
          obj.varRewards[varId] += amt;
        }
      }
    }
  }
};

Game_Troop.prototype.variableTotal = function() {
  return $gameVariables._data.reduce(function(r, v, i) {
    if (!!v) r[i] = this.variableReward(i);
    return r;
  }, []);
};

Game_Troop.prototype.variableReward = function(varId) {
  const members = this.deadMembers();
  return members.reduce(function(r, enemy) {
    if (enemy.enemy().varRewards[varId] === undefined) return r;
    if (enemy.enemy().varRewards[varId] === null) return r;
    if (typeof enemy.enemy().varRewards[varId] !== 'number') return r;
    if (isNaN(enemy.enemy().varRewards[varId])) return r;
    return r + enemy.enemy().varRewards[varId];
  }, 0);
};

UNH_VictoryVar.BattleManager_makeRewards = BattleManager.makeRewards;
BattleManager.makeRewards = function() {
  UNH_VictoryVar.BattleManager_makeRewards.call(this);
  this._rewards.variables = $gameTroop.variableTotal();
};

UNH_VictoryVar.BattleManager_displayRewards = BattleManager.displayRewards;
BattleManager.displayRewards = function () {
  UNH_VictoryVar.BattleManager_displayRewards.call(this);
  this.displayDropVariables();
};

BattleManager.displayDropVariables = function() {
  const variables = this._rewards.variables;
  if (variables.length > 1) {
    $gameMessage.newPage();
    let variable;
    for (let i = 1; i < $gameSystem.variables.length; i++) {
      variable = variables[i];
      if (variable === undefined) continue;
      if (variable === null) continue;
      if (typeof variable !== 'number') continue;
      if (isNaN(variable)) continue;
      const text = TextManager.obtainExp.format(variable, $gameSystem.variables[i]);
      $gameMessage.add(text);
    }
  }
};

UNH_VictoryVar.BattleManager_gainRewards = BattleManager.gainRewards;
BattleManager.gainRewards = function() {
  UNH_VictoryVar.BattleManager_gainRewards.call(this);
    this.gainDropVariables();
};

BattleManager.gainDropVariables = function() {
  const variables = this._rewards.variables;
  if (variables.length > 1) {
    let variable;
    for (let i = 1; i < $gameSystem.variables.length; i++) {
      variable = variables[i];
      if (variable === undefined) continue;
      if (variable === null) continue;
      if (typeof variable !== 'number') continue;
      if (isNaN(variable)) continue;
      variable += $gameVariables.value(i);
      $gameVariables.setValue(i, variable);
    }
  }
};
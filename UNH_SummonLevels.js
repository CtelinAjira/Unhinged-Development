//=============================================================================
// Unhinged Development - Preload Actors: Summon Levels
// UNH_SummonLevels.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_SummonLevels = true;

//=============================================================================
 /*:
 * @target MZ
 * @base UNH_PreloadActors
 * @orderAfter UNH_PreloadActors
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [SummonLevels]
 * @author Unhinged Developer
 *
 * @param DefaultLevel
 * @text Default Enemy Level
 * @desc The default level for enemies
 * @type number
 * @default 1
 * @min 1
 * @max 99
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Do you want to call the stats of another actor?  With this plugin, I've 
 * already handled the screwy javascript required to sync up their levels with 
 * yours!
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Unh Summon>
 * - Use for Skills/Items
 * - Using this skill scales compatible summons to the user's level
 * <Unh Summon>
 * - Use for Actors
 * - Marks an actor as a summon for the purpose of this plugin
 * <Unh Actor Summon:X>
 * - Use for Actors
 * - Same as <unhSummon>, but also marks actor X (Database ID) as the dedicated 
 *   summoner
 * <Unh Enemy Summon:X>
 * - Use for Actors
 * - Same as <unhSummon>, but also marks enemy X (Database ID) as the dedicated 
 *   summoner
 * <unhSummonerLevel:X>
 * - Use for Enemies
 * - Gives enemies a level X (JS: Number) for the purposes of summoning
 *   - user: the enemy being given a level
 * - Do not use if also using UNH_MiscFunc.js
 * - Do not use if also using VisuMZ_3_EnemyLevels.js
 * <Unh Summon ID:X>
 * - Use for Skills/Items
 * - Marks an action to specifically use actor X (JS: Database ID) as the summon
 *   - action: the marked action
 *   - item: the action's database entry
 *   - user: the action's actual user
 */
//=============================================================================

const UNH_SummonLevels = {};
UNH_SummonLevels.pluginName = 'UNH_SummonLevels';
UNH_SummonLevels.parameters = PluginManager.parameters(UNH_SummonLevels.pluginName);
UNH_SummonLevels.DefaultLevel = Number(UNH_SummonLevels.parameters['DefaultLevel'] || 0);

UNH_SummonLevels.SkillIsSummon = {
  Skill:{'0':false},
  Item:{'0':false}
};

UNH_SummonLevels.SkillSummonIdGet = {
  Skill:{'0':new Function('action', 'const item = action.item();\nconst user = action.subject();\nreturn 0;')},
  Item:{'0':new Function('action', 'const item = action.item();\nconst user = action.subject();\nreturn 0;')}
};

UNH_SummonLevels.SummonGroups = {
  Actor:{'0':[]},
  Enemy:{'0':[]}
};

UNH_SummonLevels.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_SummonLevels.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!UNH_SummonLevels._loaded) {
    this.processUnhSkillSummonIdNotetags($dataSkills);
    this.processUnhSkillSummonIdNotetags($dataItems);
    this.processUnhSummonGroupNotetags($dataActors);
    this.processUnhSummonGroupNotetags($dataEnemies);
    UNH_SummonLevels._loaded = true;
  }
  return true;
};

DataManager.processUnhSummonGroupNotetags = function(group) {
  let groupKey = '';
  switch (group) {
    case $dataActors:
      groupKey = 'Actor';
      break;
    case $dataEnemies:
      groupKey = 'Enemy';
      break;
  }
  let smnGrp;
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    smnGrp = [];
    obj.groupKey = groupKey;
    for (const actor of $dataActors) {
      if (!actor) continue;
      const note = actor.note;
      if (note.match(/<(?:UNH SUMMON)>/i)) {
        smnGrp.push(actor);
      } else {
        const notedata = note.split(/[\r\n]+/);
        for (const line of notedata) {
          if (line.match(/<(?:UNH ACTOR SUMMON)>/i)) {
            if (groupKey === 'Actor') smnGrp.push(actor);
          } else if (line.match(/<(?:UNH ACTOR SUMMON):[ ](\d+)>/i)) {
            if (obj.id === Number(RegExp.$1) && groupKey === 'Actor') smnGrp.push(actor);
          }
          if (line.match(/<(?:UNH ENEMY SUMMON)>/i)) {
            if (groupKey === 'Enemy') smnGrp.push(actor);
          } else if (line.match(/<(?:UNH ENEMY SUMMON):[ ](\d+)>/i)) {
            if (obj.id === Number(RegExp.$1) && groupKey === 'Enemy') smnGrp.push(actor);
          }
        }
      }
    }
    UNH_SummonLevels.SummonGroups[groupKey][obj.id] = smnGrp;
  }
};

DataManager.processUnhSkillSummonIdNotetags = function(group) {
  let groupKey = '';
  switch (group) {
    case $dataSkills:
      groupKey = 'Skill';
      break;
    case $dataItems:
      groupKey = 'Item';
      break;
  }
  let unhSummonId, isSmn;
  for (let n = 1; n < group.length; n++) {
    isSmn = false;
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);
    obj.groupKey = groupKey;
    unhSummonId = 0;
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<(?:UNH SUMMON)>/i)) {
        unhSummonId = 0;
        isSmn = true;
      } else if (line.match(/<(?:UNH SUMMON ID):[ ](\d+)>/i)) {
        unhSummonId = parseInt(RegExp.$1);
        isSmn = true;
      } else if (line.match(/<(?:UNH SUMMON ID):[ ](*.)>/i)) {
        unhSummonId = String(RegExp.$1);
        isSmn = true;
      }
    }
    UNH_SummonLevels.SkillIsSummon[groupKey][n] = true;
    UNH_SummonLevels.SkillSummonIdGet[groupKey][n] = new Function('action', 'const item = action.item();\nconst user = action.subject();\nreturn (' + unhSummonId + ');');
  }
};

UNH_SummonLevels.hasPlugin = function(name) {
  return $plugins.some(function(plug) {
    if (!plug) return false;
    if (!plug.name) return false;
    if (!plug.status) return false;
    return plug.name === name;
  });
};

Game_BattlerBase.prototype.summons = function() {
  let id = ((this.isActor()) ? (this.actorId()) : (this.enemyId));
  let groupKey = ((this.isActor()) ? ('Actor') : ('Enemy'));
  return UNH_SummonLevels.SummonGroups[groupKey][id].map(function(id) {
    return $gameActors.actor(id);
  });
  /*return $gameActors.data().filter(function(actor) {
    if (!actor) return false;
    if (actor === this) return false;
    if ($gameParty.members().includes(actor)) return false;
    if (!actor.actor()) return false;
    if (!actor.actor().meta) return false;
    if (!!eval(actor.actor().meta.unhSummon)) {
      return true;
    }
    return false;
  });*/
};

/*Game_Actor.prototype.summons = function() {
  const summons = Game_BattlerBase.prototype.summons.call(this);
  const user = this;
  for (const actor of $gameActors.data()) {
    if (!actor) continue;
    if (actor === this) continue;
    if ($gameParty.members().includes(actor)) continue;
    if (!actor.actor()) continue;
    if (summons.includes(actor)) continue;
    if (!actor.actor().meta) continue;
    if (!actor.actor().meta.unhActorSummon) continue;
    if (typeof actor.actor().meta.unhActorSummon === 'boolean') {
      summons.push(actor);
      continue;
    }
    if (isNaN(actor.actor().meta.unhActorSummon)) continue;
    const actorId = this.actorId();
    const summonId = Number(eval(actor.actor().meta.unhActorSummon));
    if (actorId === summonId) {
      summons.push(actor);
    }
  }
  return summons;
};*/

/*Game_Enemy.prototype.summons = function() {
  const summons = Game_BattlerBase.prototype.summons.call(this);
  const user = this;
  for (const actor of $gameActors.data()) {
    if (!actor) continue;
    if (actor === this) continue;
    if ($gameParty.members().includes(actor)) continue;
    if (!actor.actor()) continue;
    if (summons.includes(actor)) continue;
    if (!actor.actor().meta) continue;
    if (!actor.actor().meta.unhEnemySummon) continue;
    if (typeof actor.actor().meta.unhEnemySummon === 'boolean') {
      summons.push(actor);
      continue;
    }
    if (isNaN(actor.actor().meta.unhEnemySummon)) continue;
    const enemyId = this.enemyId();
    const summonId = Number(eval(actor.actor().meta.unhEnemySummon));
    if (enemyId === summonId) {
      summons.push(actor);
    }
  }
  return summons;
};*/

UNH_SummonLevels.BattleManager_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
  const action = this._action;
  action.unhSummonCalcLevel();
  UNH_SummonLevels.BattleManager_startAction.call(this);
};

Game_Action.prototype.unhSummonCalcLevel = function(actorId) {
  const item = this.item();
  if (UNH_SummonLevels.SkillIsSummon[item.groupKey][item.id]) {
    const user = this.subject();
    const defSmnId = UNH_SummonLevels.SkillSummonIdGet[item.groupKey][item.id](this);
    const summons = user.summons();
    const actors = $gameActors.data();
    if (actorId === undefined) actorId = defSmnId;
    if (typeof actorId !== 'number') actorId = defSmnId;
    if (isNaN(actorId)) actorId = defSmnId;
    if (actorId < 0) actorId = defSmnId;
    if (actorId >= actors.length) actorId = defSmnId;
    const temp = ((UNH_SummonLevels.hasPlugin('VisuMZ_3_EnemyLevels')) ? (user.maxLevel()) : (99));
    const maxLevel = ((user.isActor()) ? (user.maxLevel()) : (temp));
    const level = user.unhLevel(maxLevel);
    if (actorId > 0) {
      const summon = $gameActors.actor(actorId);
      if (summons.includes(summon)) summon.changeExp(summon.expForLevel(level), false);
    } else {
      for (const summon of user.summons()) {
        if (summon.level === level) continue;
        summon.changeExp(summon.expForLevel(level), false);
      }
    }
  }
};

if (!UNH_SummonLevels.hasPlugin('VisuMZ_3_EnemyLevels') && !UNH_SummonLevels.hasPlugin('UNH_MiscFunc')) {
  Object.defineProperty(Game_Enemy.prototype, "level", {
    get: function () {
      return this.getLevel();
    },
    configurable: true
  });

  Game_Enemy.prototype.getLevel = function() {
    if (this._level === undefined) this._level = this.createLevel(99);
    return this._level;
  };

  Game_Enemy.prototype.createLevel = function(max) {
    const user = this.enemy();
    const defaultLevel = UNH_SummonLevels.DefaultLevel;
    if (!user) return defaultLevel;
    const meta = user.meta;
    if (!meta) return defaultLevel;
    const level = meta.unhSummonerLevel;
    if (!level) return defaultLevel;
    if (typeof level === 'number') {
      if (isNaN(level)) return UNH_SummonLevels.DefaultLevel;
	  return Math.min(Math.max(Number(level), 1), max);
    }
    if (/^\d+$/.test(level)) {
      if (isNaN(level)) return UNH_SummonLevels.DefaultLevel;
	  return Math.min(Math.max(Number(level), 1), max);
    }
    try {
      const dummy = eval(level);
      if (typeof dummy === 'object') return ((dummy.isActor()) ? (dummy.level) : (UNH_SummonLevels.DefaultLevel));
      if (isNaN(dummy)) return UNH_SummonLevels.DefaultLevel;
      return Math.min(Math.max(Number(dummy), 1), max);
    } catch (e) {
      return UNH_SummonLevels.DefaultLevel;
    }
  };
};

Game_BattlerBase.prototype.unhLevel = function(max) {
  return 1;
};

Game_Actor.prototype.unhLevel = function(max) {
  return Math.min(Math.max(Number(this.level), 1), max);
};

Game_Enemy.prototype.unhLevel = function(max) {
  return Math.min(Math.max(Number(this.level), 1), max);
};
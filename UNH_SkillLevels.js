//=============================================================================
// Unhinged Development - Skill Levels
// UNH_SkillLevels.js
//=============================================================================

var Imported = Imported || {};
Imported.UNH_SkillLevels = true;

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.02] [Unhinged] [SkillLevels]
 * @author Unhinged Developer
 *
 * @param PluginMode
 * @text Plugin Mode
 * @desc The mode the plugin will be using
 * @type boolean
 * @on Standalone Learn By Doing
 * @off VS Skill Learn System
 * @default true
 *
 * @param MaxLevel
 * @text Maximum Skill Level
 * @desc The maximum value for a skill's level
 * @type string
 * @default 20
 *
 * @param ExpToLevel
 * @text Experience to Level
 * @desc The required skill experience amount per skill level
 * @type string
 * @default 100
 *
 * @command AlterLevel
 * @text Alter Level
 * @desc Alter an actor's level to a number
 *
 * @arg actorArr
 * @text Actors
 * @type actor[]
 * @desc The actors being altered
 * @default 0
 *
 * @arg skillArr
 * @text Skills
 * @type skill[]
 * @desc The skills getting level changes
 * @default 0
 *
 * @arg targetLevel
 * @text Level
 * @type number
 * @desc The number of levels being worked with
 * @default 0
 *
 * @arg mathAction
 * @text Operation
 * @type select
 * @desc The operation of Level onto Skill
 * @option Set (=)
 * @option Add (+)
 * @option Sub (-)
 * @default Set (=)
 *
 * @command AlterExp
 * @text Alter Experience
 * @desc Alter an actor's skill EXP to a number
 *
 * @arg actorArr
 * @text Actors
 * @type actor[]
 * @desc The actors being altered
 * @default 0
 *
 * @arg skillArr
 * @text Skills
 * @type skill[]
 * @desc The skills getting level changes
 * @default 0
 *
 * @arg targetExp
 * @text EXP
 * @type number
 * @desc The number of EXP being worked with
 * @default 0
 *
 * @arg mathAction
 * @text Operation
 * @type select
 * @desc The operation of Level onto Skill
 * @option Set (=)
 * @option Add (+)
 * @option Sub (-)
 * @default Set (=)
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Have you ever wanted a proficiency system?  Well, this is a tool that you 
 * could use for that.
 *
 * Skills now have an individual level, and individual experience totals.
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <Skill X Initial Level: Y>
 * - Use for Actors/Enemies
 * - Sets the initial level to Y (integer) for skill X (database ID)
 * <Max Level: Y>
 * - Use for Skills
 * - Sets the maximum level for the skill (JavaScript)
 * <EXP to Level: Y>
 * - Use for Skills
 * - Sets the skill experience needed to level it up (JavaScript)
 *   - level: the target level
 * 
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * battler.unhMaxSkillLevel(id)
 * - returns the maximum level for that skill ID
 * battler.unhSkillLevel(id)
 * - returns the level in that skill ID
 * battler.unhSetSkillLevel(id, value)
 * - sets the level in that skill ID to a new value
 * battler.unhAddSkillLevel(id, value)
 * - increases the level in that skill ID by a value
 * battler.unhSkillExp(id)
 * - returns the current skill experience for that skill ID
 * battler.unhSetSkillExp(id, value)
 * - sets the skill experience in that skill ID to a new value
 * - if above EXP to Level, will adjust level accordingly
 * battler.unhAddSkillExp(id, value)
 * - increases the skill experience for that skill ID by a value
 * - if above EXP to Level, will adjust level accordingly
 *
 * ============================================================================
 * Note For Users
 * ============================================================================
 *
 * This plugin is fairly basic on its own - it's meant to interact with 
 * notetags from the VS plugin suite - I recommend pairing this plugin with 
 * Battle Core for expanded functionality, and maybe also Skill Learn System if 
 * you intend to make this pointbuy instead of FF2-style learn-by-doing.
 *
 * ============================================================================
 * Sample Notetag Setup (VS Skill Learn System)
 * ============================================================================
 * 
 * <Hide in Battle>
 * <JS On Learn Skill>
 *  const id = skill.id;
 *  const maxLv = user.unhMaxSkillLevel(id);
 *  user.unhSetSkillExp(id, 0);
 *  user.unhAddSkillLevel(id, 1);
 *  if (user.unhSkillLevel(index) < maxLv) user.forgetSkill(skill.id);
 *  user.refresh();
 * </JS On Learn Skill>
 * <JS Learn CP Cost>
 *  const id = skill.id;
 *  const tgLv = user.unhSkillLevel(id) + 1;
 *  const maxXp = user.unhExpToLevel(id, user.unhSkillLevel(id) + 1);
 *  const curXp = user.unhSkillExp(id);
 *  cost = maxXp - curXp;
 * </JS Learn CP Cost>
 */
//=============================================================================

const UNH_SkillLevels = {};
UNH_SkillLevels.pluginName = 'UNH_SkillLevels';
UNH_SkillLevels.parameters = PluginManager.parameters(UNH_SkillLevels.pluginName);
UNH_SkillLevels.MaxLevel = String(UNH_SkillLevels.parameters['MaxLevel'] || '0');
UNH_SkillLevels.ExpToLevel = String(UNH_SkillLevels.parameters['ExpToLevel'] || '0');
UNH_SkillLevels.PluginMode = !!UNH_SkillLevels.parameters['PluginMode'];

UNH_SkillLevels.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!UNH_SkillLevels.DataManager_isDatabaseLoaded.call(this)) return false;

  if (!UNH_SkillLevels._loaded) {
    this.processUnhSkillLevelNotetags($dataActors);
    this.processUnhSkillLevelNotetags($dataEnemies);
	this.processUnhSkillExpNotetags($dataSkills);
    UNH_SkillLevels._loaded = true;
  }
  return true;
};

DataManager.processUnhSkillLevelNotetags = function(group) {
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);
    obj.levels = [];
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<SKILL (\d+) INITIAL LEVEL:[ ](\d+)>/i)) {
        const skillId = Number(RegExp.$1);
        const skillLv = Number(RegExp.$2);
        const initSkill = {skillId:skillId, skillLv:skillLv};
        obj.levels.push(initSkill);
      } else if (line.match(/<SKILL (\d+) INITIAL LEVEL:[ ](.+)>/i)) {
        const skillId = Number(RegExp.$1);
        const skillLv = String(RegExp.$2);
        const initSkill = {skillId:skillId, skillLv:skillLv};
        obj.levels.push(initSkill);
      }
    }
  }
};

DataManager.processUnhSkillExpNotetags = function(group) {
  for (let n = 1; n < group.length; n++) {
    const obj = group[n];
    const notedata = obj.note.split(/[\r\n]+/);
    obj.lvlCap = UNH_SkillLevels.MaxLevel;
    obj.expCap = UNH_SkillLevels.ExpToLevel;
    for (let i = 0; i < notedata.length; i++) {
      const line = notedata[i];
      if (line.match(/<MAX LEVEL:[ ](.+)>/i)) {
        obj.lvlCap = String(RegExp.$1);
      }
      if (line.match(/<EXP TO LEVEL:[ ](.+)>/i)) {
        obj.expCap = String(RegExp.$1);
      }
    }
  }
};

PluginManager.registerCommand(UNH_SkillLevels.pluginName, "AlterLevel", function(args) {
  const actorArr = args.actorArr;
  if (actorArr === undefined) return;
  if (!Array.isArray(actorArr)) return;
  if (actorArr.length <= 0) return;
  const actors = [];
  for (const actorId of actorArr) {
    actors.push($gameActors.actor(actorId));
  }
  const skillArr = args.skillArr;
  if (skillArr === undefined) return;
  if (!Array.isArray(skillArr)) return;
  if (skillArr.length <= 0) return;
  let targetLevel = 0;
  const mathAction = args.mathAction.toUpperCase().trim();
  for (const actor of actors) {
    if (mathAction === 'ADD (+)') {
      targetLevel = Math.min(Math.max(args.targetLevel, 0), actor.unhMaxSkillLevel(skillId) - actor.unhSkillLevel(skillId));
      for (const skillId of skillArr) {
        actor.unhAddSkillLevel(skillId, targetLevel);
      }
    } else if (mathAction === 'SUB (-)') {
      targetLevel = Math.min(Math.max(args.targetLevel, 0), actor.unhSkillLevel(skillId));
      for (const skillId in skillArr) {
        actor.unhAddSkillLevel(skillId, -targetLevel);
      }
    } else {
      targetLevel = Math.min(Math.max(args.targetLevel, 0), actor.unhMaxSkillLevel(skillId));
      for (const skillId in skillArr) {
        actor.unhSetSkillLevel(skillId, targetLevel);
      }
    }
  }
});

PluginManager.registerCommand(UNH_SkillLevels.pluginName, "AlterExp", function(args) {
  const actorArr = args.actorArr;
  if (actorArr === undefined) return;
  if (!Array.isArray(actorArr)) return;
  if (actorArr.length <= 0) return;
  const actors = [];
  for (const actorId of actorArr) {
    actors.push($gameActors.actor(actorId));
  }
  const skillArr = args.skillArr;
  if (skillArr === undefined) return;
  if (!Array.isArray(skillArr)) return;
  if (skillArr.length <= 0) return;
  let targetExp = 0;
  const mathAction = args.mathAction.toUpperCase().trim();
  for (const actor of actors) {
    if (mathAction === 'ADD (+)') {
      targetExp = Math.min(Math.max(args.targetExp, 0), actor.unhExpToLevel(skillId) - actor.unhSkillExp(skillId));
      for (const skillId of skillArr) {
        actor.unhAddSkillExp(skillId, targetExp);
      }
    } else if (mathAction === 'SUB (-)') {
      targetExp = Math.min(Math.max(args.targetExp, 0), actor.unhSkillExp(skillId));
      for (const skillId in skillArr) {
        actor.unhAddSkillExp(skillId, -targetExp);
      }
    } else {
      targetExp = Math.min(Math.max(args.targetExp, 0), actor.unhExpToLevel(skillId));
      for (const skillId in skillArr) {
        actor.unhSetSkillExp(skillId, targetExp);
      }
    }
  }
});

UNH_SkillLevels.Actors_actor = Game_Actors.prototype.actor;
Game_Actors.prototype.actor = function(actorId) {
  actor = UNH_SkillLevels.Actors_actor.call(this, actorId);
  if (actor !== null) {
    actor.unhInitSkillLevels();
  }
  return actor;
};

Game_Actor.prototype.skillsToLearn = function() {
  try {
    return this.traitObjects().map(function(obj) {
      if (!obj) return [];
      if (!obj.meta) return [];
      const skills = String(obj.meta.SkillsToLevel).trim().split(' ');
      for (let skill of skills) {
        if (isNaN(skill)) {
          skill = 0;
        } else {
          skill = Number(skill);
        }
      }
      return skills;
    }).flat(Infinity).filter(function(num) {
      if (num <= 0) return false;
      if (num >= $dataSkills.length) return false;
      return true;
    });
  } catch (e) {
    return [];
  }
};

UNH_SkillLevels.Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function(advantageous) {
  UNH_SkillLevels.Battler_onBattleStart.call(this, advantageous);
  this.unhInitSkillLevels();
};

Game_BattlerBase.prototype.unhMaxSkillLevel = function(index) {
  const user = this;
  if (index === undefined) index = 0;
  if (typeof index !== 'number') return eval(UNH_SkillLevels.MaxLevel);
  index = index % $dataSkills.length;
  if (index === 0) return eval(UNH_SkillLevels.MaxLevel);
  const lvlCap = $dataSkills[index].lvlCap;
  return eval(lvlCap);
};

Game_BattlerBase.prototype.unhExpToLevel = function(index, level) {
  const user = this;
  if (level === undefined) level = this.unhSkillLevel(index) + 1;
  if (index === undefined) index = 0;
  if (typeof index !== 'number') return eval(UNH_SkillLevels.ExpToLevel);
  index = index % $dataSkills.length;
  level = Math.max(level, 1);
  if (index === 0) return Math.round(eval(UNH_SkillLevels.ExpToLevel));
  const lvlCap = this.unhMaxSkillLevel(index);
  const expCap = $dataSkills[index].expCap;
  return Math.round(eval(expCap));
};

Game_BattlerBase.prototype.unhInitSkillLevels = function() {
  const isInit = !!this._unhIsSkillInit;
  if (!isInit) this._unhSkillLevel = [];
  this._unhIsSkillInit = true;
  return isInit;
};

Game_Enemy.prototype.unhInitSkillLevels = function() {
  const isInit = Game_BattlerBase.prototype.unhInitSkillLevels.call(this);
  if (!isInit) {
    for (const r of this.enemy().levels) {
      if (typeof r.skillLv === 'number') {
        if (!isNaN(r.skillLv)) {
          this._unhSkillLevel[r.skillId] = {level:r.skillLv, exp:0};
        } else {
          this._unhSkillLevel[r.skillId] = {level:0, exp:0};
        }
      } else {
        const user = this;
        this._unhSkillLevel[r.skillId] = {level:eval(r.skillLv), exp:0};
      }
    }
  }
  return isInit;
};

Game_Actor.prototype.unhInitSkillLevels = function() {
  const isInit = Game_BattlerBase.prototype.unhInitSkillLevels.call(this);
  if (!isInit) {
    for (const r of this.actor().levels) {
      if (typeof r.skillLv === 'number') {
        if (!isNaN(r.skillLv)) {
          this._unhSkillLevel[r.skillId] = {level:r.skillLv, exp:0};
        } else {
          this._unhSkillLevel[r.skillId] = {level:0, exp:0};
        }
      } else {
        const user = this;
        this._unhSkillLevel[r.skillId] = {level:eval(r.skillLv), exp:0};
      }
    }
  }
  return isInit;
};

Game_BattlerBase.prototype.unhSkillLevel = function(index) {
  this.unhInitSkillLevels();
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (this._unhSkillLevel[index] === undefined) {
    this._unhSkillLevel[index] = {level:0, exp:0};
  }
  const currentLevel = this._unhSkillLevel[index];
  return Math.min(currentLevel.level, this.unhMaxSkillLevel(index));
};

Game_BattlerBase.prototype.unhSetSkillLevel = function(index, value) {
  this.unhInitSkillLevels();
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (value === undefined) value = 0;
  if (this._unhSkillLevel[index] === undefined) {
    this._unhSkillLevel[index] = {level:0, exp:0};
  }
  const currentLevel = this._unhSkillLevel[index];
  this._unhSkillLevel[index] = {level:Math.max(Math.min(value, this.unhMaxSkillLevel(index)), 0), exp:currentLevel.exp};
};

Game_BattlerBase.prototype.unhAddSkillLevel = function(index, value) {
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (value === undefined) value = 0;
  this.unhSetSkillLevel(index, this.unhSkillLevel(index) + value);
};

Game_BattlerBase.prototype.unhSkillExp = function(index) {
  this.unhInitSkillLevels();
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (this._unhSkillLevel[index] === undefined) {
    this._unhSkillLevel[index] = {level:0, exp:0};
  }
  const currentLevel = this._unhSkillLevel[index];
  return Math.min(currentLevel.exp, this.unhExpToLevel(index));
};

Game_BattlerBase.prototype.unhSetSkillExp = function(index, value) {
  this.unhInitSkillLevels();
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (value === undefined) value = 0;
  if (this._unhSkillLevel[index] === undefined) {
    this._unhSkillLevel[index] = {level:0, exp:0};
  }
  const currentLevel = this._unhSkillLevel[index];
  this._unhSkillLevel[index] = {level:Math.min(currentLevel.level, this.unhMaxSkillLevel(index)), exp:value};
  if (this.unhSkillLevel(index) >= this.unhMaxSkillLevel(index)) {
    this._unhSkillLevel[index] = {level:this.unhMaxSkillLevel(index), exp:0};
  }
  while(this._unhSkillLevel[index].exp > this.unhExpToLevel(index) && this.unhSkillLevel(index) < this.unhMaxSkillLevel(index)) {
    const tempLevel = this._unhSkillLevel[index];
    this._unhSkillLevel[index] = {level:Math.min(tempLevel.level, this.unhMaxSkillLevel(index)), exp:tempLevel.exp-this.unhExpToLevel(index)};
    this.unhAddSkillLevel(index, 1);
    if (this.unhSkillLevel(index) >= this.unhMaxSkillLevel(index)) {
      this._unhSkillLevel[index] = {level:this.unhMaxSkillLevel(index), exp:0};
    }
  }
};

Game_BattlerBase.prototype.unhAddSkillExp = function(index, value) {
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (value === undefined) value = 0;
  this.unhSetSkillExp(index, this.unhSkillExp(index) + value);
};

if (!!UNH_SkillLevels.PluginMode) {
  UNH_SkillLevels.Action_apply = Game_Action.prototype.apply;
  Game_Action.prototype.apply = function(target) {
    UNH_SkillLevels.Action_apply.call(this, target);
    if (this.isSkill()) {
      const user = this.subject();
      const item = this.item();
      user.unhAddSkillExp(item.id, 1);
    }
  };
}
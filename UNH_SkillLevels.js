//=============================================================================
// Unhinged Development - Skill Levels
// UNH_SkillLevels.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [SkillLevels]
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

UNH_SkillLevels.Actors_actor = Game_Actors.prototype.actor;
Game_Actors.prototype.actor = function(actorId) {
  actor = UNH_SkillLevels.Actors_actor.call(this, actorId);
  if (actor !== null) {
    if (!actor._unhIsSkillInit) {
      actor.unhInitSkillLevels();
    }
  }
  return actor;
};

Game_Enemy.prototype.onBattleStart = function(advantageous) {
  Game_Battler.prototype.onBattleStart.call(this, advantageous);
  if (!this._unhIsSkillInit) {
    this.unhInitSkillLevels();
  }
};

Game_BattlerBase.prototype.unhMaxSkillLevel = function(index) {
  if (index === undefined) index = 0;
  if (typeof index !== 'number') return eval(UNH_SkillLevels.MaxLevel);
  index = index % $dataSkills.length;
  if (index === 0) return eval(UNH_SkillLevels.MaxLevel);
  const lvlCap = $dataSkills[index].lvlCap;
  return eval(lvlCap);
};

Game_BattlerBase.prototype.unhExpToLevel = function(index, level) {
  if (index === undefined) index = 0;
  if (typeof index !== 'number') return eval(UNH_SkillLevels.ExpToLevel);
  index = index % $dataSkills.length;
  if (index === 0) return eval(UNH_SkillLevels.ExpToLevel);
  if (level === undefined) level = this.unhSkillLevel(index) + 1;
  const expCap = $dataSkills[index].expCap;
  return eval(expCap);
};

Game_BattlerBase.prototype.unhInitSkillLevels = function() {
  this._unhIsSkillInit = true;
  this._unhSkillLevel = [];
};

Game_Enemy.prototype.unhInitSkillLevels = function() {
  Game_BattlerBase.prototype.unhInitSkillLevels.call(this);
  for (const r of this.enemy().levels) {
    this._unhSkillLevel[r.skillId] = {level:r.skillLv, exp:0};
  }
};

Game_Actor.prototype.unhInitSkillLevels = function() {
  Game_BattlerBase.prototype.unhInitSkillLevels.call(this);
  for (const r of this.actor().levels) {
    this._unhSkillLevel[r.skillId] = {level:r.skillLv, exp:0};
  }
};

Game_BattlerBase.prototype.unhSkillLevel = function(index) {
  if (this._unhSkillLevel === undefined) this.unhInitSkillLevels();
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (this._unhSkillLevel[index] === undefined) {
    this._unhSkillLevel[index] = {level:0, exp:0};
  }
  this._unhSkillLevel[index].level = Math.min(this._unhSkillLevel[index].level, this.unhMaxSkillLevel(index));
  return this._unhSkillLevel[index].level;
};

Game_BattlerBase.prototype.unhSetSkillLevel = function(index, value) {
  if (this._unhSkillLevel === undefined) this.unhInitSkillLevels();
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (value === undefined) value = 0;
  if (this._unhSkillLevel[index] === undefined) {
    this._unhSkillLevel[index] = {level:0, exp:0};
  }
  this._unhSkillLevel[index].level = Math.min(value, this.unhMaxSkillLevel());
};

Game_BattlerBase.prototype.unhAddSkillLevel = function(index, value) {
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (value === undefined) value = 0;
  this.unhSetSkillLevel(index, index + value);
};

Game_BattlerBase.prototype.unhSkillExp = function(index) {
  if (this._unhSkillLevel === undefined) this.unhInitSkillLevels();
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (this._unhSkillLevel[index] === undefined) {
    this._unhSkillLevel[index] = {level:0, exp:0};
  }
  this._unhSkillLevel[index].exp = Math.min(this._unhSkillLevel[index].exp, this.unhExpToLevel(index));
  return this._unhSkillLevel[index].exp;
};

Game_BattlerBase.prototype.unhSetSkillExp = function(index, value) {
  if (this._unhSkillLevel === undefined) this.unhInitSkillLevels();
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (value === undefined) value = 0;
  if (this._unhSkillLevel[index] === undefined) {
    this._unhSkillLevel[index] = {level:0, exp:0};
  }
  this._unhSkillLevel[index].exp = value;
  if (this.unhSkillLevel(index) >= this.unhMaxSkillLevel()) {
    this._unhSkillLevel[index].exp = 0;
  }
  while(this._unhSkillLevel[index].exp > this.unhExpToLevel() && this.unhSkillLevel(index) < this.unhMaxSkillLevel()) {
    this._unhSkillLevel[index].exp -= this.unhExpToLevel(index);
    this.unhAddSkillLevel(index, 1);
    if (this.unhSkillLevel(index) >= this.unhMaxSkillLevel()) {
      this._unhSkillLevel[index].exp = 0;
    }
  }
};

Game_BattlerBase.prototype.unhAddSkillExp = function(index, value) {
  if (index === undefined) index = 0;
  index = index % $dataSkills.length;
  if (value === undefined) value = 0;
  this.unhSetSkillExp(index, index + value);
};

UNH_SkillLevels.Action_apply = Game_Action.prototype.apply;
Game_Action.prototype.apply = function(target) {
  UNH_SkillLevels.Action_apply.call(this, target);
  if (UNH_SkillLevels.PluginMode) {
    const user = this.subject();
    const item = this.item();
    user.unhAddSkillExp(item.id, 1);
  }
};
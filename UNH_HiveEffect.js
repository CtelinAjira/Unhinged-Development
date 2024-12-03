//=============================================================================
// Unhinged Development - Hive Effects
// UNH_HiveEffect.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @orderAfter VisuMZ_0_CoreEngine
 * @orderAfter UNH_ParamSwap
 * @plugindesc [RPG Maker MZ] [Version 1.01] [Unhinged] [HiveEffect]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Here's a fun effect - HIVE MINDS.  I've decided to implement this via 
 * notetags.  Each stat, hidden or otherwise, has a hive mind associated with 
 * it.  Anyone tagged with the tags below is added to that stat's hivemind. 
 * Everyone within any given hive mind will use the highest value for the stat 
 * that hive mind is sharing.
 * 
 * For example, those in the HIT hive mind will key their accuracy off of the 
 * highest HIT among those tagged with <HivemindXParam:0>.
 * 
 * ============================================================================
 * Notetags
 * ============================================================================
 * 
 * <HivemindParam:X>
 * - Use for Actors/Weapons/Armors/Enemies/States
 * - Assigns param X (Number) to highest value among party
 * 
 * <HivemindXParam:X>
 * - Use for Actors/Weapons/Armors/Enemies/States
 * - Assigns xparam X (Number) to highest value among party
 * 
 * <HivemindSParam:X>
 * - Use for Actors/Weapons/Armors/Enemies/States
 * - Assigns sparam X (Number) to highest value among party
 */
//=============================================================================

const UNH_HiveEffect = {};
UNH_HiveEffect.pluginName = 'UNH_HiveEffect';

Game_BattlerBase.prototype.paramHiveMembers = function(paramId) {
  if (paramId === undefined) return [this];
  if (typeof paramId === 'string') {
    paramId = paramId.toLowerCase();
    if (paramId === 'maxhp') paramId = 'mhp';
    if (paramId === 'maxmp') paramId = 'mmp';
    paramId = ['mhp','mmp','atk','def','mat','mdf','agi','luk'].indexOf(paramId);
  }
  if (typeof paramId !== 'number') return [this];
  if (paramId <= 1) return [this];
  for (const obj of this.traitObjects()) {
    if (!obj) return [this];
    if (!obj.meta) return [this];
    if (!obj.meta.HivemindParam) return [this];
    if (obj.meta.HivemindParam !== paramId) return [this];
  }
  const isHive = this.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    if (!obj.meta.HivemindParam) return false;
    return (obj.meta.HivemindParam !== paramId);
  });
  if (!isHive) return [this];
  return this.friendsUnit().aliveMembers().filter(function(member) {
    for (const obj of member.traitObjects()) {
      if (!obj) return false;
      if (!obj.meta) return false;
      if (!obj.meta.HivemindParam) return false;
      if (obj.meta.HivemindParam === paramId) return true;
	}
    return false;
  });
};

Game_BattlerBase.prototype.xparamHiveMembers = function(xparamId) {
  if (xparamId === undefined) return [this];
  if (typeof xparamId === 'string') {
    xparamId = xparamId.toLowerCase();
    xparamId = ['hit','eva','cri','cev','mev','mrf','cnt','hrg','mrg','trg'].indexOf(xparamId);
  }
  if (typeof xparamId !== 'number') return [this];
  if (xparamId === -1) return [this];
  const isHive = this.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    if (!obj.meta.HivemindXParam) return false;
    return (obj.meta.HivemindXParam !== xparamId);
  });
  if (!isHive) return [this];
  return this.friendsUnit().members().filter(function(member) {
    if (member.isDead()) return false;
    for (const obj of member.traitObjects()) {
      if (!obj) return false;
      if (!obj.meta) return false;
      if (!obj.meta.HivemindXParam) return false;
      if (obj.meta.HivemindXParam === xparamId) return true;
	}
    return false;
  });
};

Game_BattlerBase.prototype.sparamHiveMembers = function(sparamId) {
  if (sparamId === undefined) return [this];
  if (typeof sparamId === 'string') {
    sparamId = sparamId.toLowerCase();
    sparamId = ['tgr','grd','rec','pha','mcr','tcr','pdr','mdr','fdr','exr'].indexOf(sparamId);
  }
  if (typeof sparamId !== 'number') return [this];
  if (sparamId === -1) return [this];
  const isHive = this.traitObjects().some(function(obj) {
    if (!obj) return false;
    if (!obj.meta) return false;
    if (!obj.meta.HivemindSParam) return false;
    return (obj.meta.HivemindSParam !== xparamId);
  });
  if (!isHive) return [this];
  return this.friendsUnit().members().filter(function(member) {
    if (member.isDead()) return false;
    for (const obj of member.traitObjects()) {
      if (!obj) return false;
      if (!obj.meta) return false;
      if (!obj.meta.HivemindSParam) return false;
      if (obj.meta.HivemindSParam === sparamId) return true;
	}
    return false;
  });
};

UNH_HiveEffect.BattlerBase_param = Game_BattlerBase.prototype.param;
Game_BattlerBase.prototype.param = function(paramId) {
  const defVal = UNH_HiveEffect.BattlerBase_param.call(this, paramId);
  if ([0,1].includes(paramId)) return defVal;
  const members = this.paramHiveMembers(paramId);
  if (members.length <= 1) return defVal;
  return members.reduce(function(r, member) {
    return Math.max(r, UNH_HiveEffect.BattlerBase_param.call(member, paramId));
  }, defVal);
};

UNH_HiveEffect.BattlerBase_xparam = Game_BattlerBase.prototype.xparam;
Game_BattlerBase.prototype.xparam = function(xparamId) {
  const defVal = UNH_HiveEffect.BattlerBase_xparam.call(this, xparamId);
  const members = this.xparamHiveMembers(xparamId);
  if (members.length <= 1) return defVal;
  return members.reduce(function(r, member) {
    return Math.max(r, UNH_HiveEffect.BattlerBase_xparam.call(member, xparamId));
  }, defVal);
};

UNH_HiveEffect.BattlerBase_sparam = Game_BattlerBase.prototype.sparam;
Game_BattlerBase.prototype.sparam = function(sparamId) {
  const defVal = UNH_HiveEffect.BattlerBase_sparam.call(this, sparamId);
  if (sparamId === 0) return defVal;
  const members = this.sparamHiveMembers(sparamId);
  if (members.length <= 1) return defVal;
  return members.reduce(function(r, member) {
    return Math.max(r, UNH_HiveEffect.BattlerBase_sparam.call(member, sparamId));
  }, defVal);
};
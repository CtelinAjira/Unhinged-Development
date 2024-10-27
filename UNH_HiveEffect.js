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
  if (paramId === -1) return [this];
  return this.friendsUnit().members().filter(function(member) {
    if (member.isDead()) return false;
    for (const obj of member.traitObjects()) {
      if (!obj.meta) continue;
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
  return this.friendsUnit().members().filter(function(member) {
    if (member.isDead()) return false;
    for (const obj of member.traitObjects()) {
      if (!obj.meta) continue;
      if (obj.meta.HivemindXParam === paramId) return true;
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
  return this.friendsUnit().members().filter(function(member) {
    if (member.isDead()) return false;
    for (const obj of member.traitObjects()) {
      if (!obj.meta) continue;
      if (obj.meta.HivemindSParam === paramId) return true;
	}
    return false;
  });
};

UNH_ParamSwap.BattlerBase_param = Game_BattlerBase.prototype.param;
Game_BattlerBase.prototype.param = function(paramId) {
  const paramArray = this.paramHiveMembers(paramId).map(function(member) {
    return UNH_ParamSwap.BattlerBase_param.call(member, paramId);
  });
  return Math.max(paramArray);
};

UNH_ParamSwap.BattlerBase_xparam = Game_BattlerBase.prototype.xparam;
Game_BattlerBase.prototype.xparam = function(xparamId) {
  const xparamArray = this.xparamHiveMembers(xparamId).map(function(member) {
    return UNH_ParamSwap.BattlerBase_xparam.call(member, xparamId);
  });
  return Math.max(xparamArray);
};

UNH_ParamSwap.BattlerBase_sparam = Game_BattlerBase.prototype.sparam;
Game_BattlerBase.prototype.sparam = function(sparamId) {
  const sparamArray = this.sparamHiveMembers(sparamId).map(function(member) {
    return UNH_ParamSwap.BattlerBase_sparam.call(member, sparamId);
  });
  return Math.max(sparamArray);
};
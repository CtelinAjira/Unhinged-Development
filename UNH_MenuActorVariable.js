//=============================================================================
// Unhinged Development - menuActor Variable
// UNH_MenuActorVariable.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [PhysicMagicDefense]
 * @author Unhinged Developer
 *
 * @param VariableId
 * @text Actor Variable
 * @desc The variable used to store the menuActor ID
 * @type variable
 * @default 1
 *
 * @help
 */
//=============================================================================

var UNH_MenuActorVariable = {};
UNH_MenuActorVariable.pluginName = 'UNH_MenuActorVariable';
UNH_MenuActorVariable.parameters = PluginManager.parameters(UNH_MenuActorVariable.pluginName);
UNH_MenuActorVariable.VariableId = Number(UNH_MenuActorVariable.parameters['VariableId'] || 1);

UNH_MenuActorVariable.Party_menuActor = Game_Party.prototype.menuActor;
Game_Party.prototype.menuActor = function() {
  let actor = UNH_MenuActorVariable.Party_menuActor.call(this);
  if ($gameVariables.value(UNH_MenuActorVariable.VariableId) !== actor.actorId()) $gameVariables.setValue(UNH_MenuActorVariable.VariableId, actor.actorId());
  return actor;
};

UNH_MenuActorVariable.Party_setMenuActor = Game_Party.prototype.setMenuActor;
Game_Party.prototype.setMenuActor = function(actor) {
  if ($gameVariables.value(UNH_MenuActorVariable.VariableId) !== actor.actorId()) $gameVariables.setValue(UNH_MenuActorVariable.VariableId, actor.actorId());
  UNH_MenuActorVariable.Party_setMenuActor.call(this, actor);
};

UNH_MenuActorVariable.ActorCommand_setup = Window_ActorCommand.prototype.setup;
Window_ActorCommand.prototype.setup = function(actor) {
  if ($gameVariables.value(UNH_MenuActorVariable.VariableId) !== actor.actorId()) $gameVariables.setValue(UNH_MenuActorVariable.VariableId, actor.actorId());
  UNH_MenuActorVariable.ActorCommand_setup.call(this, actor);
};

UNH_MenuActorVariable.ActorCommand_actor = Window_ActorCommand.prototype.actor;
Window_ActorCommand.prototype.actor = function() {
  if ($gameVariables.value(UNH_MenuActorVariable.VariableId) !== actor.actorId()) $gameVariables.setValue(UNH_MenuActorVariable.VariableId, actor.actorId());
  return Window_ActorCommand.prototype.actor.call(this);
};

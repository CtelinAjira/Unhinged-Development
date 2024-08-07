//=============================================================================
// Unhinged Development - VS ATB: Interrupt State
// UNH_VS_InterruptState.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [VS_InterruptState]
 * @author Unhinged Developer
 * @base VisuMZ_2_BattleSystemATB
 * @orderAfter VisuMZ_2_BattleSystemATB
 *
 * @param InterruptStateID
 * @text Interrupt State
 * @desc The state representing skill interruption
 * @type state
 * @default 0
 *
 * @param InterruptAsRestrict
 * @text Interruption as Restriction?
 * @desc Do you want ATB Interrupt to proc "Remove by Restricton"?
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @help
 * ============================================================================
 * Plugin Description
 * ============================================================================
 * 
 * Have a state represent the ATB Interrupt
 */
//=============================================================================

const UNH_InterruptState = {};
UNH_InterruptState.pluginName = 'UNH_InterruptState';
UNH_InterruptState.parameters = PluginManager.parameters(UNH_InterruptState.pluginName);
UNH_InterruptState.InterruptStateID = Number(UNH_InterruptState.parameters['InterruptStateID'] || 0);
UNH_InterruptState.InterruptAsRestrict = !!UNH_InterruptState.parameters['InterruptAsRestrict'];

if (UNH_InterruptState.InterruptStateID > 0 && UNH_InterruptState.InterruptStateID < $dataStates.length) {
  UNH_InterruptState.Battler_onAtbInterrupt_restrict = Game_Battler.prototype.onAtbInterrupt;
  Game_Battler.prototype.onAtbInterrupt = function () {
    UNH_InterruptState.Battler_onAtbInterrupt_restrict.call(this);
    for (const state of this.states()) {
      if (state.removeByRestriction) {
        this.removeState(state.id);
      }
    }
  };
}

if (UNH_InterruptState.InterruptStateID > 0 && UNH_InterruptState.InterruptStateID < $dataStates.length) {
  UNH_InterruptState.Battler_atbInterrupt = Game_Battler.prototype.atbInterrupt;
  Game_Battler.prototype.atbInterrupt = function () {
    const interStateId = UNH_InterruptState.InterruptStateID;
    if (this.isStateResist(interStateId)) {
      return;
    }
    if (Math.random() >= this.stateRate(interStateId)) {
      return;
    }
    UNH_InterruptState.Battler_atbInterrupt.call(this);
  };
  UNH_InterruptState.Battler_onAtbInterrupt_state = Game_Battler.prototype.onAtbInterrupt;
  Game_Battler.prototype.onAtbInterrupt = function () {
    const interStateId = UNH_InterruptState.InterruptStateID;
    UNH_InterruptState.Battler_onAtbInterrupt_state.call(this);
    if (!target.isStateAffected(interStateId)) {
      target.addState(interStateId);
    }
  };
  UNH_InterruptState.Battler_startTpbCasting = Game_Battler.prototype.startTpbCasting;
  Game_Battler.prototype.startTpbCasting = function() {
    const interStateId = UNH_InterruptState.InterruptStateID;
    UNH_InterruptState.Battler_startTpbCasting.call(this);
    target.removeState(interStateId);
  };
}
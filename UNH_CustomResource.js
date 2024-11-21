//=============================================================================
// Unhinged Development - Custom Skill Resources
// UNH_CustomResource.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [CustomResource]
 * @author Unhinged Developer
 *
 * @param CustGauge
 * @text Custom Resources
 * @desc The list of custom resources
 * @type struct<GaugeObj>[]
 *
 * @help
 * ============================================================================
 * Note from Unhinged Game Developer
 * ============================================================================
 *
 * RPG Maker UI is Open Sorcery for me at this point in time (may change for 
 * future updates).  For now, I recommend a plugin that allows for custom 
 * gauges (e.g. VS Skills & States Core) and/or a plugin that allows for custom 
 * text codes (e.g. VS Message Core) if you want to actually display these 
 * resources.
 */
 /*~struct~GaugeObj:
 * @param key
 * @text Resource Key
 * @desc The name of this resource within the code
 * e.g. ep
 * @type string
 *
 * @param name
 * @text Resource Name
 * @desc The name of this resource for readability
 * e.g. Energy Points
 * @type string
 *
 * @param code
 * @text Code for Resource Cap
 * @desc The code for determining this resource's maximum
 * The variable 'note' references Parameter Name
 * Variables: user
 * @type note
 * @default "return 0;"
 */
//=============================================================================

const UNH_CustomResource = {};
UNH_CustomResource.pluginName = 'UNH_CustomResource';
UNH_CustomResource.parameters = PluginManager.parameters(UNH_CustomResource.pluginName);

UNH_CustomResource.checkParams = function() {
  const params = this.parameters['CustGauge'];
  if (!params) return false;
  if (!Array.isArray(params)) return false;
  if (params.length <= 0) return false;
  return true;
};

if (UNH_CustomResource.checkParams()) {
  const unhResources = UNH_CustomResource.parameters['CustGauge'];

  for (const param of unhResources) {
    const unhParamName = param.key;
    const unhNewName = unhParamName.charAt(0).toUpperCase() + unhParamName.slice(1);
    Game_Battler.prototype['max' + unhNewName] = function() {
      try{
        const paramEval = Function('user', 'note', param.code);
        return Math.round(paramEval(this, param.name));
      } catch (e) {
        return 0;
      }
    };
    Game_Battler.prototype['get' + unhNewName] = function() {
      this['_' + param.key] = this['_' + param.key] || 0;
      return this['_' + param.key];
    };
    Game_Battler.prototype['set' + unhNewName] = function(value) {
      value = Math.max(resource, 0);
      value = Math.min(resource, this['m' + param.key]);
      this['_' + param.key] = value;
      this.refresh();
    };
    Game_Battler.prototype['gain' + unhNewName] = function(value) {
      let resource = this['get' + unhNewName]();
      this['set' + unhNewName](resource + value);
    };
    Object.defineProperty(Game_BattlerBase.prototype, param.key, {
      get: function() {
        return this['get' + unhNewName]();
      },
      configurable: true
    });
    Object.defineProperty(Game_BattlerBase.prototype, 'm' + param.key, {
      get: function() {
        return this['max' + unhNewName]();
      },
      configurable: true
    });
  }
  UNH_CustomResource.BattlerBase_refresh = Game_BattlerBase.prototype.refresh;
  Game_BattlerBase.prototype.refresh = function() {
    UNH_CustomResource.BattlerBase_refresh.call(this);
    for (const param of unhResources) {
      this[param.key] = this[param.key].clamp(0, this['m' + param.key]);
    }
  };
}
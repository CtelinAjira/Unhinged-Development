//=============================================================================
// Unhinged Development - Custom Skill Resources
// UNH_CustomResource.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [CustomResource]
 * @author Unhinged Developer
 * @base UNH_MiscFunc
 * @orderAfter UNH_MiscFunc
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
 * @param propName
 * @text Resource Internal Name
 * @desc The internal tracker for this resource
 * e.g. _ep
 * @type string
 *
 * @param maxName
 * @text Resource Max Name
 * @desc The name of this resource's maximum
 * e.g. mep
 * @type string
 *
 * @param maxFunc
 * @text Resource Max Function Name
 * @desc The function name for this resource's maximum
 * e.g. maxEp
 * @type string
 *
 * @param code
 * @text Code for Resource Cap
 * @desc The code for determining this resource's maximum
 * Variables: user, note
 * @type note
 * @default "return 0;"
 *
 * @param getName
 * @text Resource Getter Name
 * @desc The name of the getter for this resource
 * e.g. getEp
 * @type string
 *
 * @param setName
 * @text Resource Setter Name
 * @desc The name of the setter for this resource
 * e.g. setEp
 * @type string
 *
 * @param gainName
 * @text Resource Adder Name
 * @desc The name of this resource's adder function
 * e.g. gainEp
 * @type string
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
    Game_BattlerBase.prototype[String(param.maxFunc)] = function() {
      try{
        const paramEval = Function('user', 'note', String(param.code));
        return Math.round(paramEval(this, String(param.name)));
      } catch (e) {
        return 0;
      }
    };
    Game_BattlerBase.prototype[String(param.getName)] = function() {
      this[String(param.propName)] = this[String(param.propName)] || 0;
      return this[String(param.propName)];
    };
    Game_BattlerBase.prototype[String(param.setName)] = function(value) {
      value = Math.max(resource, 0);
      value = Math.min(resource, this[String(param.maxName)]);
      this[String(param.propName)] = value;
      this.refresh();
    };
    Game_BattlerBase.prototype[param.gainName] = function(value) {
      let resource = this[String(param.getName)]();
      this[String(param.setName)](resource + value);
    };
    Object.defineProperty(Game_BattlerBase.prototype, String(param.key), {
      get: function() {
        return this[String(param.getName)]();
      },
      configurable: true
    });
    Object.defineProperty(Game_BattlerBase.prototype, String(param.maxName), {
      get: function() {
        return this[String(param.maxFunc)]();
      },
      configurable: true
    });
  }
  UNH_CustomResource.BattlerBase_refresh = Game_BattlerBase.prototype.refresh;
  Game_BattlerBase.prototype.refresh = function() {
    UNH_CustomResource.BattlerBase_refresh.call(this);
    for (const param of unhResources) {
      this[String(param.propName)] = this[String(param.propName)].clamp(0, this[String(param.maxName)]);
    }
  };
}
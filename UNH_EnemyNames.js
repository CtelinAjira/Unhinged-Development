//=============================================================================
// Unhinged Development - Enemy Names
// UNH_EnemyNames.js
//=============================================================================

//=============================================================================
 /*:
 * @target MZ
 * @plugindesc [RPG Maker MZ] [Version 1.00] [Unhinged] [EnemyNames]
 * @author Unhinged Developer
 *
 * @help
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * <Nickname:X>
 * - Gives X as an alternate name for an enemy.
 *
 * ============================================================================
 * New Functions
 * ============================================================================
 *
 * enemy.nickname(name)
 * - The chosen nickname.  The enemy's regular name is the default value.
 *
 * ============================================================================
 * Note For Users
 * ============================================================================
 *
 * This plugin is largely useless without VisuStella MZ Battle Core.  Its main 
 * purpose is to give another name to call when adapting one of Yanfly's old 
 * Tips & Tricks.  Specifically Libra.
 *
 * If you wish to try that, here's a potential notetag setup for its skill.
 *
 * <JS Post-Apply>
 *   if (target.isEnemy()) {
 *    const id = target._enemyId;
 *    $gameSystem.registerDefeatedEnemy(id);
 *   }
 *   let text = '';
 *   if (target.isActor()) {
 *    text += target.name().trim();
 *    if (target.nickname().trim() !== '') {
 *     text += ' ' + target.nickname().trim();
 *    }
 *   } else {
 *    text += target.nickname().trim();
 *   }
 *   text += '\n';
 *   text += '\\px[200]\\c[4]HP:\\c[0]' + target.hp + '/' + target.mhp + '\\px[400]\\c[4]MP:\\c[0]' + target.mp + '/' + target.mmp + '\n';
 *   text += '\\px[100]\\c[4]STR:\\c[0]' + target.atk + '\\px[300]\\c[4]AGI:\\c[0]' + target.agi + '\\px[500]\\c[4]VIT:\\c[0]' + target.def + '\n';
 *   text += '\\px[100]\\c[4]PER:\\c[0]' + target.luk + '\\px[300]\\c[4]FOC:\\c[0]' + target.mat + '\\px[500]\\c[4]WIL:\\c[0]' + target.mdf;
 *   $gameMessage.add(text);
 *
 *   let weakness = '';
 *   let resist = '';
 *   let immune = '';
 *   let absorb = '';
 *   const elements = $dataSystem.elements;
 *   const eleLength = elements.length;
 *   for (let i = 0; i < eleLength; i++) {
 *    if (weakness !== '') weakness += ', ';
 *    if (resist !== '') resist += ', ';
 *    if (immune !== '') immune += ', ';
 *    if (absorb !== '') absorb += ', ';
 *    const name = elements[i];
 *    const rate = target.elementRate(i);
 *    if (rate > 1) {
 *     weakness += name;
 *    } else if (rate < 0) {
 *     absorb += name;
 *    } else if (rate === 0) {
 *     immune += name;
 *    } else if (rate < 1) {
 *     resist += name;
 *    }
 *   }
 *   if (weakness === '') weakness = 'None';
 *   if (resist === '') resist = 'None';
 *   if (immune === '') immune = 'None';
 *   if (absorb === '') absorb = 'None';
 *   weakness = '\\c[4]Weakness:\\c[0] ' + weakness + '\n';
 *   resist = '\\c[4]Resist:\\c[0] ' + resist + '\n';
 *   immune = '\\c[4]Immune:\\c[0] ' + immune + '\n';
 *   absorb = '\\c[4]Absorb:\\c[0] ' + absorb;
 *   text = weakness + resist + immune + absorb;
 *   $gameMessage.add(text);
 * </JS Post-Apply>
 */
//=============================================================================

const UNH_EnemyNames = {};
UNH_EnemyNames.pluginName = 'UNH_EnemyNames';

Game_Enemy.prototype.nickname = function() {
  if (!!this.enemy().meta) {
    if (!!this.enemy().meta.Nickname) {
      if (typeof this.enemy().meta.Nickname === 'string') {
        return this.enemy().meta.Nickname.trim();
      } else if (typeof this.enemy().meta.Nickname === 'number') {
        return this.enemy().meta.Nickname;
      }
    }
  }
  return this.originalName();
};
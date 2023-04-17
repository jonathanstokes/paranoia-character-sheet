import {getAttrsAsync, getSingleAttrAsync, setAttrsAsync} from "../util/Roll20Async.js";
import {
  getDefaultStatIdForSkillId, getLabelForSkillId,
  getLabelForStatId, SKILL_IDS,
  SkillId,
  STAT_IDS,
  StatId
} from "../constant/paranoia-constants.js";


export class SkillRoll {

  static init() {
    const instance = new SkillRoll();
    on('clicked:roll_skill', async eventInfo => instance.handleRollSkillAction(eventInfo));
    on('clicked:roll_stat_and_skill', async eventInfo =>
      instance
        .handleRollStatAndSkillAction(eventInfo)
        .catch(err => {
          console.error(`Error handling roll skill action for ${(eventInfo as any).htmlAttributes?.['data-skill']}:`, err);
        })
    );
    on('clicked:close_roll_skill', eventInfo => instance.handleCloseRollSkillMenu(eventInfo))
    instance.setDefaultSkillClasses();
  }

  handleCloseRollSkillMenu(eventInfo: EventInfo) {
    this.closeAllRollSkillMenus();
  }

  /** Called when a skill is clicked. Shows or hides the skill's menu of stats. */
  handleRollSkillAction(eventInfo: EventInfo) {
    const skillId = (eventInfo as any).htmlAttributes?.['data-skill'] as SkillId;
    if (skillId) {
      this.closeAllRollSkillMenus();
      const skillMenuEl = $20(`.sheet-skill-roll-menu[data-skill="${skillId}"]`);
      skillMenuEl.toggleClass('sheet-hidden');
      skillMenuEl.removeClass('sheet-loading');
    }
  }

  /** Called when one of the stats within a skill's menu is clicked, to roll with that stat+skill combination. */
  async handleRollStatAndSkillAction(eventInfo: EventInfo) {
    console.log("skill roll info", eventInfo);
    const skillId = (eventInfo as any).htmlAttributes?.['data-skill'] as SkillId;
    const statId = (eventInfo as any).htmlAttributes?.['data-stat'] as StatId;
    if (skillId && statId) {
      $20(`.sheet-skill-roll-menu[data-skill="${skillId}"]`).addClass('sheet-loading');

      const statLabel = getLabelForStatId(statId);
      const skillLabel = getLabelForSkillId(skillId);
      const {statModifier, skillModifier, actionModifier} = await this.getStatAndSkillModifier(statId, skillId);
      const node = statModifier + skillModifier + actionModifier;
      const negativeNode = node < 0;

      // 2d6>5 treats 5s and 6s as successes and counts successes.
      // 2d6>5f<4 treats 5s and 6s as successes, anything else as failures, and totals them as 1 and -1.
      const dieRoleSuffix = negativeNode ? 'cf<4cs>5>5f<4' : 'cf<0cs>5>5';
      const statRoll = `${statModifier}d6${dieRoleSuffix}`;
      const skillRoll = `${skillModifier}d6${dieRoleSuffix}`;
      const actionModifierRoll = actionModifier !== 0 ? `${actionModifier}d6${dieRoleSuffix}` : '';
      const computerDieRoll = `1d6${dieRoleSuffix}`;
      const unifiedNodeRoll = statModifier < 0 || skillModifier < 0 ? `${Math.abs(node)}d6${dieRoleSuffix}` : null;

      const rollTemplateString = [
        `&{template:skill}`,
        `{{stat_label=${statLabel}}}`,
        `{{stat_modifier=${statModifier < 0 ? statModifier : '+' + statModifier}}}`,
        `{{skill_label=${skillLabel}}}`,
        `{{skill_modifier=${skillModifier < 0 ? skillModifier : '+' + skillModifier}}}`,
        `{{raw_action_modifier=${actionModifier}}}`,
        `{{action_modifier=${actionModifier !== 0 ? (actionModifier < 0 ? actionModifier : '+ ' + actionModifier): ''}}}`,
        // We either roll the whole NODE together if we must, or as separate stat and skill pools if we can.
        `{{node_roll=[[${unifiedNodeRoll ? unifiedNodeRoll : statRoll + ' + ' + skillRoll + (actionModifier !== 0 ? ' + ' + actionModifierRoll : '')} + ${computerDieRoll}]]}}`,
        // We want to populate two computed fields that we don't need now, but we have to include something here so we
        // can populate them later.
        // computed::computer_die is a 1|0 value indicating whether the computer die showed up 'computer'.
        `{{computer_die=[[0d6${dieRoleSuffix}]]}}`,
        // computed::failure_count is 0 or a positive number of failures.
        `{{failure_count=[[0d6>5]]}}`,
        `{{no_success=[[0d6>5]]}}`,
      ].join(' ');

      const roll = await startRoll(rollTemplateString);
      console.log(`Attributes: ${JSON.stringify({
        [statId]: statModifier,
        [skillId]: skillModifier
      })}\n` + "template: " + rollTemplateString + "\nroll:", roll);
      const nodeRollResult = roll.results['node_roll'];
      const wasComputerRolled = nodeRollResult.dice[nodeRollResult.dice.length - 1] > 5 ? 1 : 0;
      const computedResults = {
        computer_die: wasComputerRolled,
        failure_count: nodeRollResult.result < 0 ? Math.abs(nodeRollResult.result) : 0,
        no_success: 'No'
      } as any;
      finishRoll(roll.rollId, computedResults);
      $20(`.sheet-skill-roll-menu[data-skill="${skillId}"]`).removeClass('sheet-loading');
      this.closeAllRollSkillMenus();
    }
  }

  protected async getStatAndSkillModifier(statId: StatId, skillId: SkillId): Promise<{ statModifier: number, skillModifier: number, actionModifier: number }> {
    const statAttributeName = `${statId}_stat`;
    const skillAttributeName = `${skillId}_skill`;
    const actionAttributeName = `${skillId}_skill_roll_modifier`;
    const values = await getAttrsAsync([statAttributeName, skillAttributeName, actionAttributeName]);
    const actionModifier = +values[actionAttributeName] || 0;
    if (actionModifier !== 0) {
      // Always consume the action modifier by setting it back to 0.
      await setAttrsAsync({[actionAttributeName]: 0});
    }
    return {
      statModifier: +values[statAttributeName] || 0,
      skillModifier: +values[skillAttributeName] || 0,
      actionModifier
    }
  }

  protected closeAllRollSkillMenus() {
    $20(`.sheet-skill-roll-menu`).addClass('sheet-hidden');
  }

  /**
   * Within the list of 4 stats that can be rolled with each skill, apply the `sheet-default-stat-for-skill` class to
   * the right one.  This is a one-time setup step that's easier to do in code than in the html template.
   */
  protected setDefaultSkillClasses() {
    for (const skillId of SKILL_IDS) {
      const defaultStatId = getDefaultStatIdForSkillId(skillId);
      $20(`.sheet-skill-roll-button[data-skill="${skillId}"][data-stat="${defaultStatId}"]`).addClass('sheet-default-stat-for-skill');
    }
  }
}

import {getAttrsAsync, getSingleAttrAsync} from "../util/Roll20Async.js";
import {
  getDefaultStatIdForSkillId, getLabelForSkillId,
  getLabelForStatId,
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
  }

  handleCloseRollSkillMenu(eventInfo: EventInfo) {
    $20(`.sheet-skill-roll-menu`).addClass('sheet-hidden');
  }

  /** Called when a skill is clicked. Shows or hides the skill's menu of stats. */
  handleRollSkillAction(eventInfo: EventInfo) {
    const skillId = (eventInfo as any).htmlAttributes?.['data-skill'] as SkillId;
    if (skillId) {
      $20(`.sheet-skill-roll-menu[data-skill="${skillId}"]`).toggleClass('sheet-hidden');
    }
  }

  /** Called when one of the stats within a skill's menu is clicked, to roll with that stat+skill combination. */
  async handleRollStatAndSkillAction(eventInfo: EventInfo) {
    console.log("skill roll info", eventInfo);
    const skillId = (eventInfo as any).htmlAttributes?.['data-skill'] as SkillId;
    const statId = (eventInfo as any).htmlAttributes?.['data-stat'] as StatId;
    if (skillId && statId) {
      const statLabel = getLabelForStatId(statId);
      const skillLabel = getLabelForSkillId(skillId);
      const {statModifier, skillModifier} = await this.getStatAndSkillModifiers(statId, skillId);
      const node = statModifier + skillModifier;

      // 2d6>5 treats 5s and 6s as successes and counts successes.
      // 2d6>5f<4 treats 5s and 6s as successes, anything else as failures, and totals them as 1 and -1.
      const dieRoleSuffix = node < 0 ? '>5f<4' : '>5';
      const statRoll = `${statModifier}d6${dieRoleSuffix}`;
      const skillRoll = `${skillModifier}d6${dieRoleSuffix}`;
      const computerDieRoll = `1d6${dieRoleSuffix}`;
      const unifiedNodeRoll = statModifier < 0 || skillModifier < 0 ? `${Math.abs(node)}d6${dieRoleSuffix}` : null;
      const rollTemplateString = [
        `&{template:skill}`,
        `{{stat_label=${statLabel}}}`,
        `{{skill_label=${skillLabel}}}`,
        // We either roll the whole NODE together if we must, or as separate stat and skill pools if we can.
        `{{node_roll=[[${unifiedNodeRoll ? unifiedNodeRoll : statRoll + ' + ' + skillRoll} + ${computerDieRoll}]]`,
        // We want to populate two computed fields that we don't need now, but we have to include something here so we
        // can populate them later.
        // computed::computer_die is a 1|0 value indicating whether the computer die showed up 'computer'.
        `{{computer_die=[[0d6${dieRoleSuffix}]]}}`,
        // computed::failure_count is 0 or a positive number of failures.
        `{{failure_count=[[0d6>5]]}}`
      ].join(' ');

      const roll = await startRoll(rollTemplateString);
      console.log("template: " + rollTemplateString + "\nroll:", roll);
      const nodeRollResult = roll.results['node_roll'];
      const wasComputerRolled = nodeRollResult.dice[nodeRollResult.dice.length - 1] > 5 ? 1 : 0;
      const computedResults = {
        computer_die: wasComputerRolled,
        failure_count: nodeRollResult.result < 0 ? Math.abs(nodeRollResult.result) : 0,
      };
      console.log("computed:", computedResults);
      finishRoll(roll.rollId, computedResults);

      // const getQueryForStatId = (statId: StatId) => ` {{stat_label=${getLabelForStatId(statId)}&#125;&#125; {node_roll=[[${getStatRoll(statId)} + ${skillRoll} + ${computerDieRoll}]]&#125; `;
      // let statQuery = `?{Stat to use with ${skillLabel}:|`;
      // if (defaultStatId !== StatId.VIOLENCE) {
      //   statQuery += `${getLabelForStatId(defaultStatId)} (default),${getQueryForStatId(defaultStatId)}|`;
      // }
      // const statOptions = STAT_IDS.map(statId => `${getLabelForStatId(statId)},${getQueryForStatId(statId)}`);
      // statQuery += statOptions.join('|');
      // statQuery += `}`;
      //
      // // Define {{Violence=[[1d6>5]]}} etc. for each stat roll.
      // const statRolls = STAT_IDS.map(statId => `{{${getLabelForStatId(statId)}=[[${getStatRoll(statId)}]]}}`).join(' ');
      // const nodeQuery = [
      //   // `{{node_roll=[[`,
      //   `${statQuery}`,
      //   // `]]}}`
      // ].join(' ');
      //
      // // 10d6>5f<4  Roll with -10
      // // 10d6>5     Roll with +10
      // const rollTemplateString = [
      //   `&{template:skill}`,
      //   `{{skill_label=${skillLabel}}}`,
      //   `${nodeQuery}`,
      //   // `${statRolls}`,
      //   // `{{stat_to_roll=${statQuery}}}`,
      //   // `{{skill_rolls=[[${Math.abs(skillModifier)}d6${dieRoleSuffix}]]}}`,
      //   `{{computer_die=[[0d6${dieRoleSuffix}]]}}`,
      //   // `{{stat_roll=[[0d6>5]]`,
      //   `{{failure_count=[[0d6>5]]}}`
      // ].join(' ');
      // console.log("rollTemplateString:", rollTemplateString);
      // const rollResults = await startRoll(rollTemplateString);
      // console.log("results:", rollResults);
      // const nodeRollResult = rollResults.results['node_roll'];
      // const wasComputerRolled = nodeRollResult.dice[nodeRollResult.dice.length - 1] > 5 ? 1 : 0;
      // const computedResults = {
      //   computer_die: wasComputerRolled,
      //   arbitrary: 'foo',
      //   failure_count: nodeRollResult.result < 0 ? Math.abs(nodeRollResult.result) : 0,
      // } as any;
      // console.log("computed results:", computedResults);
      // finishRoll(rollResults.rollId, computedResults);
    }
  }

  async getStatAndSkillModifiers(statId: StatId, skillId: SkillId): Promise<{statModifier: number, skillModifier: number}> {
    const statAttributeName = `${statId}_stat`;
    const skillAttributeName = `${skillId}_skill`;
    const values = await getAttrsAsync([statAttributeName, skillAttributeName]);
    return {
      statModifier: +values[statAttributeName],
      skillModifier: +values[skillAttributeName]
    }
  }
}

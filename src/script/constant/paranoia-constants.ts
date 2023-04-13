export enum StatId {
  VIOLENCE = 'violence',
  BRAINS = 'brains',
  CHUTZPAH = 'chutzpah',
  MECHANICS = 'mechanics'
}

export const STAT_IDS: StatId[] = [StatId.VIOLENCE, StatId.BRAINS, StatId.CHUTZPAH, StatId.MECHANICS];

export enum StatLabel {
  VIOLENCE = 'Violence',
  BRAINS = 'Brains',
  CHUTZPAH = 'Chutzpah',
  MECHANICS = 'Mechanics'
}

export const getLabelForStatId = (statId: StatId): StatLabel => {
  if (statId === StatId.VIOLENCE) return StatLabel.VIOLENCE;
  else if (statId === StatId.BRAINS) return StatLabel.BRAINS;
  else if (statId === StatId.CHUTZPAH) return StatLabel.CHUTZPAH;
  else if (statId === StatId.MECHANICS) return StatLabel.MECHANICS;
  else {
    throw new Error(`Unknown stat ID ${statId}.`);
  }
}

export const getLabelForSkillId = (skillId: SkillId): string => {
  // cheat, for now.
  return skillId.replace(/_/g, ' ').split(' ').map(word => `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`).join(' ');
}

export enum SkillId {
  ATHLETICS = 'athletics',
  GUNS = 'guns',
  MELEE = 'melee',
  THROW = 'throw',
  SCIENCE = 'science',
  PSYCHOLOGY = 'psychology',
  BUREAUCRACY = 'bureaucracy',
  ALPHA_COMPLEX = 'alpha_complex',
  BLUFF = 'bluff',
  CHARM = 'charm',
  INTIMIDATE = 'intimidate',
  STEALTH = 'stealth',
  OPERATE = 'operate',
  ENGINEER = 'engineer',
  PROGRAM = 'program',
  DEMOLITIONS = 'demolitions',
}

const SKILL_ID_BY_DEFAULT_STAT_ID: { [statId in StatId]: SkillId[] } = {
  [StatId.VIOLENCE]: [SkillId.ATHLETICS, SkillId.GUNS, SkillId.MELEE, SkillId.THROW],
  [StatId.BRAINS]: [SkillId.SCIENCE, SkillId.PSYCHOLOGY, SkillId.BUREAUCRACY, SkillId.ALPHA_COMPLEX],
  [StatId.CHUTZPAH]: [SkillId.BLUFF, SkillId.CHARM, SkillId.INTIMIDATE, SkillId.STEALTH],
  [StatId.MECHANICS]: [SkillId.OPERATE, SkillId.ENGINEER, SkillId.PROGRAM, SkillId.DEMOLITIONS]
};

export const SKILL_IDS = (Object.keys(SKILL_ID_BY_DEFAULT_STAT_ID) as StatId[]).reduce<SkillId[]>((skillIds, nextStatId) => [...skillIds, ...SKILL_ID_BY_DEFAULT_STAT_ID[nextStatId]], []);

export const getDefaultStatIdForSkillId = (skillId: SkillId): StatId => {
  for (const statId of Object.keys(SKILL_ID_BY_DEFAULT_STAT_ID) as StatId[]) {
    for (const nextSkillId of SKILL_ID_BY_DEFAULT_STAT_ID[statId]) {
      if (skillId === nextSkillId) return statId;
    }
  }
  throw new Error(`No default stat ID found for Skill ID '${skillId}'.`);
}

import {ClearanceField} from "./field/ClearanceField.js";
import {TreasonStarsField} from "./field/TreasonStarsField.js";
import {MoxieField} from "./field/MoxieField.js";
import {workerScope} from "./util/util.js";
import {WoundsField} from "./field/WoundsField.js";
import {CharacterName} from "./other/CharacterName.js";
import {ModifierNumberField} from "./field/ModifierNumberField.js";
import {SkillRoll} from "./roll/SkillRoll.js";


on('sheet:opened', () => {
  console.log("Paranoia character sheet initializing.");
  ClearanceField.init();
  TreasonStarsField.init();
  ModifierNumberField.init();
  MoxieField.init();
  WoundsField.init();
  CharacterName.init();
  SkillRoll.init();
  console.log("Paranoia character sheet initialized.");
});

console.log("Paranoia character sheet installed.", workerScope);

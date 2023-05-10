import {ClearanceField} from "./field/ClearanceField.js";
import {TreasonStarsField} from "./field/TreasonStarsField.js";
import {MoxieField} from "./field/MoxieField.js";
import {workerScope} from "./util/util.js";
import {WoundsField} from "./field/WoundsField.js";
import {CharacterName} from "./other/CharacterName.js";
import {ModifierNumberField} from "./field/ModifierNumberField.js";
import {SkillRoll} from "./roll/SkillRoll.js";

let characterSheetsInitialized = false;

on('sheet:opened', (eventInfo) => {
  const firstOpened = !characterSheetsInitialized;
  console.log("Paranoia character sheet initializing.", {firstOpened});
  ClearanceField.init(firstOpened);
  TreasonStarsField.init(firstOpened);
  ModifierNumberField.init(firstOpened);
  MoxieField.init(firstOpened);
  WoundsField.init(firstOpened);
  CharacterName.init(firstOpened);
  SkillRoll.init(firstOpened);
  characterSheetsInitialized = true;
  console.log("Paranoia character sheet initialized.");
});

console.log("Paranoia character sheet installed.", workerScope);

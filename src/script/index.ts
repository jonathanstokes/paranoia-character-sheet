import {ClearanceField} from "./field/ClearanceField.js";
import {TreasonStarsField} from "./field/TreasonStarsField.js";
import {MoxieField} from "./field/MoxieField.js";
import {workerScope} from "./util/util.js";
import {WoundsField} from "./field/WoundsField.js";


on('sheet:opened', () => {
  console.log("Paranoia character sheet initializing.");
  ClearanceField.init();
  TreasonStarsField.init();
  MoxieField.init();
  WoundsField.init();
  console.log("Paranoia character sheet initialized.");
});

console.log("Paranoia character sheet installed.", workerScope);

import {getAttrsAsync, setAttrsAsync} from "../util/Roll20Async.js";
import {Clearance} from "../constant/paranoia-constants.js";
import {first} from "lodash";


export class CharacterName {

  static init(firstOpened: boolean) {
    if (firstOpened) {
      on('change:name change:clearance change:sector change:clone_count', async () => {
        const {
          name,
          character_name,
          clearance,
          sector,
          clone_count
        } = await getAttrsAsync(['name', 'character_name', 'clearance', 'sector', 'clone_count']);
        const clearanceSuffix = clearance === Clearance.INFRARED ? '' : `-${clearance.substring(0, 1).toUpperCase()}`;
        const newCharacterName = `${name}${clearanceSuffix}-${sector.toUpperCase()}-${clone_count}`;
        if (newCharacterName !== character_name) {
          console.log(`Changing character_name to: ${newCharacterName}`);
          await setAttrsAsync({character_name: newCharacterName});
        }
      });
    }
  }
}

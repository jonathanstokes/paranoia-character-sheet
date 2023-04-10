import {getAttrsAsync, setAttrsAsync} from "../util/Roll20Async.js";


export class CharacterName {

  static init() {
    on('change:name change:clearance change:sector change:clone_count', async () => {
      const { name, clearance, sector, clone_count } = await getAttrsAsync(['name', 'clearance', 'sector', 'clone_count']);
      const clearanceSuffix = clearance === 'infrared' ? '' : `-${clearance.substring(0, 1).toUpperCase()}`;
      await setAttrsAsync({character_name: `${name}${clearanceSuffix}-${sector.toUpperCase()}-${clone_count}`});
    });
  }
}

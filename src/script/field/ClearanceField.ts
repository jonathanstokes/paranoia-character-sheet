import {stripAttr} from "../util/util.js";

export class ClearanceField {

  static init(firstOpen: boolean) {
    // When 'clearance' changes, also change 'clearance_letter' to match
    on(`change:clearance`, () => {
      getAttrs(['clearance'], (values) => {
        const clearanceWord = values['clearance'];
        const clearanceLetter = clearanceWord.substring(0, 1).toUpperCase();

        setAttrs({
          [`clearance_letter`]: clearanceLetter
        });
      });
    });

    // When 'clearance' changes, swap in the right CSS class to change the field's color
    $20('select[name="attr_clearance"]').on('change', event => {
      const attribute = stripAttr(event.htmlAttributes.name);
      getAttrs([attribute], values => {
        const clearanceWord = values[attribute];
        const cssClasses = (event.htmlAttributes.class || '').split(' ');
        // Remove any previous class (with this prefix) and add the new one.
        const colorPrefix = 'sheet-background-color-';
        const clearanceSelectEl = $20('select[name="attr_clearance"]');
        for (const cssClass of cssClasses) {
          if (cssClass.indexOf(colorPrefix) === 0) {
            clearanceSelectEl.removeClass(cssClass);
          }
        }
        clearanceSelectEl.addClass(`${colorPrefix}${clearanceWord.toLowerCase()}`);
      });
    });
  }
}

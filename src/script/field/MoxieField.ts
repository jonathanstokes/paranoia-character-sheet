import {CheckboxSeriesField} from "./CheckboxSeriesField.js";

export class MoxieField extends CheckboxSeriesField<number> {

  static init(firstOpen: boolean) {
    CheckboxSeriesField.init(firstOpen, new MoxieField());
  }

  protected constructor() {
    super(
      'moxie_points',
      '.sheet-moxie-circles-container .sheet-field-moxie-circle',
      [
        {name: 'moxie_circle_1', selector: '.sheet-moxie-circles-container .sheet-field-moxie-circle[name="moxie_circle_1"]'},
        {name: 'moxie_circle_2', selector: '.sheet-moxie-circles-container .sheet-field-moxie-circle[name="moxie_circle_2"]'},
        {name: 'moxie_circle_3', selector: '.sheet-moxie-circles-container .sheet-field-moxie-circle[name="moxie_circle_3"]'},
        {name: 'moxie_circle_4', selector: '.sheet-moxie-circles-container .sheet-field-moxie-circle[name="moxie_circle_4"]'},
        {name: 'moxie_circle_5', selector: '.sheet-moxie-circles-container .sheet-field-moxie-circle[name="moxie_circle_5"]'},
        {name: 'moxie_circle_6', selector: '.sheet-moxie-circles-container .sheet-field-moxie-circle[name="moxie_circle_6"]'},
        {name: 'moxie_circle_7', selector: '.sheet-moxie-circles-container .sheet-field-moxie-circle[name="moxie_circle_7"]'},
        {name: 'moxie_circle_8', selector: '.sheet-moxie-circles-container .sheet-field-moxie-circle[name="moxie_circle_8"]'},
      ],
      'right-to-left'
    );
  }

  protected getValueForControl(controlName: string): number {
    return controlName ? +controlName.substring(controlName.lastIndexOf('_') + 1) - 1 : 8;
  }

  protected getControlNameForValue(value: number | string): string | null {
    const numericValue = +value;
    return numericValue >= 0 && numericValue < 8 ? `moxie_circle_${numericValue + 1}` : null;
  }


}

import {CheckboxSeriesField} from "./CheckboxSeriesField.js";

export class TreasonStarsField extends CheckboxSeriesField<number> {

  static init(firstOpen: boolean) {
    CheckboxSeriesField.init(firstOpen, new TreasonStarsField());
  }

  protected constructor() {
    super(
      'treason_stars',
      'button.sheet-field-treason-star',
      [
        {name: 'treason_star_1', selector: '.sheet-field-treason-star[name="treason_star_1"]'},
        {name: 'treason_star_2', selector: '.sheet-field-treason-star[name="treason_star_2"]'},
        {name: 'treason_star_3', selector: '.sheet-field-treason-star[name="treason_star_3"]'},
        {name: 'treason_star_4', selector: '.sheet-field-treason-star[name="treason_star_4"]'},
        {name: 'treason_star_5', selector: '.sheet-field-treason-star[name="treason_star_5"]'},
      ]);
  }

  protected getValueForControl(controlName: string): number {
    return controlName ? +controlName.substring(controlName.lastIndexOf('_') + 1) : 0;
  }

  protected getControlNameForValue(value: number | string): string | null {
    return +value > 0 ? `treason_star_${value}` : null;
  }
}

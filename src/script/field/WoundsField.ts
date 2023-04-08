import {CheckboxSeriesField} from "./CheckboxSeriesField.js";

export class WoundsField extends CheckboxSeriesField<string> {

  static init() {
    CheckboxSeriesField.init(new WoundsField());
  }

  protected constructor() {
    super(
      'wound_level',
      '.sheet-field-container-wounds .sheet-field-container-wound .sheet-field-wound-box',
      [
        {
          name: 'wound_box_hurt',
          selector: '.sheet-field-container-wounds .sheet-field-container-wound .sheet-field-wound-box[name="wound_box_hurt"]'
        },
        {
          name: 'wound_box_injured',
          selector: '.sheet-field-container-wounds .sheet-field-container-wound .sheet-field-wound-box[name="wound_box_injured"]'
        },
        {
          name: 'wound_box_maimed',
          selector: '.sheet-field-container-wounds .sheet-field-container-wound .sheet-field-wound-box[name="wound_box_maimed"]'
        },
        {
          name: 'wound_box_dead',
          selector: '.sheet-field-container-wounds .sheet-field-container-wound .sheet-field-wound-box[name="wound_box_dead"]'
        },
      ],
    );
  }

  protected getValueForControl(controlName: string): string {
    return controlName ? controlName.substring(controlName.lastIndexOf('_') + 1) : 'none';
  }

  protected getControlNameForValue(value: string): string | null {
    return !!value && value !== 'none' ? `wound_box_${value}` : null;
  }


}

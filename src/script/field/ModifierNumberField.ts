import {getSingleAttrAsync, setAttrsAsync} from "../util/Roll20Async.js";

export class ModifierNumberField {

  static init(firstOpen: boolean) {
    new ModifierNumberField('athletics_skill');
    new ModifierNumberField('guns_skill');
    new ModifierNumberField('melee_skill');
    new ModifierNumberField('throw_skill');
    new ModifierNumberField('science_skill');
    new ModifierNumberField('psychology_skill');
    new ModifierNumberField('bureaucracy_skill');
    new ModifierNumberField('alpha_complex_skill');
    new ModifierNumberField('bluff_skill');
    new ModifierNumberField('charm_skill');
    new ModifierNumberField('intimidate_skill');
    new ModifierNumberField('stealth_skill');
    new ModifierNumberField('operate_skill');
    new ModifierNumberField('engineer_skill');
    new ModifierNumberField('program_skill');
    new ModifierNumberField('demolitions_skill');
  }

  protected readonly fieldName: string;

  protected readonly containerSelector: string;
  protected readonly displayFieldSelector: string;
  protected readonly inputFieldSelector: string;

  constructor(fieldName: string) {
    this.fieldName = fieldName;
    this.containerSelector = `.sheet-field-modifier-number-container[name="${this.fieldName}_container"]`;
    this.displayFieldSelector = `.sheet-field-modifier-number-container .sheet-field-modifier-number-display[name="attr_${this.fieldName}_display"]`;
    this.inputFieldSelector = `.sheet-field-modifier-number-container .sheet-field-modifier-number-display[name="attr_${this.fieldName}"]`;
    this.initialize().catch(err => console.error(`Could not initialize modifier number field ${this.fieldName}:`, err));
  }

  private async initialize() {
    this.installListeners();
    await this.updateDisplayValue(+(await getSingleAttrAsync(this.fieldName)));
  }

  private installListeners() {
    on(`change:${this.fieldName}`, eventInfo =>
      this.onAttributeChange(eventInfo)
        .catch(err => console.error(`ModifierNumberField.onAttributeChange() for ${this.fieldName}:`, err))
    );
    $20(this.displayFieldSelector).on('click', event =>
      this.onDisplayFieldClick(event)
    );
    $20(this.inputFieldSelector).on('change', event =>
      this.onInputFieldChange(event)
    );
  }

  protected async onAttributeChange(eventInfo: EventInfo) {
    await this.updateDisplayValue(+eventInfo.newValue);
    this.setEditing(false);
  }

  protected onDisplayFieldClick(event: JQueryProxyEvent) {
    this.setEditing(true);
  }

  protected onInputFieldChange(event: JQueryProxyEvent) {
  }

  protected setEditing(editing: boolean) {
    const containerEl = $20(this.containerSelector);
    if (editing) containerEl.addClass('editing');
    else containerEl.removeClass('editing');
  }

  protected async updateDisplayValue(newValue: number) {
    const prefix = newValue > 0 ? '+' : '';
    const displayText = newValue === 0 ? '' : `${prefix}${newValue}`;
    await setAttrsAsync({[`${this.fieldName}_display`]: displayText});
  }
}

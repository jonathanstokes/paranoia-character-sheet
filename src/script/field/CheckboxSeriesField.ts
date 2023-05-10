import {getSingleAttrAsync, setAttrsAsync} from "../util/Roll20Async.js";

export interface CheckboxSeriesControlMetadata {
  name: string;
  selector: string;
}

export type SeriesDirection = 'left-to-right' | 'right-to-left';

/**
 * An abstract parent class for a list of buttons with checkbox or radio button behavior, except that checking one
 * implies checking others to the left (or optionally right).
 */
export abstract class CheckboxSeriesField<V extends string | number> {

  protected static init(firstOpen: boolean, instance: CheckboxSeriesField<string | number>) {
    $20(instance.allControlsSelector).on('click', (e) =>
      instance
        .handleClick(e)
        .catch(err => console.error(`${instance.constructor.name} error handling click for attribute ${instance.attributeName}:`, err))
    );
    $20(instance.allControlsSelector).on('mouseenter', (e) => instance.handleMouseEnter(e));
    $20(instance.allControlsSelector).on('mouseleave', (e) => instance.handleMouseLeave(e));
    if (firstOpen) {
      on(`change:${instance.attributeName}`, (e) =>
        instance.handleAttributeChange(e)
          .catch(err => console.error(`${instance.constructor.name} error handling change for attribute ${instance.attributeName}:`, err))
      );
      on(`change:${instance.attributeName}_max`, (e) =>
        instance.handleAttributeMaxChange()
          .catch(err => console.error(`${instance.constructor.name} error handling change for attribute max ${instance.attributeName}_max:`, err))
      );
    }
    console.log(`${instance.constructor?.name}.init()`, {firstOpen});
  }

  protected readonly allControlsSelector: string;

  protected readonly controlProfiles: CheckboxSeriesControlMetadata[];

  protected readonly attributeName: string;

  protected readonly direction: SeriesDirection;

  /** The name attribute of the main control that's selected (the one that was clicked on). */
  protected displayedSelectionControlName: string | null = null;

  /**
   * Creates a checkbox series.
   * @param attributeName the name of the (usually numeric) attribute that gets set by this field.
   * @param allControlsSelector a JQuery selector that will match all controls in this field.
   * @param controlProfiles metadata on each of the individual buttons in the series.
   * @param direction whether the series goes 'left-to-right', meaning a click on a button _implies_ it and all the
   *                  others to its left should be selected, or 'right-to-left', meaning a click on a button _implies_
   *                  it and all the others to its right should be selected.
   */
  protected constructor(attributeName: string, allControlsSelector: string, controlProfiles: CheckboxSeriesControlMetadata[], direction: SeriesDirection = 'left-to-right') {
    this.attributeName = attributeName;
    this.allControlsSelector = allControlsSelector;
    this.controlProfiles = controlProfiles;
    this.direction = direction;
    this.initializeValue().catch(err => console.error(`Error initializing value for ${this.constructor.name} ${this.attributeName}:`, err));
  }

  async getAttributeMaxValue(): Promise<string> {
    return getSingleAttrAsync(`${this.attributeName}_max`);
  }

  async getAttributeValue(): Promise<string> {
    return getSingleAttrAsync(this.attributeName);
  }

  async setAttributeValue(newValue: string, silent?: boolean): Promise<void> {
    if (newValue !== await this.getAttributeValue()) {
      console.log(`setting ${this.attributeName} to ${newValue}${silent ? '(silently).' : '.'}`);
      await setAttrsAsync({[this.attributeName]: newValue}, silent ? {silent: true} : undefined);
    } else {
      console.log(`${this.attributeName} already set to ${newValue}.`, silent);
    }
  }

  /**
   * Makes the given control no longer checked, and marks the control to its left (for left-to-right fields) instead.
   * If this is the last available control, then no control will be selected.
   */
  protected async deselectControlSelection(controlName: string) {
    const nextControl = this.getPreviousControlName(controlName);
    if (nextControl) {
      await this.setControlSelection(nextControl);
    } else {
      // Clear all selections
      await this.setControlSelection(null);
    }
  }

  protected abstract getControlNameForValue(value: V | string): string | null;

  /**
   * Returns the control that comes before this one in sequence, or `null` if this is the first control in the sequence
   * and therefore has no previous control.
   * For right-to-left fields, the right-most control is the first in the sequence.
   */
  protected getPreviousControlName(controlName: string): string | null {
    const orderedProfiles = this.direction === 'right-to-left' ? [...this.controlProfiles].reverse() : this.controlProfiles;
    let previousControlName: string | null = null;
    for (const {name} of orderedProfiles) {
      if (controlName === name) {
        return previousControlName;
      }
      previousControlName = name;
    }
    return null;
  }

  protected abstract getValueForControl(controlName: string | null): V;

  /**
   * Called when the attribute that this field edits has been modified, possibly by external forces, or possibly by
   * this field itself.
   */
  protected async handleAttributeChange(e: EventInfo) {
    const updatedStringValue = await this.getAttributeValue();
    const displayedValue = this.getValueForControl(this.displayedSelectionControlName);
    if (updatedStringValue != displayedValue) {
      await this.setControlSelection(this.getControlNameForValue(updatedStringValue), true)
    }
  }

  protected async handleAttributeMaxChange() {
    const updatedStringValue = await this.getAttributeMaxValue();
    const maxControlName = this.getControlNameForValue(updatedStringValue);
    this.setClassesForMaxValue(maxControlName);
  }

  protected async handleClick(e: JQueryProxyEvent) {
    await this.handleControlClick(e.htmlAttributes.name);
  }

  protected handleMouseEnter(e: JQueryProxyEvent) {
    this.handleControlHover(e.htmlAttributes.name);
  }

  protected handleMouseLeave(e: JQueryProxyEvent) {
    this.removeClassFromAll('hovered');
  }

  protected async handleControlClick(clickedControlName: string) {
    if (this.isMainSelection(clickedControlName)) {
      await this.deselectControlSelection(clickedControlName);
    } else {
      await this.setControlSelection(clickedControlName);
    }
    await this.removeClassFromAll('hovered');
  }

  protected handleControlHover(clickedControlName: string) {
    this.setClassForControlAndImpliedControls('hovered', clickedControlName);
  }

  /** Called **from the constructor** of this parent class to initialize the value. */
  protected async initializeValue() {
    const stringValue = await getSingleAttrAsync(this.attributeName);
    console.log("initial value for " + this.attributeName + ": ", stringValue);
    await this.setControlSelection(this.getControlNameForValue(stringValue), true);
    await this.handleAttributeMaxChange();
  }

  protected isMainSelection(controlName: string): boolean {
    return controlName === this.displayedSelectionControlName;
  }

  protected removeClassFromAll(className: string) {
    this.controlProfiles.forEach(profile => $20(profile.selector).removeClass(className));
  }

  protected setClassForControlAndImpliedControls(className: string, clickedControlName: string | null) {
    if (clickedControlName) {
      let adding = this.direction === 'left-to-right';
      for (const profile of this.controlProfiles) {
        if (this.direction === 'right-to-left' && profile.name === clickedControlName) {
          adding = true;
        }
        const el = $20(profile.selector);
        // console.log(`for ${profile.name}: adding=${adding}`);
        if (adding) {
          el.addClass(className);
        } else {
          el.removeClass(className);
        }
        if (this.direction === 'left-to-right' && profile.name === clickedControlName) {
          adding = false;
        }
      }
    } else {
      this.removeClassFromAll(className);
    }
  }

  protected setClassesForMaxValue(maxControlName: string | null) {
    let hiding = false;
    for (const profile of this.controlProfiles) {
      const el = $20(profile.selector);
      if (profile.name === maxControlName) hiding = true;
      hiding ? el.addClass('hidden') : el.removeClass('hidden');
    }
  }

  /**
   * Sets the state of this field and, if needed, the backing attribute, to match the given control name (as if that
   * control were clicked).
   */
  protected async setControlSelection(clickedControlName: string | null, silent?: boolean) {
    this.setClassForControlAndImpliedControls('checked', clickedControlName);
    await this.setAttributeValue(`${this.getValueForControl(clickedControlName)}`, silent);
    this.displayedSelectionControlName = clickedControlName;
  }
}

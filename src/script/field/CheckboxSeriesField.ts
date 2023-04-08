import {getAttrsAsync, getSingleAttrAsync, setAttrsAsync} from "../util/Roll20Async.js";

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

  protected static init(instance: CheckboxSeriesField<string | number>) {
    $20(instance.allControlsSelector).on('click', (e) =>
      instance
        .handleClick(e)
        .catch(err => console.error(`${instance.constructor.name} error handling click for attribute ${instance.attributeName}:`, err))
    );
    $20(instance.allControlsSelector).on('mouseenter', (e) => instance.handleMouseEnter(e));
    $20(instance.allControlsSelector).on('mouseleave', (e) => instance.handleMouseLeave(e));
    on(`change:${instance.attributeName}`, (e) =>
      instance.handleAttributeChange(e)
        .catch(err => console.error(`${instance.constructor.name} error handling change for attribute ${instance.attributeName}:`, err))
    );
    console.log(`${instance.constructor?.name}.init()`);
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

  async getAttributeValue(): Promise<string> {
    return getSingleAttrAsync(this.attributeName);
  }

  async setAttributeValue(newValue: string, silent?: boolean): Promise<void> {
    if (newValue !== await this.getAttributeValue()) {
      console.log(`setting ${this.attributeName} to ${newValue}${silent ? '(silently).' : '.'}`);
      await setAttrsAsync({[this.attributeName]: newValue}, silent ? {silent: true} : undefined);
    } else {
      console.log(`${this.attributeName} already set to ${newValue}.`);
    }
  }

  protected abstract getValueForControl(controlName: string | null): V;

  protected abstract getControlNameForValue(value: V | string): string | null;

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
    await this.setControlSelection(clickedControlName).catch(err => console.error(`Error handling click on control ${clickedControlName}:`, err));
    await this.removeClassFromAll('hovered');
  }

  protected handleControlHover(clickedControlName: string) {
    this.setClassToControlAndImplied('hovered', clickedControlName);
  }

  /** Called **from the constructor** of this parent class to initialize the value. */
  protected async initializeValue() {
    const stringValue = await getSingleAttrAsync(this.attributeName);
    console.log("initial value for " + this.attributeName + ": ", stringValue);
    await this.setControlSelection(this.getControlNameForValue(stringValue), true);
  }

  protected removeClassFromAll(className: string) {
    this.controlProfiles.forEach(profile => $20(profile.selector).removeClass(className));
  }

  protected setClassToControlAndImplied(className: string, clickedControlName: string | null) {
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
  }

  /**
   * Sets the state of this field and, if needed, the backing attribute, to match the given control name (as if that
   * control were clicked).
   */
  protected async setControlSelection(clickedControlName: string | null, silent?: boolean) {
    this.setClassToControlAndImplied('checked', clickedControlName);
    await this.setAttributeValue(`${this.getValueForControl(clickedControlName)}`, silent);
    this.displayedSelectionControlName = clickedControlName;
  }
}

export {};

declare global {
  interface BaseEvent {
    /**
     * This will include all html attributes of the element that triggered the event, as well as the name of the tag
     * itself
     */
    htmlAttributes: {
      name: string;
      class: string;
      id: string;
      tagName: string;
      /** Attributes such as `data-tab`. */
      [dataAttribute: `type DataAttribute = data-${string}`]: string; // this is almost cool, but doesn't work.
    };
  }

  /** At least "action" events will include the `htmlAttributes` of the button that triggered the action. */
  interface EventInfo extends Partial<BaseEvent> {
    /**
     * The original attribute that triggered the event. It is the full name (including `RowID` if in a repeating section)
     * of the attribute that originally triggered this event.
     *
     * Note: The entire string will have been translated into lowercase and thus might not be suitable for being fed
     * directly into `getAttrs()`.
     */
    sourceAttribute: string;

    /**
     * The agent that triggered the event, either player or sheetworker
     */
    sourceType: 'player' | 'sheetworker';

    /**
     * 	The original value of the attribute in an `on:change` event, before the attribute was changed.
     */
    previousValue: string;
    /**
     * The value to which the attribute in an `on:change` event has changed.
     */
    newValue: string;
    /**
     * An object containing the values of all the attributes removed in a remove:repeating_groupname event.
     */
    removedInfo: any;
    /**
     * When changing a value it is equal to the sourceAttribute, being the full name (including RowID if in a repeating
     * section)
     *
     * When removing a repeating row it contains the bound trigger name for the repeating section, including the remove
     * keyword, i.e. remove:repeating_section
     */
    triggerName: string;
  }

  /**
   * We’re currently supporting the following events: change, click, hover, mouseenter, mouseleave. We may be able to
   * expand this list in the future.
   * @see https://wiki.roll20.net/JQuery
   */
  type JQueryProxyEventName = 'change' | 'click' | 'hover' | 'mouseenter' | 'mouseleave';

  interface JQueryProxyEvent extends BaseEvent {
    /** Whether alt, shift or ctrl keys were down when the event was triggered */
    altKey: boolean;
    /** Whether alt, shift or ctrl keys were down when the event was triggered */
    shiftKey: boolean;
    /** Whether alt, shift or ctrl keys were down when the event was triggered */
    ctrlKey: boolean;
    /** Page coordinates of the triggering event */
    pageX: number;
    /** Page coordinates of the triggering event */
    pageY: number;
  }

  interface JQueryProxy {
    /** Adds the specified <class> to the element, unless the class is already present on the element. */
    addClass(className: string);
    on(eventName: JQueryProxyEventName, callbackFn: (event: JQueryProxyEvent) => void);

    /**
     * Removes the specified <class> from the element; does nothing if the given element does not already have this
     * class.
     */
    removeClass(className: string);

    /**
     * Adds the specified <class> to the element if the element does not already have the given class, removes the class
     * if it is already present on the given element.
     */
    toggleClass(className: string);

  }

  type ValuesResult = {[attributeName: string]: string};
  type ValuesCallback = (values: ValuesResult) => void;

  function on(eventName: string, callbackFn: (eventInfo: EventInfo) => void | Promise<void>);

  function getAttrs(attributeNames: string[], callbackFn: ValuesCallback);
  function setAttrs(attributeMap: {[attributeName: string]: string | number}, options?: { silent: boolean }, callbackFn?: ValuesCallback);

  function $20(selector: string): JQueryProxy;

  function getActiveCharacterId(): string | null;

  function getSectionIDs(section_name: string,callbackFn: (idArray: string[]) => void);

  let self;

  interface RollResult {
    /** The result of the roll, as calculated by the roll server, e.g. 48. */
    result: number;
    /** An ordered array of the results of all dice in this roll, e.g. [9,9,20,4,4,1]. */
    dice: number[];
    /** The original expression for this roll, e.g. ‘'4d20+2d4'’. */
    expression: string;
    /** A breakdown of each “sub-roll” (each part of an expression is rolled separately). */
    rolls: {
      /** The ‘4’ in ‘4d20’ */
      dice: number;
      /** The ‘20’ in ‘4d20’ */
      sides: number;
      /** Array of the results of each die, e.g. [9,9,20,4]. */
      results: number;
    }[];
  }

  interface RollsResult {
    rollId: string;
    results: {
      [rollName: string]: RollResult
    }
  }

  function startRoll(rollTemplateString: string, callbackFn?: (info: RollsResult) => void): Promise<RollsResult>;

  function finishRoll(rollId: string, computedResults?: {[rollName: string]: number});
}


interface ControlMetadata {
  name: string;
  selector: string;
}

export class TreasonStarsField {

  protected controlProfiles: ControlMetadata[] = [
    { name: 'attr_treason_star_1', selector: '.sheet-field-treason-star[name="attr_treason_star_1"]' },
    { name: 'attr_treason_star_2', selector: '.sheet-field-treason-star[name="attr_treason_star_2"]' },
    { name: 'attr_treason_star_3', selector: '.sheet-field-treason-star[name="attr_treason_star_3"]' },
    { name: 'attr_treason_star_4', selector: '.sheet-field-treason-star[name="attr_treason_star_4"]' },
    { name: 'attr_treason_star_5', selector: '.sheet-field-treason-star[name="attr_treason_star_5"]' },
  ];

  static init() {
    const instance = new TreasonStarsField();
    $20('button.sheet-field-treason-star').on('click', (e) => instance.handleClick(e));
    $20('button.sheet-field-treason-star').on('hover', (e) => instance.handleHover(e));
    console.log("TreasonStarsField.init()");
  }

  protected constructor() {
  }

  protected handleClick(e: JQueryProxyEvent) {
    console.log('click', e);
  }

  protected handleHover(e: JQueryProxyEvent) {
    this.handleControlHover(e.htmlAttributes.name);
  }

  protected handleControlClick(clickedControlName: string) {
  }

  protected handleControlHover(clickedControlName: string) {
    let adding = true;
    for (const profile of this.controlProfiles) {
      if (adding) {
        $20(profile.selector).addClass('hovered');
      } else {
        $20(profile.selector).removeClass('hovered');
      }
      if (profile.name === clickedControlName) {
        adding = false;
      }
    }
  }
}

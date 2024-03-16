import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";

export default class EventsEventRowComponent extends Component {
  @service modal;

  tagName = "tr";
  classNameBindings = [":events-event-row", "showSelect", "selected"];
  selected = false;

  @action
  toggleWhenShowSelect() {
    if (!this.showSelect) {
      this.set("selected", false);
    }
  }

  @action
  toggleWhenSelectAll() {
    this.set("selected", this.selectAll);
  }

  @action
  click() {
    if (this.showSelect) {
      this.selectEvent();
    }
  }

  @action
  selectEvent() {
    this.toggleProperty("selected");
    this.modifySelection([this.event], this.selected);
  }

  @action
  showModal() {
    this.modal.show(MyModal, {
      model: { event: this.event, modifySelection: this.modifySelection },
    });
  }
}

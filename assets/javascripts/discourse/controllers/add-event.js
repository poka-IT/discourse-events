import Component from "@ember/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import I18n from "I18n";
import { showModal } from "discourse/lib/show-modal";

export default class AddEventComponent extends Component {
  @tracked title = "add_event.modal_title";
  @tracked bufferedEvent = null;
  @tracked valid = false;
  @tracked flash = null;
  @tracked flashType = null;

  @action
  clear(event) {
    event?.preventDefault();
    this.bufferedEvent = null;
  }

  @action
  saveEvent() {
    if (this.valid) {
      this.args.update(this.bufferedEvent);
      this.args.closeModal();
    } else {
      this.flash = I18n.t("add_event.error");
      this.flashType = "error";
    }
  }

  @action
  updateEvent(event, valid) {
    this.bufferedEvent = event;
    this.valid = valid;
  }

  @action
  myCloseModalWrapper() {
    this.args.closeModal();
  }

  @action
  openModal() {
    showModal("addEvent");
  }
}
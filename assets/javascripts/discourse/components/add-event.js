import I18n from "I18n";
import { action } from "@ember/object";
import Component from "@ember/component";
import { inject as service } from "@ember/service";

export default Component.extend({
  modal: service(),

  title: "add_event.modal_title",

  @action
  clear(event) {
    event?.preventDefault();
    this.set("bufferedEvent", null);
  },

  @action
  saveEvent() {
    if (this.valid) {
      this.model.update(this.bufferedEvent);
      this.modal.close();
    } else {
      this.flashMessages.add({
        message: I18n.t("add_event.error"),
        type: "error",
      });
    }
  },

  // @action
  // closeModal() {
  //   console.log('AddEvent component closeModal triggered');
  //   this.modal.close();
  // },

  @action
  updateEvent(event, valid) {
    this.setProperties({
      bufferedEvent: event,
      valid,
    });
  },
});
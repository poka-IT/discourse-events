import I18n from "I18n";
import { action } from "@ember/object";
import Component from "@ember/component";
import { inject as service } from "@ember/service";

export default Component.extend({
  modal: service(),

  title: "add_event.modal_title",

  init() {
    this._super(...arguments);
    console.log('AddEvent component initialized');
  },

  didInsertElement() {
    this._super(...arguments);
    console.log('AddEvent component inserted into the DOM');
  },

  willDestroyElement() {
    this._super(...arguments);
    console.log('AddEvent component about to be removed from the DOM');
  },

  @action
  clear(event) {
    event?.preventDefault();
    this.set("model.bufferedEvent", null);
    console.log('AddEvent clear action triggered');
  },

  @action
  saveEvent() {
    console.log('AddEvent saveEvent action triggered');
    if (this.model.valid) {
      this.model.update(this.model.bufferedEvent);
      this.modal.close();
    } else {
      this.flashMessages.add({
        message: I18n.t("add_event.error"),
        type: "error",
      });
    }
  },

  @action
  updateEvent(event, valid) {
    this.setProperties({
      "model.bufferedEvent": event,
      "model.valid": valid,
    });
    console.log('AddEvent updateEvent action triggered', event, valid);
  },
});
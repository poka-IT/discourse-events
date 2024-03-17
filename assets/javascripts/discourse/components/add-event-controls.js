import { eventLabel } from "../lib/date-utilities";
import { default as discourseComputed } from "discourse-common/utils/decorators";
import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import AddEvent from "../controllers/add-event";

export default Component.extend({
  classNames: ["event-label"],
  modal: service(),

  didInsertElement() {
    $(".title-and-category").toggleClass(
      "event-add-no-text",
      this.iconOnly
    );
  },

  @discourseComputed("noText")
  valueClasses(noText) {
    let classes = "add-event";
    if (noText) {
      classes += " btn-primary";
    }
    return classes;
  },

  @discourseComputed("event")
  valueLabel(event) {
    return eventLabel(event, {
      noText: this.noText,
      useEventTimezone: true,
      showRsvp: true,
      siteSettings: this.siteSettings,
    });
  },

  @discourseComputed("category", "noText")
  iconOnly(category, noText) {
    return (
      noText ||
      this.siteSettings.events_event_label_no_text ||
      Boolean(
        category && category.custom_fields.events_event_label_no_text
      )
    );
  },

  @action
  showAddEvent() {
    this.modal.show(AddEvent, {
      model: {
        bufferedEvent: this.event,
        event: this.event,
        update: (event) => {
          this.set("event", event);
        },
      },
    });
  },

  @action  
  removeEvent() {
    this.set("event", null);
  },
});
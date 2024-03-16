import showModal from "discourse/lib/show-modal";
import { eventLabel } from "../lib/date-utilities";
import computed from "@ember/object";

class AddEventControlsComponent {
  constructor() {
    this.classNames = ["event-label"];

    this.didInsertElement = function () {
      $(".title-and-category").toggleClass(
        "event-add-no-text",
        this.iconOnly
      );
    };

    this.valueClasses = computed("noText", function () {
      let classes = "add-event";
      if (this.noText) {
        classes += " btn-primary";
      }
      return classes;
    });

    this.valueLabel = computed("event", function () {
      return eventLabel(this.event, {
        noText: this.noText,
        useEventTimezone: true,
        showRsvp: true,
        siteSettings: this.siteSettings,
      });
    });

    this.iconOnly = computed("category", "noText", function () {
      return (
        this.noText ||
        this.siteSettings.events_event_label_no_text ||
        Boolean(
          this.category && this.category.get("custom_fields.events_event_label_no_text")
        )
      );
    });

    this.showAddEvent = function () {
      showModal("add-event", {
        model: {
          bufferedEvent: this.event,
          event: this.event,
          update: (event) => {
            this.set("event", event);
          },
        },
      });
    };

    this.removeEvent = function () {
      this.set("event", null);
    };
  }
}

export default AddEventControlsComponent;

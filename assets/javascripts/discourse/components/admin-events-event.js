import Component from "@ember/component";
import { notEmpty } from "@ember/object/computed";
import discourseComputed from "discourse-common/utils/decorators";
import Message from "../mixins/message";
import { A } from "@ember/array";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import EventsConfirmEventDeletion from "./events-confirm-event-deletion";

export default Component.extend(Message, {
  modal: service(),

  hasEvents: notEmpty("events"),
  selectedEvents: A(),
  selectAll: false,
  order: null,
  asc: null,
  view: "event",

  @discourseComputed("selectedEvents.[]", "hasEvents")
  deleteDisabled(selectedEvents, hasEvents) {
    return !hasEvents || !selectedEvents.length;
  },

  @discourseComputed("hasEvents")
  selectDisabled(hasEvents) {
    return !hasEvents;
  },

  @action
  showSelect() {
    this.toggleProperty("showSelect");

    if (!this.showSelect) {
      this.setProperties({
        selectedEvents: A(),
        selectAll: false,
      });
    }
  },

  @action
  modifySelection(events, checked) {
    if (checked) {
      this.selectedEvents.pushObjects(events);
    } else {
      this.selectedEvents.removeObjects(events);
    }
  },

  @action
  openDelete() {
    this.modal.show(EventsConfirmEventDeletion, {
      model: {
        events: this.selectedEvents,
      },
      onDestroyEvents: (
        destroyedEvents = null,
        destroyedTopicsEvents = null
      ) => {
        if (destroyedEvents) {
          this.events.removeObjects(destroyedEvents);
        }

        if (destroyedTopicsEvents) {
          const destroyedTopicsEventIds = destroyedTopicsEvents.map(
            (e) => e.id
          );

          this.events.forEach((event) => {
            if (destroyedTopicsEventIds.includes(event.id)) {
              event.set("topics", null);
            }
          });
        }
      },
      onCloseModal: () => {
        this.showSelect();
      },
    });
  },
});
import discourseComputed from "discourse-common/utils/decorators";
import Event from "../models/event";
import I18n from "I18n";
import { action } from "@ember/object";
import Component from "@ember/component";
import { inject as service } from "@ember/service";

const DELETE_TARGETS = ["events_only", "events_and_topics", "topics_only"];

export default Component.extend({
  modal: service(),

  deleteTargets: DELETE_TARGETS.map((t) => ({
    id: t,
    name: I18n.t(`admin.events.event.delete.${t}`),
  })),
  deleteTarget: "events_only",

  @discourseComputed("model.events")
  eventCount(events) {
    return events.length;
  },

  @discourseComputed("deleteTarget")
  btnLabel(deleteTarget) {
    return `admin.events.event.delete.${deleteTarget}_btn`;
  },

  @action
  delete() {
    const events = this.model.events;
    const eventIds = events.map((e) => e.id);
    const target = this.deleteTarget;

    const opts = {
      event_ids: eventIds,
      target,
    };

    this.set("destroying", true);

    Event.destroy(opts)
      .then((result) => {
        if (result.success) {
          this.onDestroyEvents(
            events.filter((e) => result.destroyed_event_ids.includes(e.id)),
            events.filter((e) =>
              result.destroyed_topics_event_ids.includes(e.id)
            )
          );
          this.modal.close();
        } else {
          this.set("model.error", result.error);
        }
      })
      .finally(() => this.set("destroying", false));
  },

  @action
  cancel() {
    this.modal.close();
  },
});
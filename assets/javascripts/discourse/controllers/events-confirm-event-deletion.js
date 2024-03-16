import Component from "@ember/component";
import Event from "../models/event";
import I18n from "I18n";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

const DELETE_TARGETS = ["events_only", "events_and_topics", "topics_only"];

export default class ConfirmEventDeletionComponent extends Component {
  deleteTargets = DELETE_TARGETS.map((t) => ({
    id: t,
    name: I18n.t(`admin.events.event.delete.${t}`),
  }));

  @tracked deleteTarget = "events_only";
  @tracked destroying = false;

  get eventCount() {
    return this.model.events.length;
  }

  get btnLabel() {
    return `admin.events.event.delete.${this.deleteTarget}_btn`;
  }

  @action
  delete() {
    const events = this.model.events;
    const eventIds = events.map((e) => e.id);
    const target = this.deleteTarget;

    const opts = {
      event_ids: eventIds,
      target,
    };

    this.destroying = true;

    Event.destroy(opts)
      .then((result) => {
        if (result.success) {
          this.onDestroyEvents(
            events.filter((e) => result.destroyed_event_ids.includes(e.id)),
            events.filter((e) =>
              result.destroyed_topics_event_ids.includes(e.id)
            )
          );
          this.onCloseModal();
          this.send("closeModal");
        } else {
          this.model.error = result.error;
        }
      })
      .finally(() => (this.destroying = false));
  }

  @action
  cancel() {
    this.onCloseModal();
    this.send("closeModal");
  }
}
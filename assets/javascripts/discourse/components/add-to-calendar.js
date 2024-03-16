import { googleUri, icsUri } from "../lib/date-utilities";
import { bind } from "@ember/runloop";
import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { computed } from "@ember/object";

export default class AddToCalendarComponent extends Component {
  @service modal;

  expanded = false;
  classNames = "add-to-calendar";

  didInsertElement() {
    $(document).on("click", bind(this, this.outsideClick));
  }

  willDestroyElement() {
    $(document).off("click", bind(this, this.outsideClick));
  }

  outsideClick(e) {
    if (!this.isDestroying && !$(e.target).closest(".add-to-calendar").length) {
      this.set("expanded", false);
    }
  }

  @computed("topic.event")
  get calendarUris() {
    const topic = this.get("topic");

    let params = {
      event: topic.event,
      title: topic.title,
      url: window.location.hostname + topic.get("url"),
    };

    if (topic.location && topic.location.geo_location) {
      params["location"] = topic.location.geo_location.address;
    }

    return [
      { uri: googleUri(params), label: "google" },
      { uri: icsUri(params), label: "ics" },
    ];
  }

  @action
  expand() {
    this.toggleProperty("expanded");
  }

  @action
  showAddToCalendarModal() {
    this.modal.show(AddToCalendarModal, {
      model: {
        topic: this.topic,
      },
    });
  }
}

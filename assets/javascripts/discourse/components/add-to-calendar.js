import { googleUri, icsUri } from "../lib/date-utilities";
import { default as discourseComputed } from "discourse-common/utils/decorators";
import { bind } from "@ember/runloop";
import Component from "@ember/component";
import { action } from "@ember/object";

export default Component.extend({
  expanded: false,
  classNames: "add-to-calendar",

  didInsertElement() {
    $(document).on("click", bind(this, this.outsideClick));
  },

  willDestroyElement() {
    $(document).off("click", bind(this, this.outsideClick));
  },

  outsideClick(e) {
    if (!this.isDestroying && !$(e.target).closest(".add-to-calendar").length) {
      this.set("expanded", false);
    }
  },

  @discourseComputed("topic.event")
  calendarUris() {
    const topic = this.topic;

    let params = {
      event: topic.event,
      title: topic.title,
      url: window.location.hostname + topic.url,
    };

    if (topic.location && topic.location.geo_location) {
      params["location"] = topic.location.geo_location.address;
    }

    return [
      { uri: googleUri(params), label: "google" },
      { uri: icsUri(params), label: "ics" },
    ];
  },

  @action
  expand() {
    this.toggleProperty("expanded");
  },
});
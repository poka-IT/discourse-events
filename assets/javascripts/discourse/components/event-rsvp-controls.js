import I18n from "I18n";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { action } from "@ember/object";
import { equal, gt, notEmpty } from "@ember/object/computed";
import { default as discourseComputed } from "discourse-common/utils/decorators";
import Component from "@ember/component";

export default Component.extend({
  classNames: "event-rsvp",

  didReceiveAttrs() {
    const currentUser = this.currentUser;
    const eventGoing = this.model.topic.event.going;

    this.setProperties({
      goingTotal: eventGoing ? eventGoing.length : 0,
      userGoing: currentUser && eventGoing && eventGoing.includes(currentUser.username)
    });
  },

  @discourseComputed("userGoing")
  goingClasses(userGoing) {
    return userGoing ? "btn-primary" : "";
  },

  @discourseComputed("currentUser", "eventFull")
  canGo(currentUser, eventFull) {
    return currentUser && !eventFull;
  },

  hasGuests: gt("goingTotal", 0),
  hasMax: notEmpty("model.topic.event.going_max"),

  @discourseComputed("goingTotal", "model.topic.event.going_max")
  spotsLeft(goingTotal, goingMax) {
    return Number(goingMax) - Number(goingTotal);
  },

  eventFull: equal("spotsLeft", 0),

  @discourseComputed("hasMax", "eventFull")
  goingMessage(hasMax, full) {
    if (hasMax) {
      if (full) {
        return I18n.t("event_rsvp.going.max_reached");
      } else {
        const spotsLeft = this.spotsLeft;
        return spotsLeft === 1 ? I18n.t("event_rsvp.going.one_spot_left") : I18n.t("event_rsvp.going.x_spots_left", { spotsLeft });
      }
    }
    return false;
  },

  updateTopic(userName, action, type) {
    let existing = this.model.topic.event[type];
    let list = existing || [];
    action === "add" ? list.push(userName) : list.splice(list.indexOf(userName), 1);

    this.setProperties({
      userGoing: action === "add",
      goingTotal: list.length,
      [`model.topic.event.${type}`]: list
    });
  },

  save(user, action, type) {
    this.set("isLoading", true);

    ajax(`/discourse-events/rsvp/${action}`, {
      type: "POST",
      data: {
        topic_id: this.model.topic.id,
        type,
        usernames: [user.username]
      }
    })
    .then(result => {
      if (result.success) {
        this.updateTopic(user.username, action, type);
      }
    })
    .catch(popupAjaxError)
    .finally(() => this.set("isLoading", false));
  },

  @action
  rsvp() {
    const currentUser = this.currentUser;
    const userGoing = this.userGoing;
    const action = userGoing ? "remove" : "add";
    this.save(currentUser, action, "going");
  },

  @action
  closeModal() {
    this.closeModal();
  }
});
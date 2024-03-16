import { popupAjaxError } from "discourse/lib/ajax-error";
import { inject as service } from "@ember/service";
import { action, computed } from "@ember/object";
import Component from "@ember/component";
import { equal } from "@ember/object/computed";
import I18n from "I18n";

export default class EventRsvpComponent extends Component {
  @service modal;

  classNames = "event-rsvp";
  goingSaving = false;

  didReceiveAttrs() {
    const currentUser = this.currentUser;
    const eventGoing = this.topic.event.going;

    this.setProperties({
      goingTotal: eventGoing ? eventGoing.length : 0,
      userGoing:
        currentUser &&
        eventGoing &&
        eventGoing.indexOf(currentUser.username) > -1,
    });
  }

  @computed("userGoing")
  get goingClasses() {
    return this.userGoing ? "btn-primary" : "";
  }

  @computed("currentUser", "eventFull")
  get canGo() {
    return this.currentUser && !this.eventFull;
  }

  @computed("goingTotal", "topic.event.going_max")
  get spotsLeft() {
    return Number(this.topic.event.going_max) - Number(this.goingTotal);
  }

  @equal("spotsLeft", 0)
  eventFull;

  @computed("hasMax", "eventFull")
  get goingMessage() {
    if (this.hasMax) {
      if (this.eventFull) {
        return I18n.t("event_rsvp.going.max_reached");
      } else {
        const spotsLeft = this.spotsLeft;

        if (spotsLeft === 1) {
          return I18n.t("event_rsvp.going.one_spot_left");
        } else {
          return I18n.t("event_rsvp.going.x_spots_left", { spotsLeft });
        }
      }
    }

    return false;
  }

  updateTopic(userName, _action, type) {
    let existing = this.topic.event[type];
    let list = existing ? existing : [];
    let userGoing = _action === "add";

    if (userGoing) {
      list.push(userName);
    } else {
      list.splice(list.indexOf(userName), 1);
    }

    let props = {
      userGoing,
      goingTotal: list.length,
    };
    props[`topic.event.${type}`] = list;
    this.setProperties(props);
  }

  save(user, _action, type) {
    this.set(`${type}Saving`, true);

    ajax(`/discourse-events/rsvp/${_action}`, {
      type: "POST",
      data: {
        topic_id: this.topic.id,
        type,
        usernames: [user.username],
      },
    })
      .then((result) => {
        if (result.success) {
          this.updateTopic(user.username, _action, type);
        }
      })
      .catch(popupAjaxError)
      .finally(() => {
        this.set(`${type}Saving`, false);
      });
  }

  @action
  openModal(event) {
    event?.preventDefault();
    this.modal.show("event-rsvp", {
      model: {
        topic: this.topic,
      },
    });
  }

  @action
  going() {
    const currentUser = this.currentUser;
    const userGoing = this.userGoing;

    let _action = userGoing ? "remove" : "add";

    this.save(currentUser, _action, "going");
  }
}

import {
  default as discourseComputed,
  observes,
} from "discourse-common/utils/decorators";
import { getOwner } from "discourse-common/lib/get-owner";
import { ajax } from "discourse/lib/ajax";
import { extractError } from "discourse/lib/ajax-error";
import { action } from "@ember/object";
import Component from "@ember/component";
import { inject as service } from "@ember/service";

export default Component.extend({
  modal: service(),

  filter: null,
  userList: [],
  type: "going",

  @observes("type", "model.topic")
  setUserList() {
    this.set("loadingList", true);

    const type = this.type;
    const topic = this.model.topic;

    let usernames = topic.get(`event.${type}`);

    if (!usernames || !usernames.length) {
      return;
    }

    ajax("/discourse-events/rsvp/users", {
      data: {
        usernames,
      },
    })
      .then((response) => {
        let userList = response.users || [];

        this.setProperties({
          userList,
          loadingList: false,
        });
      })
      .catch((e) => {
        this.flashMessages.add({
          message: extractError(e),
          type: "error",
        });
      })
      .finally(() => {
        this.setProperties({
          loadingList: false,
        });
      });
  },

  @discourseComputed("type")
  goingNavClass(type) {
    return type === "going" ? "active" : "";
  },

  @discourseComputed("userList", "filter")
  filteredList(userList, filter) {
    if (filter) {
      userList = userList.filter((u) => u.username.indexOf(filter) > -1);
    }

    const currentUser = this.currentUser;
    if (currentUser) {
      userList.sort((a) => {
        if (a.username === currentUser.username) {
          return -1;
        } else {
          return 1;
        }
      });
    }

    return userList;
  },

  @action
  setType(type) {
    event?.preventDefault();
    this.set("type", type);
  },

  @action
  composePrivateMessage(user) {
    const controller = getOwner(this).lookup("controller:application");
    this.modal.close();
    controller.send("composePrivateMessage", user);
  },
});
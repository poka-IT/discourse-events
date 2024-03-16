import Component from "@ember/component";
import { getOwner } from "discourse-common/lib/get-owner";
import { ajax } from "discourse/lib/ajax";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { extractError } from "discourse/lib/ajax-error";

export default class EventRsvpComponent extends Component {
    @tracked filter = null;
    @tracked userList = [];
    @tracked type = "going";
    @tracked loadingList = false;
    @tracked flash = null;
    @tracked flashType = null;

    get goingNavClass() {
        return this.type === "going" ? "active" : "";
    }

    get filteredList() {
        let userList = this.userList;

        if (this.filter) {
            userList = userList.filter((u) => u.username.indexOf(this.filter) > -1);
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
    }

    setUserList() {
        this.loadingList = true;

        const type = this.type;
        const topic = this.model.topic;

        let usernames = topic[`event.${type}`];

        if (!usernames || !usernames.length) {
            return;
        }

        ajax("/discourse-events/rsvp/users", {
            data: {
                usernames,
            },
        })
            .then((response) => {
                this.userList = response.users || [];
                this.loadingList = false;
            })
            .catch((e) => {
                this.flash = extractError(e);
                this.flashType = "alert-error";
            })
            .finally(() => {
                this.loadingList = false;
            });
    }

    @action
    setType(type) {
        event?.preventDefault();
        this.type = type;
        this.setUserList();
    }

    @action
    composePrivateMessage(user) {
        const controller = getOwner(this).lookup("controller:application");
        this.send("closeModal");
        controller.send("composePrivateMessage", user);
    }
}
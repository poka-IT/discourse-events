import Component from "@ember/component";
import Connection from "../models/connection";
import { notEmpty } from "@ember/object/computed";
import Message from "../mixins/message";
import I18n from "I18n";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default Component.extend(Message, {
  dialog: service(),

  hasConnections: notEmpty("connections"),
  view: "connection",

  @action
  addConnection() {
    this.connections.pushObject(
      Connection.create({
        id: "new",
        from_time: moment()
          .subtract(1, "months")
          .add(30, "minutes")
          .startOf("hour"),
        to_time: moment().add(5, "months").add(30, "minutes").startOf("hour"),
      })
    );
  },

  @action
  removeConnection(connection) {
    if (connection.id === "new") {
      this.connections.removeObject(connection);
    } else {
      this.dialog.yesNoConfirm({
        message: I18n.t("admin.events.connection.remove.confirm"),
        didConfirm: () => {
          Connection.destroy(connection).then(() => {
            this.connections.removeObject(connection);
          });
        },
      });
    }
  },
});
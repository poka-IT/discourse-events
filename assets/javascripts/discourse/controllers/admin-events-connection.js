import Component from "@ember/component";
import Connection from "../models/connection";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import I18n from "I18n";

export default class AdminEventsConnectionComponent extends Component {
  @tracked connections = [];
  @tracked view = "connection";

  get hasConnections() {
    return this.connections.length > 0;
  }

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
  }

  @action
  removeConnection(connection) {
    if (connection.id === "new") {
      this.connections.removeObject(connection);
    } else {
      bootbox.confirm(
        I18n.t("admin.events.connection.remove.confirm"),
        I18n.t("cancel"),
        I18n.t("admin.events.connection.remove.label"),
        (result) => {
          if (result) {
            Connection.destroy(connection).then(() => {
              this.connections.removeObject(connection);
            });
          }
        }
      );
    }
  }
}
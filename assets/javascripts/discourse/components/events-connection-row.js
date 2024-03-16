import Component from "@ember/component";
import Connection from "../models/connection";
import { inject as service } from "@ember/service";
import { action, computed } from "@ember/object";
import { notEmpty, readOnly } from "@ember/object/computed";

export default class EventsConnectionRowComponent extends Component {
  @service modal;

  tagName = "tr";
  attributeBindings = ["connection.id:data-connection-id"];
  classNameBindings = [
    ":events-connection-row",
    "hasChildCategory:has-child-category",
  ];

  hasFilters = notEmpty("connection.filters");
  hasChildCategory = readOnly("connection.category.parent_category_id");

  currentConnection;

  constructor() {
    super(...arguments);
    this.currentConnection = JSON.parse(JSON.stringify(this.connection));
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    this.setMessage("info", "info");
  }

  @computed(
    "connection.user.username",
    "connection.category_id",
    "connection.source_id",
    "connection.client",
    "connection.from_time",
    "connection.to_time",
    "connection.filters.[]",
    "connection.filters.@each.query_column",
    "connection.filters.@each.query_value"
  )
  get connectionChanged() {
    const {
      username,
      categoryId,
      sourceId,
      client,
      fromTime,
      toTime,
      filters,
    } = this.connection;
    const cc = this.currentConnection;
    return (
      (!cc.user && username) ||
      (cc.user && cc.user.username !== username) ||
      cc.category_id !== categoryId ||
      cc.source_id !== sourceId ||
      cc.client !== client ||
      cc.from_time !== fromTime ||
      cc.to_time !== toTime ||
      !filtersMatch(filters, cc.filters)
    );
  }

  @computed("connectionChanged")
  get saveDisabled() {
    const {
      connectionChanged,
      connection: { user, category_id, source_id, client },
    } = this;
    return (
      !connectionChanged || !user || !category_id || !source_id || !client
    );
  }

  @computed("connectionChanged")
  get saveClass() {
    return this.connectionChanged ? "btn-primary save-connection" : "save-connection";
  }

  @computed("syncDisabled")
  get syncClass() {
    return this.syncDisabled ? "sync-connection" : "btn-primary sync-connection";
  }

  @computed("connectionChanged", "loading")
  get syncDisabled() {
    return this.connectionChanged || this.loading;
  }

  @computed("hasFilters")
  get filterClass() {
    let classes = "show-filters";
    if (this.hasFilters) {
      classes += " btn-primary";
    }
    return classes;
  }

  @action
  updateUser(usernames) {
    const connection = this.connection;
    if (!connection.user) {
      connection.set("user", {});
    }
    connection.set("user.username", usernames[0]);
  }

  @action
  openFilters() {
    this.modal.show("events-connection-filters", {
      model: {
        connection: this.connection,
      },
    });
  }

  @action
  saveConnection() {
    const connection = this.connection;

    if (!connection.source_id) {
      return;
    }

    const data = {
      id: connection.id,
      category_id: connection.category_id,
      client: connection.client,
      source_id: connection.source_id,
      user: connection.user,
    };

    if (connection.filters) {
      data.filters = JSON.parse(JSON.stringify(connection.filters));
    }

    this.loading = true;

    Connection.update(data)
      .then((result) => {
        if (result) {
          this.currentConnection = result.connection;
          this.connection = Connection.create(result.connection);
        } else if (this.currentSource.id !== "new") {
          this.connection = JSON.parse(JSON.stringify(this.currentConnection));
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }

  @action
  syncConnection() {
    const connection = this.connection;

    this.loading = true;
    Connection.sync(connection)
      .then((result) => {
        if (result.success) {
          this.setMessage("sync_started", "success");
        } else {
          this.setMessage("sync_failed_to_start", "error");
        }
      })
      .finally(() => {
        this.loading = false;

        setTimeout(() => {
          if (!this.isDestroying && !this.isDestroyed) {
            this.setMessage("info", "info");
          }
        }, 5000);
      });
  }
}

function filtersMatch(filters1, filters2) {
  if ((filters1 && !filters2) || (!filters1 && filters2)) {
    return false;
  }

  if (!filters1 && !filters2) {
    return true;
  }

  if (filters1.length !== filters2.length) {
    return false;
  }

  return filters1.every((f1) =>
    filters2.some((f2) => {
      return (
        f2.query_column === f1.query_column && f2.query_value === f1.query_value
      );
    })
  );
}

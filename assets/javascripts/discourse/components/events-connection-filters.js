import discourseComputed from "discourse-common/utils/decorators";
import ConnectionFilter from "../models/connection-filter";
import { A } from "@ember/array";
import { action } from "@ember/object";
import Component from "@ember/component";

const QUERY_COLUMNS = [
  {
    name: "Event Name",
    id: "name",
  },
];

export default Component.extend({
  @discourseComputed
  queryColumns() {
    return QUERY_COLUMNS;
  },

  init() {
    this._super(...arguments);
    if (!this.model.connection.filters) {
      this.model.connection.set("filters", A());
    }
  },

  @action
  addFilter() {
    const filter = ConnectionFilter.create({ id: "new" });
    this.model.connection.get("filters").pushObject(filter);
  },

  @action
  removeFilter(filter) {
    this.model.connection.get("filters").removeObject(filter);
  },
});
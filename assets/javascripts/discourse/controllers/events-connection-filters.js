import Component from "@ember/component";
import ConnectionFilter from "../models/connection-filter";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

const QUERY_COLUMNS = [
  {
    name: "Event Name",
    id: "name",
  },
];

export default class EventsConnectionFiltersComponent extends Component {
  @tracked queryColumns = QUERY_COLUMNS;

  constructor() {
    super(...arguments);
    if (!this.model.connection.filters) {
      this.model.connection.filters = [];
    }
  }

  @action
  addFilter() {
    const filter = ConnectionFilter.create({ id: "new" });
    this.model.connection.filters.pushObject(filter);
  }

  @action
  removeFilter(filter) {
    this.model.connection.filters.removeObject(filter);
  }
}
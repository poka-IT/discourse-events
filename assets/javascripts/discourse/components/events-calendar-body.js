import Component from "@ember/component";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";
import { firstDayOfWeek } from "../lib/date-utilities";

export default class EventsCalendarBodyComponent extends Component {
  @service i18n;
  @service modal;

  classNames = "events-calendar-body";
  expandedDate = 0.0;

  constructor() {
    super(...arguments);
    moment.locale(this.i18n.locale);
  }

  get weekdays() {
    let data = moment.localeData();
    let weekdays = [...(this.responsive ? data.weekdaysMin() : data.weekdays())];
    let firstDay = firstDayOfWeek();
    let beforeFirst = weekdays.splice(0, firstDay);
    weekdays.push(...beforeFirst);
    return weekdays;
  }

  @action
  resetExpandedDate() {
    this.expandedDate = null;
  }

  @action
  setExpandedDate(date) {
    event?.preventDefault();
    const month = this.currentMonth;
    this.expandedDate = `${month}.${date}`;
  }

  @action
  showModal() {
    this.modal.show("events-calendar-modal", {
      title: "My Modal Title",
      modalClass: "my-modal-class",
      model: { topic: this.topic },
    });
  }
}
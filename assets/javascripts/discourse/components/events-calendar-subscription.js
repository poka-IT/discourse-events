import { inject as service } from "@ember/service";
import Component from "@ember/component";
import { action } from "@ember/object";
import I18n from "I18n";
import getURL from "discourse-common/lib/get-url";

export default class EventsCalendarSubscriptionComponent extends Component {
  @service modal;

  classNames = ["events-calendar-subscription"];

  modifyComponentForRow() {
    return "events-calendar-subscription-row";
  }

  getDomain() {
    return location.hostname + (location.port ? ":" + location.port : "");
  }

  content = [
    {
      id: `webcal://${url}/calendar.ics?time_zone=${timeZone}`,
      name: I18n.t("events_calendar.ical"),
    },
    {
      id: `${url}/calendar.rss?time_zone=${timeZone}`,
      name: I18n.t("events_calendar.rss"),
    },
  ];

  @action
  onSelect() {}

  showCalendarModal() {
    const url = this.getDomain() + getURL(path);
    const timeZone = moment.tz.guess();
    const model = {
      url,
      timeZone,
    };
    this.modal.show("events-calendar-modal", { model });
  }
}

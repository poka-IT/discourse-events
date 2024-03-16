import Component from "@glimmer/component";
import { action, computed } from "@ember/object";
import { gt } from "@ember/object/computed";
import { bind } from "@ember/runloop";
import { htmlSafe } from "@ember/template";
import { eventsForDay } from "../lib/date-utilities";

const MAX_EVENTS = 4;

export default class EventsCalendarDay extends Component {
  classNameBindings = [":day", "classes", "differentMonth"];
  attributeBindings = ["day:data-day"];
  hidden = 0;
  hasHidden = gt("hidden", 0);

  @computed("date", "month", "expandedDate")
  get expanded() {
    return `${this.month}.${this.date}` === this.expandedDate;
  }

  @computed("month", "currentMonth")
  get differentMonth() {
    return this.month !== this.currentMonth;
  }

  @action
  setEvents() {
    const expanded = this.expanded;
    const allEvents = this.allEvents;
    let events = $.extend([], allEvents);

    if (events.length && !expanded) {
      let hidden = events.splice(MAX_EVENTS);

      if (hidden.length) {
        this.hidden = hidden.length;
      }
    } else {
      this.hidden = 0;
    }

    this.events = events;
  }

  @computed("day", "topics.[]", "expanded", "rowIndex")
  get allEvents() {
    return eventsForDay(this.day, this.topics, {
      rowIndex: this.rowIndex,
      expanded: this.expanded,
      siteSettings: this.siteSettings,
    });
  }

  @computed("index")
  get rowIndex() {
    return this.index % 7;
  }

  didInsertElement() {
    this.clickHandler = bind(this, this.documentClick);
    $(document).on("click", this.clickHandler);
  }

  willDestroyElement() {
    $(document).off("click", this.clickHandler);
  }

  documentClick(event) {
    if (
      !event.target.closest(
        `.events-calendar-body .day[data-day='${this.day}']`
      )
    ) {
      this.clickOutside();
    } else {
      this.click();
    }
  }

  clickOutside() {
    if (this.expanded) {
      this.setExpandedDate(null);
    }
  }

  click() {
    const canSelectDate = this.canSelectDate;
    if (canSelectDate) {
      const date = this.date;
      const month = this.month;
      this.selectDate(date, month);
    }
  }

  @computed("index")
  get date() {
    const day = this.day;
    return day.date();
  }

  @computed("index")
  get month() {
    const day = this.day;
    return day.month();
  }

  @computed("day", "currentDate", "currentMonth", "expanded", "responsive")
  get classes() {
    let classes = "";
    if (this.day.isSame(moment(), "day")) {
      classes += "today ";
    }
    if (
      this.responsive &&
      this.day.isSame(moment().month(this.currentMonth).date(this.currentDate), "day")
    ) {
      classes += "selected ";
    }
    if (this.expanded) {
      classes += "expanded";
    }
    return classes;
  }

  @computed("expanded")
  get containerStyle() {
    let style = "";

    if (this.expanded) {
      const offsetLeft = this.element.offsetLeft;
      const offsetTop = this.element.offsetTop;
      const windowWidth = $(window).width();
      const windowHeight = $(window).height();

      if (offsetLeft > windowWidth / 2) {
        style += "right:0;";
      } else {
        style += "left:0;";
      }

      if (offsetTop > windowHeight / 2) {
        style += "bottom:0;";
      } else {
        style += "top:0;";
      }
    }

    return htmlSafe(style);
  }
}
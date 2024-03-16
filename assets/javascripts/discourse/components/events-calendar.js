import Component from "@ember/component";
import { computed } from "@ember/object";
import { not, alias, or } from "@ember/object/computed";
import { bind } from "@ember/runloop";
import { inject as service } from "@ember/service";
import I18n from "I18n";

const RESPONSIVE_BREAKPOINT = 800;
const YEARS = [
  moment().subtract(1, "year").year(),
  moment().year(),
  moment().add(1, "year").year(),
];

export default Component.extend({
  classNames: ["events-calendar"],
  classNameBindings: ["responsive"],
  showEvents: not("eventsBelow"),
  canSelectDate: alias("eventsBelow"),
  routing: service("-routing"),
  queryParams: alias(
    "routing.router.currentRoute.queryParams"
  ),
  years: computed(function() {
    return YEARS.map((y) => ({ id: y, name: y }));
  }),
  layoutName: "components/events-calendar",
  webcalDocumentationURL: "https://coop.pavilion.tech/t/1447",

  init() {
    this._super(...arguments);
    moment.locale(I18n.locale);

    this.handleResize();
    window.addEventListener("resize", bind(this, this.handleResize));
    document.body.classList.add("calendar");

    let currentDate = moment().date();
    let currentMonth = moment().month();
    let currentYear = moment().year();

    const initialDateRange = this.initialDateRange;
    const queryParams = this.queryParams;
    let dateRange = {};
    if (initialDateRange) {
      dateRange = initialDateRange;
    }
    if (queryParams.start) {
      dateRange.start = queryParams.start;
    }
    if (queryParams.end) {
      dateRange.end = queryParams.end;
    }

    if (dateRange.start && dateRange.end) {
      const start = moment(dateRange.start);
      const end = moment(dateRange.end);
      const diff = Math.abs(start.diff(end, "days"));
      const middleDay = start.add(diff / 2, "days");
      currentMonth = middleDay.month();
      currentYear = middleDay.year();
    }

    let month = currentMonth;
    let year = currentYear;

    this.setProperties({ currentDate, currentMonth, currentYear, month, year });
  },

  showNotice: computed("siteSettings.login_required", "category.read_restricted", function() {
    const loginRequired = this.siteSettings.login_required;
    const categoryRestricted = this.category.read_restricted;
    return loginRequired || categoryRestricted;
  }),

  willDestroy() {
    window.removeEventListener("resize", bind(this, this.handleResize));
    document.body.classList.remove("calendar");
  },

  handleResize() {
    if (this.isDestroyed) {
      return;
    }
    this.set("responsiveBreak", window.innerWidth < RESPONSIVE_BREAKPOINT);
  },

  forceResponsive: false,
  responsive: or("forceResponsive", "responsiveBreak", "site.mobileView"),
  showFullTitle: not("responsive"),
  eventsBelow: alias("responsive"),

  todayLabel: computed("responsive", function() {
    const responsive = this.responsive;
    return responsive ? null : "events_calendar.today";
  }),

  months: computed(function() {
    return moment.localeData().months().map((m, i) => {
      return { id: i, name: m };
    });
  }),

  dateEvents: computed("currentDate", "currentMonth", "currentYear", "topics.[]", function() {
    const currentDate = this.currentDate;
    const currentMonth = this.currentMonth;
    const currentYear = this.currentYear;
    const topics = this.topics;
    const day = moment().year(currentYear).month(currentMonth);
    return eventsForDay(day.date(currentDate), topics, {
      dateEvents: true,
      siteSettings: this.siteSettings,
    });
  }),

  days: computed("currentMonth", "currentYear", function() {
    const currentMonth = this.currentMonth;
    const currentYear = this.currentYear;
    const { start, end } = calendarDays(currentMonth, currentYear);
    let days = [];
    for (let day = moment(start); day.isBefore(end); day.add(1, "days")) {
      days.push(moment().year(day.year()).month(day.month()).date(day.date()));
    }
    return days;
  }),

  showSubscription: computed(function() {
    return true; // !this.category || !this.category.read_restricted;
  }),

  transitionToMonth(month, year) {
    const { start, end } = calendarRange(month, year);
    const router = this.routing.router;

    if (this.loading) {
      return;
    }
    this.set("loading", true);

    return router.transitionTo({
      queryParams: { start, end },
    }).then(() => {
      const category = this.category;
      let filter = "";

      if (category) {
        filter += `c/${Category.slugFor(category)}/l/`;
      }
      filter += "calendar";

      this.store.findFiltered("topicList", {
        filter,
        params: { start, end },
      }).then((list) => {
        if (this.isDestroyed) {
          return;
        }

        this.setProperties({
          topics: list.topics,
          currentMonth: month,
          currentYear: year,
          loading: false,
        });
      });
    });
  },

  getNewTopics: computed("month", "year", function() {
    const currentMonth = this.currentMonth;
    const currentYear = this.currentYear;
    const month = this.month;
    const year = this.year;
    if (currentMonth !== month || currentYear !== year) {
      this.transitionToMonth(month, year);
    }
  }),

  actions: {
    selectDate(selectedDate, selectedMonth) {
      const month = this.month;
      if (month !== selectedMonth) {
        this.set("month", selectedMonth);
      }
      this.set("currentDate", selectedDate);
    },

    today() {
      this.setProperties({
        month: moment().month(),
        year: moment().year(),
        currentDate: moment().date(),
      });
    },

    monthPrevious() {
      let currentMonth = this.currentMonth;
      let year = this.currentYear;
      let month;

      if (currentMonth === 0) {
        month = 11;
        year = year - 1;
      } else {
        month = currentMonth - 1;
      }

      this.setProperties({ month, year });
    },

    monthNext() {
      let currentMonth = this.currentMonth;
      let year = this.currentYear;
      let month;

      if (currentMonth === 11) {
        month = 0;
        year = year + 1;
      } else {
        month = currentMonth + 1;
      }

      this.setProperties({ month, year });
    },

    changeSubscription() {},
  },
});

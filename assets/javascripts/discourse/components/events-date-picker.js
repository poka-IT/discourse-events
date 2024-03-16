import { inject as service } from "@ember/service";
import { observes, on } from "discourse-common/utils/decorators";
import loadScript from "discourse/lib/load-script";
import { firstDayOfWeek } from "../lib/date-utilities";
import { next } from "@ember/runloop";
import I18n from "I18n";
import { deepMerge } from "discourse-common/lib/object";
import MyModal from "discourse/components/my-modal";
import { action } from "@ember/object";
import Component from "@ember/component";

export default class EventsDatePicker extends Component {
  @service modal;

  layoutName = "components/date-picker";

  flash = null;

  @observes("value")
  setDate() {
    if (this._picker && this.value) {
      this._picker.setDate(this.value);
    }
  }

  @on("didInsertElement")
  _loadDatePicker() {
    const input = this.element.querySelector(".date-picker");
    const container = document.getElementById(this.get("containerId"));

    loadScript("/javascripts/pikaday.js").then(() => {
      next(() => {
        let default_opts = {
          field: input,
          container: container || this.element,
          bound: container === undefined,
          format: "YYYY-MM-DD",
          firstDay: firstDayOfWeek(),
          i18n: {
            previousMonth: I18n.t("dates.previous_month"),
            nextMonth: I18n.t("dates.next_month"),
            months: moment.months(),
            weekdays: moment.weekdays(),
            weekdaysShort: moment.weekdaysShort(),
          },
          onSelect: (date) => {
            const formattedDate = moment(date).format("YYYY-MM-DD");

            if (this.attrs.onSelect) {
              this.attrs.onSelect(formattedDate);
            }

            if (!this.element || this.isDestroying || this.isDestroyed) {
              return;
            }

            this.set("value", formattedDate);
          },
        };

        this._picker = new Pikaday(deepMerge(default_opts, this._opts())); // eslint-disable-line no-undef
      });
    });
  }

  @action
  showMyModal() {
    this.modal.show(MyModal, {
      model: { value: this.value },
    });
  }
}

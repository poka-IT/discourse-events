import Component from "@ember/component";
import { alias } from "@ember/object/computed";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";

export default class CustomWizardFieldEventComponent extends Component {
  @service modal;

  layoutName = "javascripts/wizard/templates/components/wizard-field-event";
  eventTimezones = alias("field.event_timezones");

  @action
  updateEvent(event, status) {
    this.set("field.value", event);
    this.field.setValid(status);
  }

  @action
  showMyModal() {
    this.modal.show("my-modal", {
      model: { topic: this.topic },
      title: "My Modal Title",
      modalClass: "my-modal-class",
    }).then((controller) => {
      controller.set("updateTopic", this.updateTopic);
    });
  }
}

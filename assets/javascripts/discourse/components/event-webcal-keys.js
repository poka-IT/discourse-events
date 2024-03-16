import Component from "@ember/component";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { inject as service } from "@ember/service";
import { action } from "@ember/object";

export default class EventWebcalKeysComponent extends Component {
  @service modal;

  @action
  show() {
    ajax(KEY_ENDPOINT, {
      type: "GET",
    })
      .then((result) => {
        this.set("apiKey", result["api_keys"][0]["key"]);
        this.set("clientID", result["api_keys"][0]["client_id"]);
      })
      .catch(popupAjaxError);
  }

  @action
  closeModal() {
    // Add any cleanup logic here
    this.modal.closeModal();
  }
}

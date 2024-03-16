import Component from "@ember/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

export default class AdminEventsLogComponent extends Component {
  @tracked logs = [];
  @tracked order = null;
  @tracked asc = null;
  @tracked view = "log";
  @tracked flash = null;
  @tracked flashType = null;

  get hasLogs() {
    return this.logs.length > 0;
  }

  @action
  showFlash(message, type = 'alert') {
    this.flash = message;
    this.flashType = type;
  }

  @action
  clearFlash() {
    this.flash = null;
    this.flashType = null;
  }
}
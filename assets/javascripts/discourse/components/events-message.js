import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import I18n from "I18n";

const icons = {
  error: "times-circle",
  success: "check-circle",
  warn: "exclamation-circle",
  info: "info-circle",
};

const urls = {
  provider: "https://discourse.pluginmanager.org/t/539",
  source: "https://discourse.pluginmanager.org/t/540",
  connection: "https://discourse.pluginmanager.org/t/541",
  event: "https://discourse.pluginmanager.org/t/543",
  log: "https://discourse.pluginmanager.org/t/543",
};

export default class EventsMessageComponent extends Component {
  @tracked loading = false;
  classNameBindings = [":events-message", "message.type", "loading"];

  get showDocumentation() {
    return !this.loading;
  }

  get showIcon() {
    return !this.loading;
  }

  get hasItems() {
    return this.args.items && this.args.items.length > 0;
  }

  get icon() {
    return icons[this.args.message.type] || "info-circle";
  }

  get text() {
    return I18n.t(`admin.events.message.${this.args.view}.${this.args.message.key}`, this.args.message.opts || {});
  }

  get documentation() {
    return I18n.t(`admin.events.message.documentation`);
  }

  get documentationUrl() {
    return urls[this.args.view] || "https://discourse.pluginmanager.org/c/discourse-events";
  }
}
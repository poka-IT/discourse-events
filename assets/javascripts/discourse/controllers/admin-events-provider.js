import Component from "@ember/component";
import Provider from "../models/provider";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import I18n from "I18n";

export default class AdminEventsProviderComponent extends Component {
  @tracked providers = [];
  @tracked view = "provider";
  @tracked flash = null;
  @tracked flashType = null;

  get hasProviders() {
    return this.providers.length > 0;
  }

  @action
  addProvider() {
    this.providers.pushObject(
      Provider.create({
        id: "new",
      })
    );
  }

  @action
  removeProvider(provider) {
    if (provider.id === "new") {
      this.providers.removeObject(provider);
    } else {
      bootbox.confirm(
        I18n.t("admin.events.provider.remove.confirm", {
          provider_name: provider.name,
        }),
        I18n.t("cancel"),
        I18n.t("admin.events.provider.remove.label"),
        (result) => {
          if (result) {
            Provider.destroy(provider).then(() => {
              this.providers.removeObject(provider);
            });
          }
        }
      );
    }
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
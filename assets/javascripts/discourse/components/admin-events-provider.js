import Component from "@ember/component";
import Provider from "../models/provider";
import { notEmpty } from "@ember/object/computed";
import Message from "../mixins/message";
import I18n from "I18n";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default Component.extend(Message, {
  dialog: service(),

  hasProviders: notEmpty("providers"),
  view: "provider",

  @action
  addProvider() {
    this.providers.pushObject(
      Provider.create({
        id: "new",
      })
    );
  },

  @action
  removeProvider(provider) {
    if (provider.id === "new") {
      this.providers.removeObject(provider);
    } else {
      this.dialog.yesNoConfirm({
        message: I18n.t("admin.events.provider.remove.confirm", {
          provider_name: provider.name,
        }),
        didConfirm: () => {
          Provider.destroy(provider).then(() => {
            this.providers.removeObject(provider);
          });
        },
      });
    }
  },
});
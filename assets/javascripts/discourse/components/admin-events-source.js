import Component from "@ember/component";
import Source from "../models/source";
import SourceOptions from "../models/source-options";
import { notEmpty } from "@ember/object/computed";
import Message from "../mixins/message";
import I18n from "I18n";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default Component.extend(Message, {
  dialog: service(),

  hasSources: notEmpty("sources"),
  view: "source",

  @action
  addSource() {
    this.sources.pushObject(
      Source.create({
        id: "new",
        source_options: SourceOptions.create(),
        from_time: moment()
          .subtract(1, "months")
          .add(30, "minutes")
          .startOf("hour"),
        to_time: moment().add(5, "months").add(30, "minutes").startOf("hour"),
      })
    );
  },

  @action
  removeSource(source) {
    if (source.id === "new") {
      this.sources.removeObject(source);
    } else {
      this.dialog.yesNoConfirm({
        message: I18n.t("admin.events.source.remove.confirm", {
          source_name: source.name,
        }),
        didConfirm: () => {
          Source.destroy(source).then(() => {
            this.sources.removeObject(source);
          });
        },
      });
    }
  },
});
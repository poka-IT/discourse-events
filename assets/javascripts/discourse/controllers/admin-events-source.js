import Component from "@ember/component";
import Source from "../models/source";
import SourceOptions from "../models/source-options";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import I18n from "I18n";

export default class AdminEventsSourceComponent extends Component {
  @tracked sources = [];
  @tracked view = "source";
  @tracked flash = null;
  @tracked flashType = null;

  get hasSources() {
    return this.sources.length > 0;
  }

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
  }

  @action
  removeSource(source) {
    if (source.id === "new") {
      this.sources.removeObject(source);
    } else {
      bootbox.confirm(
        I18n.t("admin.events.source.remove.confirm", {
          source_name: source.name,
        }),
        I18n.t("cancel"),
        I18n.t("admin.events.source.remove.label"),
        (result) => {
          if (result) {
            Source.destroy(source).then(() => {
              this.sources.removeObject(source);
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
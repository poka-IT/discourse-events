import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import I18n from "I18n";

export default class EventsHeaderComponent extends Component {
    @tracked view;
    classNames = ["events-header"];

    get title() {
        return I18n.t(`admin.events.${this.args.view}.title`);
    }
}
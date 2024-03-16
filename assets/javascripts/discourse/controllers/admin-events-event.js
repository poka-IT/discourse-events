import Component from "@ember/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import showModal from "discourse/lib/show-modal";
import { A } from "@ember/array";

export default class AdminEventsEventComponent extends Component {
    @tracked events = A();
    @tracked selectedEvents = A();
    @tracked selectAll = false;
    @tracked order = null;
    @tracked asc = null;
    @tracked view = "event";
    @tracked showSelect = false;
    @tracked flash = null;
    @tracked flashType = null;

    get hasEvents() {
        return this.events.length > 0;
    }

    get deleteDisabled() {
        return !this.hasEvents || !this.selectedEvents.length;
    }

    get selectDisabled() {
        return !this.hasEvents;
    }

    @action
    showSelect() {
        this.showSelect = !this.showSelect;

        if (!this.showSelect) {
            this.selectedEvents = A();
            this.selectAll = false;
        }
    }

    @action
    modifySelection(events, checked) {
        if (checked) {
            this.selectedEvents.pushObjects(events);
        } else {
            this.selectedEvents.removeObjects(events);
        }
    }

    @action
    openDelete() {
        const modal = showModal("events-confirm-event-deletion", {
            model: {
                events: this.selectedEvents,
            },
        });

        modal.setProperties({
            onDestroyEvents: (
                destroyedEvents = null,
                destroyedTopicsEvents = null
            ) => {
                if (destroyedEvents) {
                    this.events.removeObjects(destroyedEvents);
                }

                if (destroyedTopicsEvents) {
                    const destroyedTopicsEventIds = destroyedTopicsEvents.map(
                        (e) => e.id
                    );

                    this.events.forEach((event) => {
                        if (destroyedTopicsEventIds.includes(event.id)) {
                            event.topics = null;
                        }
                    });
                }
            },
            onCloseModal: () => {
                this.showSelect();
            },
        });
    }

    @action
    myCloseModalWrapper() {
        this.args.closeModal();
    }
}
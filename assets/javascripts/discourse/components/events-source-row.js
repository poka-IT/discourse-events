import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import Source from "../models/source";
import SourceOptions from "../models/source-options";

const isEqual = function (obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

const SOURCE_OPTIONS = {
  icalendar: [
    {
      name: "uri",
      type: "text",
      default: "",
    },
  ],
  eventbrite: [
    {
      name: "organization_id",
      type: "number",
      default: null,
    },
  ],
  humanitix: [],
  eventzilla: [],
  meetup: [
    {
      name: "group_urlname",
      type: "text",
      default: "",
    },
  ],
};

export default class EventsSourceRowComponent extends Component {
  tagName = "tr";
  classNames = ["events-source-row"];
  attributeBindings = ["source.id:data-source-id"];
  @tracked SourceOptions = [];

  constructor() {
    super(...arguments);
    this.currentSource = JSON.parse(JSON.stringify(this.args.source));
    this.setSourceOptions();
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    this.setMessage("info", "info");
  }

  get sourceChanged() {
    const cs = this.currentSource;
    return (
      cs.name !== this.args.source.name ||
      cs.provider_id !== this.args.source.provider_id ||
      !isEqual(cs.source_options, JSON.parse(JSON.stringify(this.args.source.source_options))) ||
      cs.from_time !== this.args.source.from_time ||
      cs.to_time !== this.args.source.to_time
    );
  }

  get saveDisabled() {
    return !this.sourceChanged || !this.args.source.name || !this.args.source.provider_id || !this.args.source.source_options;
  }

  get saveClass() {
    return this.sourceChanged ? "btn-primary save-source" : "save-source";
  }

  get importClass() {
    return this.importDisabled ? "import-source" : "btn-primary import-source";
  }

  get importDisabled() {
    return this.sourceChanged || this.args.source.id === "new" || this.loading;
  }

  get sourceOptionsMap() {
    return this.sourceOptions.map((opt) => {
      return {
        name: opt.name,
        value: this.args.source.source_options[opt.name],
        type: opt.type,
      };
    });
  }

  resetProvider() {
    this.args.source.setProperties({
      provider_id: null,
      source_options: SourceOptions.create(),
    });
    this.sourceOptions = [];
  }

  setSourceOptions() {
    const providerId = this.args.source.provider_id;
    const providers = this.args.providers;
    const provider = providers.find((p) => p.id === providerId);

    if (!providers || !provider) {
      this.resetProvider();
      return;
    }

    const sourceOptions = SOURCE_OPTIONS[provider.provider_type];
    const currentSourceOptions = this.currentSource.source_options || {};
    const source_options = {};

    sourceOptions.forEach((opt) => {
      source_options[opt.name] = currentSourceOptions[opt.name] || opt.default;
    });

    this.args.source.source_options = SourceOptions.create(source_options);
    this.sourceOptions = sourceOptions;
  }

  @action
  updateProvider(provider_id) {
    this.args.source.provider_id = provider_id;
  }

  @action
  updateSourceOptions(source_options, name, event) {
    source_options.set(name, event.target.value);
  }

  @action
  async saveSource() {
    const source = JSON.parse(JSON.stringify(this.args.source));

    if (!source.name) {
      return;
    }

    this.loading = true;

    try {
      const result = await Source.update(source);

      if (result) {
        this.currentSource = result.source;
        this.args.source = Source.create(
          Object.assign(result.source, {
            source_options: SourceOptions.create(
              result.source.source_options
            ),
          })
        );
      } else if (this.currentSource.id !== "new") {
        this.args.source = JSON.parse(JSON.stringify(this.currentSource));
      }
    } finally {
      this.loading = false;
    }
  }

  @action
  async importSource() {
    this.loading = true;

    try {
      const result = await Source.import(this.args.source);

      if (result.success) {
        this.setMessage("import_started", "success");
      } else {
        this.setMessage("import_failed_to_start", "error");
      }
    } finally {
      this.loading = false;

      setTimeout(() => {
        if (!this.isDestroying && !this.isDestroyed) {
          this.setMessage("info", "info");
        }
      }, 5000);
    }
  }

  @action
  onChangeTimeRange(range) {
    this.args.source.setProperties({
      from_time: range.from,
      to_time: range.to,
    });
  }
}
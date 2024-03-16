import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import Provider from "../models/provider";
import { contentsMap } from "../lib/events";

const TOKEN_TYPES = ["eventbrite", "humanitix", "eventzilla"];
const NO_AUTH_TYPES = ["icalendar"];
const OAUTH2_TYPES = ["meetup"];
const PROVIDER_TYPES = [...NO_AUTH_TYPES, ...TOKEN_TYPES, ...OAUTH2_TYPES];

export default class EventsProviderRowComponent extends Component {
  tagName = "tr";
  classNames = ["events-provider-row"];
  attributeBindings = ["provider.id:data-provider-id"];
  @tracked hideCredentials = true;

  constructor() {
    super(...arguments);
    this.currentProvider = JSON.parse(JSON.stringify(this.args.provider));
  }

  get hasSecretCredentials() {
    return this.showToken || this.showClientCredentials;
  }

  get providerChanged() {
    const cp = this.currentProvider;
    return cp.name !== this.args.provider.name || cp.url !== this.args.provider.url || cp.provider_type !== this.args.provider.provider_type;
  }

  get saveDisabled() {
    return !this.providerChanged;
  }

  get saveClass() {
    return this.providerChanged ? "save-provider btn-primary" : "save-provider";
  }

  get providerTypes() {
    return contentsMap(PROVIDER_TYPES);
  }

  get authenticateDisabled() {
    return !this.canAuthenicate || this.providerChanged || this.args.provider.authenticated;
  }

  get authenticateClass() {
    return this.authenticateDisabled ? "" : "btn-primary";
  }

  get canAuthenicate() {
    return this.args.provider.provider_type && OAUTH2_TYPES.includes(this.args.provider.provider_type);
  }

  get showToken() {
    return this.args.provider.provider_type && TOKEN_TYPES.includes(this.args.provider.provider_type);
  }

  get showNoAuth() {
    return !this.args.provider.provider_type || NO_AUTH_TYPES.includes(this.args.provider.provider_type);
  }

  get showClientCredentials() {
    return this.args.provider.provider_type && OAUTH2_TYPES.includes(this.args.provider.provider_type);
  }

  @action
  toggleHideCredentials() {
    this.hideCredentials = !this.hideCredentials;
  }

  @action
  async saveProvider() {
    const provider = JSON.parse(JSON.stringify(this.args.provider));

    if (!provider.name) {
      return;
    }

    this.saving = true;

    try {
      const result = await Provider.update(provider);

      if (result) {
        this.currentProvider = result.provider;
        this.args.provider = Provider.create(result.provider);
      } else if (this.currentSource.id !== "new") {
        this.args.provider = JSON.parse(JSON.stringify(this.currentProvider));
      }
    } finally {
      this.saving = false;
    }
  }

  @action
  authenticateProvider() {
    window.location.href = `/admin/events/provider/${this.args.provider.id}/authorize`;
  }
}
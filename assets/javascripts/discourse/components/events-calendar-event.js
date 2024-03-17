import DiscourseURL from "discourse/lib/url";
import Component from "@ember/component";

export default Component.extend({
  tagName: "li",

  selectEvent(url) {
    const responsive = this.get("responsive");
    if (responsive) {
      DiscourseURL.routeTo(url);
    } else {
      this.toggleProperty("showEventCard");
    }
  }
});

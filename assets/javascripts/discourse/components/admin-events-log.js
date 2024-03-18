import Component from "@ember/component";
import { notEmpty } from "@ember/object/computed";
import Message from "../mixins/message";

export default Component.extend(Message, {
  hasLogs: notEmpty("logs"),
  order: null,
  asc: null,
  view: "log",
});
const command_en = require("./en/command.json");
const component_en = require("./en/component.json");
const system_en = require("./en/system.json");
const command_fr = require("./fr/command.json");
const component_fr = require("./fr/component.json");
const system_fr = require("./fr/system.json");

const resources = {
  en: {
    system: system_en,
    command: command_en,
    component: component_en,
  },
  fr: {
    system: system_fr,
    command: command_fr,
    component: component_fr,
  },
};

module.exports = resources;

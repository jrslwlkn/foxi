import React, { Component } from "react";
import browser from "webextension-polyfill";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import { initSettings, getAllSettings, resetAllSettings, exportSettings, importSettings, handleSettingsChange } from "src/settings/settings";
import defaultSettings from "src/settings/defaultSettings";
import CategoryContainer from "./CategoryContainer";

export default class SettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInit: false,
      currentValues: {}
    };
    this.init();
  }

  async init() {
    await initSettings();
    overWriteLogLevel();
    updateLogLevel();
    this.setState({ isInit: true, currentValues: getAllSettings() });
    browser.storage.onChanged.addListener(changes => {
      const newSettings = handleSettingsChange(changes);
      if (newSettings) this.setState({ currentValues: newSettings });
    });
  }

  render() {
    const { isInit, currentValues } = this.state;
    const settingsContent = (
      <ul>
        {defaultSettings.map((category, index) => (
          <CategoryContainer {...category} key={index} currentValues={currentValues} />
        ))}
        <CategoryContainer {...additionalCategory} currentValues={currentValues} />
      </ul>
    );

    return (
        <div>
            <p className="contentTitle">{browser.i18n.getMessage("settingsLabel")}</p>
            <hr />
            {isInit ? settingsContent : ""}
            <div className="bottomContainer">
                <a href="https://github.com/jrslwlkn/foxi" className="bottomLink">
                    Foxi
                </a>{" "}
                is Anki-enabled fork of{" "}
                <a href="https://github.com/sienori/simple-translate" className="bottomLink">
                    Foxi
                </a>
                .
            </div>
        </div>
    );
  }
}

const additionalCategory = {
  category: "",
  elements: [
    {
      id: "importSettings",
      title: "importSettingsLabel",
      captions: ["importSettingsCaptionLabel"],
      type: "file",
      accept: ".json",
      value: "importButtonLabel",
      onChange: importSettings
    },
    {
      id: "exportSettings",
      title: "exportSettingsLabel",
      captions: ["exportSettingsCaptionLabel"],
      type: "button",
      value: "exportButtonLabel",
      onClick: async () => {
        await exportSettings();
      }
    },
    {
      id: "resetSettings",
      title: "resetSettingsLabel",
      captions: ["resetSettingsCaptionLabel"],
      type: "button",
      value: "resetSettingsButtonLabel",
      onClick: async () => {
        await resetAllSettings();
        location.reload(true);
      }
    }
  ]
};

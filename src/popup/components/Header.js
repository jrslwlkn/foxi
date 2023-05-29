import React, { useState } from "react";
import browser from "webextension-polyfill";
import openUrl from "src/common/openUrl";
import SettingsIcon from "../icons/settings.svg";
import Toggle from "react-toggle";
import "react-toggle/style.css";
import "../styles/Header.scss";

const openSettings = () => {
    const url = "../options/index.html#settings";
    openUrl(url);
};

const getToggleButtonTitle = (isEnabled) => {
    return isEnabled
        ? browser.i18n.getMessage("disableOnThisPage")
        : browser.i18n.getMessage("enableOnThisPage");
};

export default (props) => (
    <div id="header">
        <div className="title">Foxi: Translate + Anki</div>
        <div className="rightButtons">
            <div className="toggleButton" title={getToggleButtonTitle(props.isEnabledOnPage)}>
                <Toggle
                    checked={props.isEnabledOnPage}
                    onChange={props.toggleEnabledOnPage}
                    icons={false}
                    disabled={!props.isConnected}
                />
            </div>
            <button className="ankiButton" onClick={props.addNote} title="Add to Anki">
                A+
            </button>
            <button
                className={"settingsButton"}
                onClick={openSettings}
                title={browser.i18n.getMessage("settingsLabel")}
            >
                <SettingsIcon />
            </button>
        </div>
    </div>
);

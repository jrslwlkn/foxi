import React, { Component } from "react";
import browser from "webextension-polyfill";
import openUrl from "src/common/openUrl";
import "../styles/Footer.scss";
import { getSettings, setSettings } from "../../settings/settings";

export default class Footer extends Component {
    constructor(props) {
        super(props);
    }

    handleLinkClick = async () => {
        const { tabUrl, targetLang } = this.props;
        const encodedUrl = encodeURIComponent(tabUrl);
        const translateUrl = `https://translate.google.com/translate?hl=${targetLang}&tl=${targetLang}&sl=auto&u=${encodedUrl}`;
        const isCurrentTab = getSettings("pageTranslationOpenTo") === "currentTab";
        openUrl(translateUrl, isCurrentTab);
    };

    handleChange = (e) => {
        const lang = e.target.value;
        this.props.handleLangChange(lang);
        setSettings("targetLang", lang);
    };

    handleDeckSelect = (deck) => {
        this.props.handleSelect("selectedDeck", deck);
        setSettings("deckName", deck);
    };

    handleModelSelect = (model) => {
        this.props.handleSelect("selectedModel", model);
        setSettings("modelName", model);
    };

    render() {
        const { tabUrl, targetDeck, targetModel, targetLang, langHistory, langList, decks, models } = this.props;

        return (
            <div id="footer">
                <div className="translateLink">
                    {tabUrl && (
                        <a onClick={this.handleLinkClick}>{browser.i18n.getMessage("showLink")}</a>
                    )}
                </div>
                <div className="selectWrap">
                    <select
                        style={{ margin: "10px 0" }}
                        onChange={(e) => this.handleDeckSelect(e.target.value)}
                        value={targetDeck}
                    >
                        <optgroup label="Anki Decks">
                            {decks.map((d) => (
                                <option value={d} key={d}>
                                    {d}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                    <select
                        style={{ margin: "10px 0" }}
                        onChange={(e) => this.handleModelSelect(e.target.value)}
                        value={targetModel}
                    >
                        <optgroup label="Anki Card Models">
                            {models.map((d) => (
                                <option value={d} key={d}>
                                    {d}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                </div>
                <div className="selectWrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: "whitesmoke" }}>
                        Target language:
                    </div>
                    <select
                        id="langList"
                        value={targetLang}
                        onChange={this.handleChange}
                        title={browser.i18n.getMessage("targetLangLabel")}
                    >
                        <optgroup label={browser.i18n.getMessage("recentLangLabel")}>
                            {langList
                                .filter((option) => langHistory.includes(option.value))
                                .map((option) => (
                                    <option value={option.value} key={option.value}>
                                        {option.name}
                                    </option>
                                ))}
                        </optgroup>
                        <optgroup label={browser.i18n.getMessage("allLangLabel")}>
                            {langList.map((option) => (
                                <option value={option.value} key={option.value}>
                                    {option.name}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                </div>
            </div>
        );
    }
}

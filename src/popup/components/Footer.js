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

    handleTargetLangChange = (e) => {
        const lang = e.target.value;
        this.props.handleLangChange(lang);
        this.props.setTargetLang(lang);
        setSettings("targetLang", lang);
    };

    handleSourceLangChange = (e) => {
        const lang = e.target.value;
        this.props.setSourceLang(lang);
    }

    handleDeckSelect = (deck) => {
        this.props.handleSelect("selectedDeck", deck);
        setSettings("deckName", deck);
    };

    handleModelSelect = (model) => {
        this.props.handleSelect("selectedModel", model);
        setSettings("modelName", model);
    };

    render() {
        const { tabUrl, targetDeck, targetModel, sourceLang, targetLang, langHistory, langList, decks, models } = this.props;

        return (
            <div id="footer">
                <div className="translateLink">
                    {tabUrl && (
                        <a onClick={this.handleLinkClick}>{browser.i18n.getMessage("showLink")}</a>
                    )}
                </div>
                <div className="selectWrap" style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{width: "50%", marginRight: "3px"}}>
                        <div style={{ color: "whitesmoke" }}>
                            Deck:
                        </div>
                        <select
                            style={{ marginTop: "5px", width: "100%" }}
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
                    </div>

                    <div style={{width: "50%"}}>
                        <div style={{ color: "whitesmoke" }}>
                            Card:
                        </div>
                        <select
                            style={{ marginTop: "5px", width: "100%" }}
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
                </div>

                <br/>

                <div className="selectWrap" style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{width: "50%", marginRight: "3px"}}>
                        <div style={{ color: "whitesmoke" }}>
                            Source language:
                        </div>
                        <select
                            // id="langList"
                            value={sourceLang}
                            onChange={this.handleSourceLangChange}
                            title={"Source Language"}
                            style={{width: "100%", marginTop: "5px"}}
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
                            {[ {name: "Auto", value: "auto"}, ...langList] 
                                .map((option) => (
                                    <option value={option.value} key={option.value}>
                                        {option.name}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                    
                    <br/>

                    <div style={{width: "50%"}}>                        
                        <div style={{ color: "whitesmoke" }}>
                            Target language:
                        </div>
                        <select
                            id="langList"
                            value={targetLang}
                            onChange={this.handleTargetLangChange}
                            title={"Target Language"}
                            style={{width: "100%", marginTop: "5px"}}
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
            </div>
        );
    }
}

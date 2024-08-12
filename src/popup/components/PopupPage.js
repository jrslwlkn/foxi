import React, { Component } from "react";
import browser from "webextension-polyfill";
import log from "loglevel";
import { initSettings, getSettings, setSettings } from "src/settings/settings";
import { updateLogLevel, overWriteLogLevel } from "src/common/log";
import { addNote, getDecks, getModels } from "../../common/ankiConnect";
import translate from "src/common/translate";
import generateLangOptions from "src/common/generateLangOptions";
import Header from "./Header";
import InputArea from "./InputArea";
import ResultArea from "./ResultArea";
import Footer from "./Footer";
import "../styles/PopupPage.scss";

const logDir = "popup/PopupPage";

const getTabInfo = async () => {
    try {
        const tab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];
        const tabUrl = browser.tabs.sendMessage(tab.id, { message: "getTabUrl" });
        const selectedText = browser.tabs.sendMessage(tab.id, { message: "getSelectedText" });
        const isEnabledOnPage = browser.tabs.sendMessage(tab.id, { message: "getEnabled" });

        const tabInfo = await Promise.all([tabUrl, selectedText, isEnabledOnPage]);
        return {
            isConnected: true,
            url: tabInfo[0],
            selectedText: tabInfo[1],
            isEnabledOnPage: tabInfo[2],
        };
    } catch (e) {
        return { isConnected: false, url: "", selectedText: "", isEnabledOnPage: false };
    }
};

const UILanguage = browser.i18n.getUILanguage();
const rtlLanguage = ["he", "ar"].includes(UILanguage);
const rtlLanguageClassName = rtlLanguage ? "popup-page-rtl-language" : "";

export default class PopupPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            targetLang: "",
            inputText: "",
            resultText: "",
            candidateText: "",
            sourceLang: "",
            isError: false,
            errorMessage: "",
            langList: [],
            tabUrl: "",
            isConnected: true,
            isEnabledOnPage: true,
            langHistory: [],
            decks: [],
            models: [],
            selectedDeck: null,
            selectedModel: null,
        };
        this.isSwitchedSecondLang = false;
        this.init();
    }

    init = async () => {
        await initSettings();
        overWriteLogLevel();
        updateLogLevel();

        this.themeClass = getSettings("theme") + "-theme";
        document.body.classList.add(this.themeClass);
        const targetLang = getSettings("targetLang");
        const selectedDeck = getSettings("deckName");
        const selectedModel = getSettings("modelName");
        const decks = await getDecks();
        const models = await getModels();
        let langHistory = getSettings("langHistory");
        if (!langHistory) {
            const secondLang = getSettings("secondTargetLang");
            langHistory = [targetLang, secondLang];
            setSettings("langHistory", langHistory);
        }
        this.setState({
            decks,
            models,
            selectedDeck: selectedDeck ?? decks[0] ?? null,
            selectedModel: selectedModel ?? models[0] ?? null,
            targetLang,
            langHistory,
            langList: generateLangOptions(getSettings("translationApi")),
        });

        const tabInfo = await getTabInfo();
        this.setState({
            isConnected: tabInfo.isConnected,
            inputText: tabInfo.selectedText,
            tabUrl: tabInfo.url,
            isEnabledOnPage: tabInfo.isEnabledOnPage,
        });
        if (tabInfo.selectedText !== "") this.handleInputText(tabInfo.selectedText);

        document.body.style.width = "348px";
    };

    handleInputText = (inputText) => {
        this.setState({ inputText });

        const waitTime = getSettings("waitTime");
        clearTimeout(this.inputTimer);
        this.inputTimer = setTimeout(async () => {
            const result = await this.translateText(inputText, this.state.targetLang);
            this.switchSecondLang(result);
        }, waitTime);
    };

    setSourceLang = (sourceLang) => {
        this.setState({ sourceLang }, () => this.handleInputText(this.state.inputText));
    }

    setTargetLang = (targetLang) => {
        this.setState({ targetLang }, () => this.handleInputText(this.state.inputText));
    }

    setLangHistory = (lang) => {
        let langHistory = getSettings("langHistory") || [];
        langHistory.push(lang);
        if (langHistory.length > 30) langHistory = langHistory.slice(-30);
        setSettings("langHistory", langHistory);
        this.setState({ langHistory: langHistory });
    };

    handleLangChange = (lang) => {
        log.info(logDir, "handleLangChange()", lang);
        this.setState({ targetLang: lang });
        const inputText = this.state.inputText;
        if (inputText !== "") this.translateText(inputText, lang);
        this.setLangHistory(lang);
    };

    translateText = async (text, targetLang) => {
        log.info(logDir, "translateText()", text, this.state.sourceLang, targetLang);
        const result = await translate(text, this.state.sourceLang, targetLang);
        this.setState({
            resultText: result.resultText,
            candidateText: result.candidateText,
            sourceLang: result.sourceLanguage,
            isError: result.isError,
            errorMessage: result.errorMessage,
        });
        return result;
    };

    switchSecondLang = (result) => {
        if (!getSettings("ifChangeSecondLang")) return;

        const defaultTargetLang = getSettings("targetLang");
        const secondLang = getSettings("secondTargetLang");
        if (defaultTargetLang === secondLang) return;

        const equalsSourceAndTarget =
            result.sourceLanguage.split("-")[0] === this.state.targetLang.split("-")[0] &&
            result.percentage > 0;
        const equalsSourceAndDefault =
            result.sourceLanguage.split("-")[0] === defaultTargetLang.split("-")[0] &&
            result.percentage > 0;
        // split("-")[0] : deepLでenとen-USを区別しないために必要

        if (!this.isSwitchedSecondLang) {
            if (equalsSourceAndTarget && equalsSourceAndDefault) {
                log.info(logDir, "=>switchSecondLang()", result, secondLang);
                this.handleLangChange(secondLang);
                this.isSwitchedSecondLang = true;
            }
        } else {
            if (!equalsSourceAndDefault) {
                log.info(logDir, "=>switchSecondLang()", result, defaultTargetLang);
                this.handleLangChange(defaultTargetLang);
                this.isSwitchedSecondLang = false;
            }
        }
    };

    toggleEnabledOnPage = async (e) => {
        const isEnabled = e.target.checked;
        this.setState({ isEnabledOnPage: isEnabled });
        try {
            const tab = (await browser.tabs.query({ currentWindow: true, active: true }))[0];
            if (isEnabled) await browser.tabs.sendMessage(tab.id, { message: "enableExtension" });
            else await browser.tabs.sendMessage(tab.id, { message: "disableExtension" });
        } catch (e) {}
    };

    handleSelect = (key, value) => {
        this.setState({ [key]: value });
    };

    addNote = async () => {
        try {
            const result = await addNote(
                this.state.selectedDeck,
                this.state.selectedModel,
                this.state.inputText,
                this.state.resultText + "<br/>" + this.state.candidateText.split("\n").join("<br/>")
            );
            window.alert(typeof result === "number" ? "Added successfully!" : result);
        } catch (e) {
            window.alert(e.message);
            this.state.setState({ errorMessage: e.message });
        }
    };

    render() {
        return (
            <div className={rtlLanguageClassName}>
                <Header
                    toggleEnabledOnPage={this.toggleEnabledOnPage}
                    isEnabledOnPage={this.state.isEnabledOnPage}
                    isConnected={this.state.isConnected}
                    addNote={this.addNote}
                />
                <InputArea
                    inputText={this.state.inputText}
                    handleInputText={this.handleInputText}
                    sourceLang={this.state.sourceLang}
                />
                <hr />
                <ResultArea
                    inputText={this.state.inputText}
                    targetLang={this.state.targetLang}
                    resultText={this.state.resultText}
                    candidateText={this.state.candidateText}
                    isError={this.state.isError}
                    errorMessage={this.state.errorMessage}
                />
                <Footer
                    tabUrl={this.state.tabUrl}
                    sourceLang={this.state.sourceLang}
                    setSourceLang={this.setSourceLang}
                    targetLang={this.state.targetLang}
                    setTargetLang={this.setTargetLang}
                    langHistory={this.state.langHistory}
                    handleLangChange={this.handleLangChange}
                    langList={this.state.langList}
                    decks={this.state.decks}
                    models={this.state.models}
                    handleSelect={this.handleSelect}
                    targetDeck={this.state.selectedDeck}
                    targetModel={this.state.selectedModel}
                />
            </div>
        );
    }
}

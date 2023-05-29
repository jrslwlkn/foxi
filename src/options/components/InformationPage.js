import React, { useState, useEffect } from "react";
import browser from "webextension-polyfill";
import browserInfo from "browser-info";
import queryString from "query-string";
import OptionsContainer from "./OptionContainer";
import manifest from "src/manifest-chrome.json";

export default (props) => {
    const query = queryString.parse(props.location.search);
    const extensionVersion = manifest.version;

    const [sponsorsHeihgt, setSponsorsHeight] = useState();

    useEffect(() => {
        const setHeight = (e) => {
            if (e.data[0] !== "setSponsorsHeight") return;
            setSponsorsHeight(e.data[1]);
        };
        window.addEventListener("message", setHeight);
        return () => window.removeEventListener("message", setHeight);
    });

    return (
        <div>
            <p className="contentTitle">{browser.i18n.getMessage("informationLabel")}</p>
            <hr />
            <OptionsContainer
                title={"extName"}
                captions={[]}
                type={"none"}
                updated={query.action === "updated"}
                extraCaption={
                    <p className="caption">
                        <a
                            href="https://github.com/sienori/simple-translate/releases"
                            target="_blank"
                        >
                            Version {extensionVersion}
                        </a>
                        <span>　</span>
                        <a
                            href="https://github.com/sienori/simple-translate/blob/master/BACKERS.md"
                            target="_blank"
                        >
                            {browser.i18n.getMessage("backersLabel")}
                        </a>
                    </p>
                }
            />

            <OptionsContainer
                title={""}
                captions={[]}
                type={"none"}
                extraCaption={
                    <div>
                        <p>
                            {browserInfo().name === "Chrome" ? (
                                <a href={chromeExtensionUrl} target="_blank">
                                    {browser.i18n.getMessage("extensionPageLabel")}
                                </a>
                            ) : (
                                <a href={firefoxAddonUrl} target="_blank">
                                    {browser.i18n.getMessage("addonPageLabel")}
                                </a>
                            )}
                            <span>　</span>
                            <a href="https://github.com/sienori/simple-translate" target="_blank">
                                GitHub
                            </a>
                            <span>　</span>
                            <a
                                href="https://simple-translate.sienori.com/privacy-policy"
                                target="_blank"
                            >
                                {browser.i18n.getMessage("privacyPolicyLabel")}
                            </a>
                        </p>
                    </div>
                }
            />
        </div>
    );
};

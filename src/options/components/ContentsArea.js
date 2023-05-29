import React from "react";
import { Route, Switch } from "react-router-dom";
import browserInfo from "browser-info";
import SettingsPage from "./SettingsPage";
import KeyboardShortcutsPage from "./KeyboardShortcutsPage";
import "../styles/ContentsArea.scss";

const isValidShortcuts = browserInfo().name == "Firefox" && browserInfo().version >= 60;

export default () => (
    <div className="contentsArea">
        <Switch>
            <Route path="/settings" component={SettingsPage} />
            {isValidShortcuts && <Route path="/shortcuts" component={KeyboardShortcutsPage} />}
            <Route component={SettingsPage} />
        </Switch>
    </div>
);

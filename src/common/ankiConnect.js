function ankiConnectInvoke(action, version, params = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("error", () => reject("failed to connect to AnkiConnect"));
        xhr.addEventListener("load", () => {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.error) {
                    throw response.error;
                } else {
                    if (response.hasOwnProperty("result")) {
                        resolve(response.result);
                    } else {
                        reject("failed to get results from AnkiConnect");
                    }
                }
            } catch (e) {
                reject(e);
            }
        });

        xhr.open("POST", "http://127.0.0.1:8765");
        xhr.send(JSON.stringify({ action, version, params }));
    });
}

export async function getDecks() {
    try {
        return await ankiConnectInvoke("deckNames", 5);
    } catch (e) {
        console.error(`error getting decks: ${e}`);
        return [];
    }
}

export async function getModels() {
    try {
        return await ankiConnectInvoke("modelNames", 5);
    } catch (e) {
        console.error(`error getting available anki models: ${e}`);
        return [];
    }
}


export async function addNote(deckName, modelName, Front, Back, tags = []) {
    const params = {
        note: {
            deckName,
            modelName,
            fields: {
                Front,
                Back,
            },
            tags,
        },
    };
    try {
        return await ankiConnectInvoke("addNote", 5, params);
    } catch (e) {
        return e;
    }
}

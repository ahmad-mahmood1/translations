import fs from "fs/promises";
import _ from "lodash";
import { translator } from "./deepLInstance.js";

async function getTokenTranslation(tokens, targetLocales) {
  try {
    const obj = {};

    let promiseArray = [];

    targetLocales.forEach((locale) => {
      const translationPromises = tokens.map(async (token) => {
        const result = await translator.translateText(token, "en", locale, {
          context:
            "Different houses put forth their catalog of items on which users can bid. Each catalog has lots in them. Users can view how many bids have been placed on a lot or if the catalog is about to close or is accepting bids. The house can accept bids within a certain time period or can extend the auction duration.",
        });

        _.set(obj, [locale, token], result.text);
      });

      promiseArray = promiseArray.concat(translationPromises);
    });

    console.log("===  promiseArray:", promiseArray);

    await Promise.all(promiseArray);

    return obj;
  } catch (e) {
    console.log("Error generating translation: ", e);
  }
}

async function generateLocalesObjectForToken(targetLocales) {
  try {
    const { argv } = process;
    const [arg1, arg2, ...tokens] = argv;
    const translatedTokensObject = await getTokenTranslation(
      tokens,
      targetLocales
    );

    const newTranslations = JSON.stringify(translatedTokensObject, null, 2); // Pretty-printed output

    await fs.writeFile("translated/singleToken.json", newTranslations, "utf8");
  } catch (error) {
    console.error("Error reading or writing JSON files:", error);
    throw error; // Re-throw the error for further handling if needed
  }
}

(async () => {
  try {
    const targetLocales = [
      "en-GB",
      "de",
      "es",
      "fr",
      "ja",
      "nl",
      "pl",
      "pt-PT",
      "ru",
      "zh",
      // "zh-tw",
    ];

    generateLocalesObjectForToken(targetLocales);
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();

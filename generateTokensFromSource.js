import fs from "fs/promises";
import _ from "lodash";
import { translator } from "./deepLInstance.js";

async function generateTranslatedTokensObject(pathHashArray, targetLocale) {
  try {
    const translatedTokensObject = {};
    const promiseArray = pathHashArray.map(async ([pathArr, targetValue]) => {
      const result = await translator.translateText(
        targetValue,
        "en",
        targetLocale,
        {
          context:
            "Different houses put forth their catalog of items on which users can bid. Each catalog has lots in them. Users can view how many bids have been placed on a lot or if the catalog is about to close or is accepting bids. The house can accept bids within a certain time period or can extend the auction duration.",
        }
      );

      _.set(translatedTokensObject, pathArr, result.text);
    });

    await Promise.all(promiseArray);

    return translatedTokensObject;
  } catch (e) {
    console.log("Error generating translation tokens object: ", e);
  }
}

function generateObjectKeyValueHashArray(targetObject) {
  const result = [];
  const overrideTranslations = {
    left: "remaining",
  };

  const handleNestedObject = (target, path) => {
    if (typeof target === "object" && target !== null) {
      for (const [key, value] of Object.entries(target)) {
        handleNestedObject(value, path.concat([key]));
      }
    } else if (typeof target === "string") {
      const targetToken = _.get(overrideTranslations, target, target);

      result.push([path, targetToken]);
    }
  };

  handleNestedObject(targetObject, []);

  return result;
}

async function getTranslationsAndWriteJSON(
  objectPathHashArray,
  outputPath,
  targetLocale
) {
  try {
    const translatedTokensObject = await generateTranslatedTokensObject(
      objectPathHashArray,
      targetLocale
    );

    const newTranslations = JSON.stringify(translatedTokensObject, null, 2); // Pretty-printed output

    await fs.writeFile(outputPath, newTranslations, "utf8");

    console.log(`Successfully wrote translated tokens to ${outputPath}`);
  } catch (error) {
    console.error("Error reading or writing JSON files:", error);
    throw error; // Re-throw the error for further handling if needed
  }
}

(async () => {
  try {
    const targetLocales = {
      "en-GB": "en/gb",
      de: "de",
      es: "es",
      fr: "fr",
      ja: "ja",
      nl: "nl",
      pl: "pl",
      "pt-PT": "pt",
      ru: "ru",
      zh: "zh",
    };

    const data = await fs.readFile("source.json", "utf8");
    const jsonData = JSON.parse(data);

    if (typeof jsonData !== "object" || jsonData === null) {
      throw new Error("Invalid JSON format in file");
    }

    const pathHashArray = generateObjectKeyValueHashArray(jsonData);

    Object.entries(targetLocales).forEach(([key, value]) => {
      getTranslationsAndWriteJSON(
        pathHashArray,
        `locales/${value}/common.json`,
        key
      );
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();

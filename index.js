import * as deepl from "deepl-node";
import fs from "fs/promises";
import _ from "lodash";

const authKey = "001eeea5-a19a-4d8d-8c1d-4666fc626d86:fx";
const translator = new deepl.Translator(authKey);

async function generateTranslatedTokensObject(pathHashArray, targetLocale) {
  try {
    const translatedTokensObject = {};

    const promiseArray = pathHashArray.map(async ([pathArr, targetValue]) => {
      const result = await translator.translateText(
        targetValue,
        "en",
        targetLocale
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

  const handleNestedObject = (target, path) => {
    if (typeof target === "object" && target !== null) {
      for (const [key, value] of Object.entries(target)) {
        handleNestedObject(value, path.concat([key]));
      }
    } else if (typeof target === "string") {
      result.push([path, target]);
    }
  };

  handleNestedObject(targetObject, []);

  return result;
}

async function readSourceAndGenerateTranslationJSON(
  filePath,
  outputPath,
  targetLocale
) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);

    if (typeof jsonData !== "object" || jsonData === null) {
      throw new Error("Invalid JSON format in file");
    }

    const pathHashArray = generateObjectKeyValueHashArray(jsonData);

    const translatedTokensObject = await generateTranslatedTokensObject(
      pathHashArray,
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

    targetLocales.forEach((targetLocale) => {
      readSourceAndGenerateTranslationJSON(
        `source.json`,
        `translated/${targetLocale}.json`,
        targetLocale
      );
    });
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();

import * as deepl from "deepl-node";
import { config } from "dotenv";

config();

const authKey = process.env.DEEPL_AUTH_KEY;
const translator = new deepl.Translator(authKey);

export { translator };

import { registerBlockType } from "@wordpress/blocks";

import "./editor.scss";
import "./style.scss";

import metadata from "./block.json";

import Edit from "./edit";
import Save from "./save";

registerBlockType(metadata.name, {
    edit: Edit,
    save: Save,
});
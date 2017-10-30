namespace WGo {
    export function sgf_escape(text) {
        if (typeof text == "string") {
            return text.replace(/\\/g, "\\\\").replace(/]/g, "\\]");
        }

        return text;
    }
}
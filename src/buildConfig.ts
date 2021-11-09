import { ColorThemeSelection, BuildConfig, ColorTheme } from "../deps.ts";

export default <BuildConfig>{
  sources: {
    monokai: "https://raw.githubusercontent.com/microsoft/vscode/main/extensions/theme-monokai/themes/monokai-color-theme.json",
    dark: "https://raw.githubusercontent.com/microsoft/vscode/main/extensions/theme-defaults/themes/dark_vs.json",
    custom: <ColorTheme>{
      type: "dark",
      colors: {
        "editor.lineHighlightBackground": "#3c3c3c"
      },
      tokenColors: [
        {
          "name": "Class name",
          "scope": "entity.name.type, entity.name.class, entity.name.namespace, entity.name.scope-resolution",
          "settings":
          {
            "fontStyle": "italic",
            "foreground": "#66D9EF"
          }
        },
        {
          "name": "Library class/type",
          "scope": "support.type, support.class",
          "settings":
          {
            "fontStyle": "italic",
            "foreground": "#66D9EF"
          }
        },
      ],
      semanticHighlighting: true
    }
  },
  combine: [
    "custom.type",
    "monokai.colors",
    "dark.colors",
    "custom.colors",
    "monokai.tokenColors",
    "custom.tokenColors",
    "custom.semanticHighlighting"
  ],
  remove: <Record<keyof ColorTheme, string[]>>{
    colors: [
      "statusBar.background",
      "statusBar.noFolderBackground",
      "statusBar.debuggingBackground",
      "activityBar.background",
      "activityBar.foreground",
      "sideBar.background"
    ],
    // removes object from array by the name property
    tokenColors: [
      'Variable'
    ],
  },
  greyify: <ColorThemeSelection>{
      keys: [
        "^(?!colors\.(?:terminal|diffEditor|inputValidation)\.).*?$", // Dont change any colors for terminal, diffEditor, or inputValidation keys
        "^(?!tokenColors\.).*?$" // Dont touch tokenColors
      ],
  }
}
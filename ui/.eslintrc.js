module.exports = {
  "extends": "airbnb",
  "parser": "babel-eslint",
  "plugins": [
      "react",
      "jsx-a11y",
      "import"
  ],
  "rules": {
      "semi": [2, "never"],
      "linebreak-style": ["off"],
      "react/jsx-filename-extension": ["off"],
      "react/jsx-one-expression-per-line": ["off"],
      "react/prop-types": ["off"],
      "no-console": ["off"],
      "jsx-a11y/click-events-have-key-events": ["off"],
      "jsx-a11y/no-static-element-interactions": ["off"],
  },
}

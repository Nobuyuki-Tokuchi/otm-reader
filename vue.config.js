module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
    outputDir: "otm-reader",

    transpileDependencies: [
      'vuetify'
    ]
};
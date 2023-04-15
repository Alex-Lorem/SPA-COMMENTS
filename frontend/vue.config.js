
const { defineConfig } = require('@vue/cli-service')

const proxy = {
  // "": {
  //   target: "https://cliqu3.b4a.app/",
  //   secure: false,
  //   changeOrigin: true,
  // },
}
module.exports = defineConfig({
  transpileDependencies: true,
  // filenameHashing: false,
  productionSourceMap: false,
  configureWebpack: () => {
    return {
      devServer: {
        proxy
      },
    }
  },
  publicPath: '/',
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/assets/scss/variables.scss";
          @import "@/assets/scss/mixins.scss";
        `
      }
    }
  }
})

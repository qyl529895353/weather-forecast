const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,

  devServer: {
    proxy: {
      '/adminapi':{
        target:"http://127.0.0.1:5000",
        pathRewrite:{
          '^/adminapi':'/adminapi'
        }
      }
    }
  }
})

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'
import Vuex from 'vuex'
import {currency} from './util/currency'
Vue.config.productionTip = false

import './assets/css/base.css'
import './assets/css/checkout.css'
import './assets/css/product.css'

Vue.use(Vuex);
Vue.use(infiniteScroll);
Vue.use(VueLazyLoad,{
  loading:"/static/loading-svg/loading-bars.svg",
  try: 3 // default 1
});
Vue.filter('currency',currency);

const store =new Vuex.Store({
   state:{
     nickName:'',
     cartCount:0
   },
   //s不能掉
   mutations:{
     updateUserInfo(state,nickName){
       state.nickName=nickName;
     },
     updateCartCount(state,cartCount){
       state.cartCount+=cartCount;
     },
     initCartCount(state,cartCount){
       state.cartCount=cartCount;
     }
   }
});
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

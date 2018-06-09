import Vue  from 'vue';
import App from '@/App';

//console.log(`process.env.NODE_ENV===`,process.env.NODE_ENV);

export default new Vue({
  el:'#app',
  render: h => h(App)
})  
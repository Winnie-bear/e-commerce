<template>
  <div>
    <!-- 自定义标签不能大写 ，需要转化格式-->
    <nav-header></nav-header>
    <nav-bread>
      <span>Goods</span>
    </nav-bread>
       <div class="accessory-result-page accessory-page">
        <div class="container">
          <div class="filter-nav">
            <span class="sortby">Sort by:</span>
            <a href="javascript:void(0)" class="default cur">Default</a>
            <a href="javascript:void(0)" class="price" v-bind:class="{'sort-up':sortFlag}" @click="sortGoods()">Price <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a>
            <!-- @click.stop阻止事件冒泡 -->
            <a href="javascript:void(0)" class="filterby stopPop" @click.stop="showFilterPop">Filter by</a>
          </div>
          <div class="accessory-result">
            <!-- filter -->
            <!--  v-bind:class动态控制样式-->
            <div class="filter stopPop" id="filter" v-bind:class="{'filterby-show':filterBy}">
              <dl class="filter-price">
                <dt>Price:</dt>
                <dd><a href="javascript:void(0)" v-bind:class="{'cur':priceRange=='all'}" @click="setPriceFilter('all')">All</a></dd>
                <dd v-for="(price,index) in priceFilter">
                  <a href="javascript:void(0)"  v-bind:class="{'cur':priceRange==index}" @click="setPriceFilter(index)">{{price.startPrice}} - {{price.endPrice}}</a>
                </dd>
              </dl>
            </div>

            <!-- search result accessories list -->
            <div class="accessory-list-wrap">
              <div class="accessory-list col-4">
                <ul>
                  <li v-for="(item,index) in goodsList" :key='item.productId'>
                    <div class="pic">
                      <!-- 使用vue指令以后""里面的是变量，使用字符串要加上'' -->
                      <a href="#"><img v-lazy="'static/'+item.productImage" alt=""></a>
                    </div>
                    <div class="main">
                      <div class="name">{{item.productName}}</div>
                      <div class="price">{{item.salePrice | currency}}</div>
                      <div class="btn-area">
                        <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="view-more-normal"
                   v-infinite-scroll="loadMore"
                   infinite-scroll-disabled="busy"
                   infinite-scroll-distance="20">
                <img src="./../assets/loading-spinning-bubbles.svg" v-show="loading">
              </div>
            </div>
          </div>
        </div>
      </div>
      <modal v-bind:mdShow="mdShow" v-on:close="closeModal">
          <p slot="message">
             请先登录,否则无法加入到购物车中!
          </p>
          <div slot="btnGroup">
              <a class="btn btn--m" href="javascript:;" @click="mdShow = false">关闭</a>
          </div>
      </modal>
      <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
        <p slot="message">
          <svg class="icon-status-ok">
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
          </svg>
          <span>加入购物车成功!</span>
        </p>
        <div slot="btnGroup">
          <a class="btn btn--m" href="javascript:;" @click="mdShowCart = false">继续购物</a>
          <router-link class="btn btn--m btn--red" href="javascript:;" to="/cart">查看购物车</router-link>
        </div>
      </modal>
      <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>
      <nav-footer></nav-footer>
  </div>
</template>

<script>
import NavHeader from './../components/NavHeader'
import NavFooter from './../components/NavFooter'
import NavBread from './..//components/NavBread'
import Modal from './../components/Modal'
import axios from 'axios'
export default {
  data () {
    return {
      goodsList:[],
      sortFlag:true,
      page:1,
      pageSize:8,
      busy:true,
      loading:false,
      mdShow:false,
      mdShowCart:false,
      priceFilter:[
        {
          startPrice:'0.00',
          endPrice:'100.00'
        },
        {
          startPrice:'100.00',
          endPrice:'500.00'
        },
        {
          startPrice:'500.00',
          endPrice:'1000.00'
        },
         {
          startPrice:'1000.00',
          endPrice:'5000.00'
        }
      ],
      priceRange:'all',
      filterBy:false,
      overLayFlag:false,
    };
  },
  components: {
    NavHeader,
    NavFooter,
    NavBread,
    Modal
  },

  computed: {},

  mounted: function () {
    this.getGoodsList();
  },

  methods: {
    getGoodsList(flag){
      var param={
        page:this.page,
        pageSize:this.pageSize,
        sort:this.sortFlag?1:-1,
        priceLevel:this.priceRange
      }
      this.loading=true;//没有请求到数据之前，显示loading状态
      axios.get('/goods/list',{
        params:param
      }).then((response)=>{
         var res=response.data;
         this.loading=false;//请求到数据，关闭loading状态，将数据渲染到页面
         if(res.status=='0'){
           if(flag)
           {
              this.goodsList=this.goodsList.concat(res.result.list);
              if(res.result.count==0)
              {
                this.busy=true;
              }else{
                this.busy=false;
              }
           }
           else{
              this.goodsList = res.result.list;
              this.busy = false;
           }
         }else{
           this.goodsList=[];
         }
      })
    },
    sortGoods(){
       this.sortFlag=!this.sortFlag;
       this.page=1;
       this.getGoodsList();
    },
    showFilterPop(){
       this.filterBy=true;
       this.overLayFlag=true;
    },
    closePop(){
       this.filterBy=false;
       this.overLayFlag=false;
    },
    //设置价格选择区间
    setPriceFilter(range){
      this.priceRange=range;
      this.page=1;
      this.getGoodsList();
      this.closePop();
    },
    loadMore(){
      this.busy=true;//减少滚动请求
      //分页加载
      setTimeout(()=>{
        this.page++;
        this.getGoodsList(true);
      },500);
    },
    addCart(productId){
      axios.post('/goods/addCart',{
        productId:productId
      }).then((res)=>{
        var res=res.data;//数据在res.data里面
        if(res.status==0){
          this.mdShowCart=true;
          this.$store.commit('updateCartCount',1);
        }else{
          //用户未登录，被登录拦截
          this.mdShow=true;
        }
      })
    },
    closeModal(){
      this.mdShow = false;
      this.mdShowCart = false;
    }
  }
}

</script>
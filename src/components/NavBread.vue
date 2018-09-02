<template>
      <section class="bread">
        <div class="bread-wrap">
            <nav class="">
                <a href="/">
                    Home
                </a>
                <!-- 插槽，每个页面显示的当前页不一样 -->
                <slot></slot>
            </nav>
        </div>
    </section>
</template>
<style>
  .bread{
      height: 45px;
      line-height: 45px;
      background-color: #f0f0f0;
  }
  .bread-wrap{
      padding: 0 10px;
      font-size: 14px;
      color: #a1a1a1;
  }
  .bread-wrap a{
    position: relative;
      margin-right: 20px;
  }
  .bread-wrap a:after{
      position: absolute;
      top: 0px;
      content:'/';
      height:20px;
      line-height: 20px;
  }
  .bread-wrap span{
      color:#d1434a;
  }
</style>
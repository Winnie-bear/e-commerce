<template>
    <div>
      <div class="md-modal modal-msg md-modal-transition" v-bind:class="{'md-show':mdShow}">
        <div class="md-modal-inner">
          <div class="md-top">
            <button class="md-close" @click="closeModal">Close</button>
          </div>
          <div class="md-content">
            <div class="confirm-tips">
              <!-- 提示信息插槽 -->
              <slot name="message"></slot>
            </div>
            <div class="btn-wrap">
              <!-- 按钮插槽 -->
              <slot name="btnGroup"></slot>
            </div>
          </div>
        </div>
      </div>
      <div class="md-overlay" v-if="mdShow" @click="closeModal"></div>
    </div>
</template>
<style>

</style>
<script>
    export default{
        //接收父组件的传值
        props:["mdShow"],
        data(){
            return{
                msg:'hello vue'
            }
        },
        methods:{
          closeModal(){
            //触发父组件的close事件
            this.$emit("close");
          }
        }
    }
</script>

<template>
  <div>
    <div class="addTask">
      <div v-if="!isShow" class='addBox' @click="changeView"></div>
      <edit-box v-else :isShow.sync="isShow" :btnType="'add'" @change="changeView"></edit-box>
    </div>
  </div>
</template>

<script>
import EditBox from '@/components/editBox';

export default {
  components:{
    EditBox,
  },
  data(){
    return{
      isShow: false,
    }
  },
  methods:{
    changeView(){
      this.isShow = !this.isShow ;
      this.$emit('change');
    },
  }
}
</script>

<style lang="sass">
@mixin boxConfig()
  font-family: Roboto-Regular
  font-size: 24px
  color: #C8C8C8
  text-align: left
  
.addTask
  display: flex
  justify-content: center
  padding-top: 2%
  & .addBox
    +boxConfig
    border: 2px solid #C8C8C8
    width: 620px
    height: 65px
    border-radius: 5px
    background-color: #FFF
    cursor: pointer
    &::before
      content: '+'
      padding: 0 20px 0 20px
      font-size: 40px
    &::after
      content: 'Add Task'
      font-size: 30px
</style>

<template>
  <div class='head'>
    <div class='ul'>
      <div id='tasks' @click="changeView('tasks')">My Tasks</div>
      <div id='inProgress' @click="changeView('inProgress')">In Progress</div>
      <div id='completed' @click="changeView('completed')">Completed</div>
    </div>
  </div>
</template>
<script>
export default {
  data(){
    return{
    }
  },
  methods:{
    changeView(name){
      document.querySelectorAll('.ul > div').forEach(item=>item.classList.remove('active'));
      document.getElementById(name).classList.add('active');
      this.$emit('change',name)
    }
  },
  mounted(){
    this.changeView('tasks');
  }
}
</script>
<style lang="sass">
@mixin active
  border-bottom: 5px solid #00408B
  color: white
  
.head
  font-family: 'Roboto-Medium'
  background-color: #4A90E2
  & .active
    +active
  & .ul
    height: 76px
    color: #00408B
    font-size: 24px
    list-style: none
    display: flex
    justify-content: center
    align-items: center
  & .ul > div
    box-sizing: border-box
    text-align: center
    width: 220px
    height: 76px
    padding: 24px 0 24px 0
    transition-delay: 0.1s
    cursor: pointer
  & .ul > div:hover
    color: white
</style>



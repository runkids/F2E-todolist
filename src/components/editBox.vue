<template>
  <div>
    <div class="edit_box">

      <div :class="taskData.important?'bg_title importnat-color':'bg_title'">
        <input class="titleInput" autofocus type="text" placeholder="Type Something Here…" v-model="taskData.title">
        <div class='icon' :style="taskData.important?{'color':'#F5A623'}:''" @click.prevent="taskData.important=!taskData.important">
          <i :class="taskData.important?'fas fa-star':'far fa-star'"></i>
        </div>
        <div class="icon" :class="isShow?'edit':''"><i class="far fa-edit"></i></div>
      </div>
      
      <div class="bg_main">
        <div class="icon"><i class="far fa-calendar-alt"> DeadLine</i></div>
        <div class="dateTime">
          <input type="date" name="bdaytime" v-model="taskData.date">
          <input type="time" v-model="taskData.time"/>
        </div>
        <div class="icon"><i class="far fa-file"> File</i></div>
        <div style="font-size:30px;" class="addFile"><i class="fas fa-plus-square"></i></div>
        <div class="icon"><i class="far fa-comment-dots"> Comment</i></div>
        <textarea v-model="taskData.comment"  cols="50" rows="5"></textarea>
      </div>

      <div class="btns">
        <button class="btn cancelBtn" @click="btnType==='add'?changeView():saveTask()">X Cancel</button>
        <button class="btn addBtn" v-if="btnType==='add'" @click="addTask">+ Add Task</button>
        <button class="btn addBtn" v-else @click="saveTask">+ Save Task</button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  props:{
    index:{
      default: 0,
    },
    isShow:{
      default: true
    },
    taskData:{
      default(){
        return {
          title:'',
          date:'',
          time:'',
          comment:'',
          important: false,
          complete: false,
          state: 'inProgress',
          showEdit: false,
        }
      } 
    },
    btnType:{
      default: 'add'
    }
  },

  data(){
    return {
      dataArr: [],
      dataObj: this.taskData,
    }
  },

  methods:{
    initData(){
      this.dataObj={
        title:'',
        date:'',
        time:'',
        comment:'',
        important: false,
        complete: false,
        showEdit: false,
      }
    },
    addTask(){
      if(!this.dataObj.title) {
        alert('請輸入標題！') 
        return;
      }
      this.dataArr.push(this.dataObj);
      this.initData();
      window.localStorage.setItem('tasks',JSON.stringify(this.dataArr));
      this.changeView();
    },

    changeView(){
      this.$emit('change');
    },
    
    saveTask(){
      if(!this.taskData.title) {
        alert('請輸入標題！') 
        return;
      }
      this.taskData.showEdit=false;
      this.$emit('change',{ taskData: this.taskData, index: this.index });
    }
  },

  mounted(){
    this.dataArr = JSON.parse(window.localStorage.getItem('tasks')) || [];
  }

}
</script>

<style lang="sass">
.edit_box
  background-color: #F2F2F2
  box-shadow: 0 5px 5px 0 #C8C8C8
  border-radius: 5px
  width: 620px
  height: 519px
  position: relative
  & .fa-star
    cursor: pointer
  & .importnat-color
    background-color: #FFF2DC
  & .bg_title
    height: 76px   
    border-bottom: 2px solid #C8C8C8
    display: flex
    justify-content: center
    align-items: center
    & .edit
      color: #4A90E2
      padding-left: 50px
    & .titleInput
      width: 400px
      height: 50px
      font-size: 24px
      border: initial
      background: none
      outline: 0 //移除input的輸入框框

  & .bg_main
    display: flex
    justify-content: center
    flex-direction: column
    padding: 50px
    & .dateTime
      padding-bottom: 40px
    & .addFile
      padding-bottom: 30px
      padding-left: 30px
      cursor: pointer
      color: #C8C8C8

  & .btns
    display: flex
    justify-content: center
    position: absolute
    bottom: 0px
    & .btn
      width: 310px
      height: 60px
      font-size: 24px
      cursor: pointer
    & .cancelBtn
      background-color: #FFF
      color: #D0021B
      border-radius: 0 0 0 5px
    & .addBtn
      background-color: #4A90E2
      color: white
      border-radius: 0 0 5px 0
</style>

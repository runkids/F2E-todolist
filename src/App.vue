<template>
  <div class="main_content">
    <Head @change="e => viewName = e"></Head>

    <add-task-box @change="getData"></add-task-box>

    <div class='inprog_content'>
      <draggable v-model="tasksArr" @end="updateData">
        <div v-for="(taskData,index) in tasksArr" :key="index" class="inprog" v-if="checkView(taskData)">
          <div v-if="!taskData.showEdit" :class="taskData.important?'title importnat':'title'" v-show="!hide">
            <input class='complete_checkbox' type="checkbox" :checked="taskData.complete" @change="changeState(index)">
            <input class="titleInput" type="text" :value="taskData.title" :class="taskData.complete?'complete':''"  readonly>
            <div class='icon' :style="taskData.important?{'color':'#F5A623'}:''" @click.prevent="starClick(index)">
              <i :class="taskData.important?'fas fa-star':'far fa-star'"></i>
            </div>
            <div class="icon edit" @click="taskData.showEdit=true;hide=true"><i class="far fa-edit"></i></div>
            <div class="bottom_date"><i class="far fa-calendar-alt"> {{taskData.date+' '+taskData.time}}</i></div>
            <div class="bottom_comment"><i class="far fa-comment-dots"></i>{{taskData.comment?' 1':' 0'}}</div>
          </div>
          <edit-box class="edit_box" v-else :taskData="taskData" :index="index" :btnType="'edit'" @change="saveEdit"></edit-box>
        </div>
      </draggable>
    </div>
    <span class="task-left">{{getLength}} tasks left</span>

  </div>
</template>
<script>
import draggable from 'vuedraggable'
import Head from '@/components/head';
import AddTaskBox from '@/components/addTaskBox';
import EditBox from '@/components/editBox';

export default {
  components:{
    Head,
    AddTaskBox,
    EditBox,
    draggable,
  },
  data(){
    return{
      hide: false,
      viewName: 'tasks',
      tasksArr:[],
    }
  },

  methods:{
    checkView(item){
      let show;
      switch(this.viewName){
        case 'tasks':
          show = true; break;
        case 'inProgress':
          show = (!item.complete); break;
        case 'completed':
          show = (item.complete); break;
      }
      return show;
    },

    getData(){
       this.tasksArr = JSON.parse(window.localStorage.getItem('tasks'))||[];
    },

    updateData(){
      window.localStorage.setItem('tasks',JSON.stringify(this.tasksArr));
    },

    saveEdit({taskData,index}){
      this.hide=false;
      this.tasksArr[index]=taskData;
      this.updateData();
    },

    starClick(index){
      this.tasksArr[index].important = !this.tasksArr[index].important;
      this.updateData();
    },

    changeState(index){
      this.tasksArr[index].complete = !this.tasksArr[index].complete;
      this.updateData();
    },

  },

  computed:{
    getLength(){
      let length=0;
      if(this.tasksArr.length){
        switch(this.viewName){
          case 'tasks':
            length = this.tasksArr.length; break;
          case 'inProgress':
            length = this.tasksArr.filter(item=> !item.complete ).length; break;
          case 'completed':
            length = this.tasksArr.filter(item=> item.complete ).length; break;
        }
      }
      return length;
    }
  },

  mounted(){
    if(!!window.localStorage.getItem('tasks')){
      this.getData();
    }
  }
}
</script>
<style lang="sass">
* 
  font-family: '微軟正黑體'
html,body
  width: 100%
  height: 100%
  margin: 0
  padding: 0
  background-color: #E1E1E1
  letter-spacing: 1px
  box-sizing: border-box
.icon
  font-size: 24px
.task-left
  font-size: 24px
  color: #C8C8C8
  text-align: center
  padding-left: 30%

.main_content
  & .inprog_content
    padding-top: 5px
    display: flex
    justify-content: center
  & .inprog
    height: 102px   
    width: 622px
    padding-bottom: 5px
    & .bottom_date
      position: absolute
      transform: translateY(30px)
      left: 80px
    & .bottom_comment
      position: absolute
      transform: translateY(30px)
      left: 300px
    & .fa-star
      cursor: pointer
    & .importnat
      background-color: #FFF2DC !important
    & .complete 
      text-decoration: line-through
      color: #9B9B9B !important
    & .title
      height: 100%  
      width: 100%
      border: 2px solid #C8C8C8
      background-color: #F2F2F2
      border-radius: 5px
      display: flex
      justify-content: center
      align-items: center
      position: relative
      &:hover::before
        cursor: move
        content: '::'
        font-size: 20px
        color: #9B9B9B
        position: absolute
        left: 10px
      & .edit
        cursor: pointer
        padding-left: 50px
      & .titleInput
        width: 400px
        height: 50px
        font-size: 24px
        border: initial
        background: none
        outline: 0 //移除input的輸入框框
      & .complete_checkbox
        margin-right: 10px
        width: 30px
        height: 30px
        cursor: pointer
</style>
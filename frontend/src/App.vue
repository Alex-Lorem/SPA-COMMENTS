<template>
  <h1 class="title">What a Wonderful Day!</h1>
  <transition name="fade">
    <div style="color: #fff;" :style="isLogged ? 'opacity: 0;' : 'opacity: 1;'">
      {{ isLogged ? "plug" : "Firstly login to add a comment" }}
    </div>
  </transition>
  <button class="button-add" @click="isLogged ? isFormOpened = true: isFormOpened = false">
    Add a comment
  </button>
  <transition name="fade">
    <action-form v-if="isFormOpened" :reply-to-id="this.replyToId" @submit="replyToId = null"
                 @close="isFormOpened= !isFormOpened"/>
  </transition>
  <transition name="fade">
    <div class="alert-new-message" v-if="alertNewMessage">{{ alertNewMessageText }}</div>
  </transition>
  <div class="comments-container">

    <template v-if="get_comments.length && calculatePage()">
      <template v-for="item in calculatePage()" :key="item.id">
        <comment :item="item" @openForm="replyCommentInfo($event)"/>
      </template>
      <div style="text-align: center;">
          <span class="pagination" :class="currentPagination === index - 1 ? 'pagination-active': ''" v-for="index in paginationLength" :key="index" @click="loadComments(index)">
            {{ index }}
          </span>
      </div>
    </template>
    <template v-else>
      <div class="comments-loader loader"> Please wait
        <div class="clock-loader"></div>
      </div>
    </template>

  </div>
  <button class="button-login" @click="isSignInOpened = !isSignInOpened;" v-if="!isLogged">
    SIGN IN
  </button>
  <transition name="fade">
    <signIn v-if="isSignInOpened" @close="isSignInOpened = !isSignInOpened"/>
  </transition>
  <transition name="fade">
    <cabinet v-if="isLogged"/>
  </transition>

</template>

<script>
import comment from "@/components/comment/comment";
import actionForm from "@/views/actionForm/actionForm"
import signIn from "@/views/signIn/signIn";
import cabinet from "@/views/cabinet/cabinet";
import {mapActions, mapGetters} from "vuex"


export default {
  name: 'App',
  data() {
    return {
      isFormOpened: false,
      isSignInOpened: false,
      isLogged: false,
      replyToId: null,
      alertNewMessage: false,
      alertNewMessageText: "",
      currentPagination: 0
    }
  },
  components: {
    comment,
    actionForm,
    signIn,
    cabinet
  },
  computed: {
    ...mapGetters({
      getError: "account/get_error",
      userData: "account/get_user_data",
      is_logged: "account/is_logged",
      get_comments: "comments/get_all_comments",
      paginationLength: "comments/get_pagination_length"
    }),
  },
  watch: {
    is_logged(value) {
      this.isLogged = value
      if (this.isLogged) {
        this.isSignInOpened = false
      }
    }
  },
  methods: {
    ...mapActions({
      fetchUser: "account/fetchUserData",
      fetchRefresh: "account/refresh",
      fetchComments: "comments/fetchComments",
      fetchPagination: "comments/fetchPagination"
    }),
    replyCommentInfo(e) {
      this.isFormOpened = true
      this.replyToId = e
    },
    calculatePage(){
      for(let comment of this.get_comments){
        if(comment.page === this.currentPagination + 1){
          return comment.data
        }
      }
      return null
    },
    async subscribe() {
      const eventSource = new EventSource('https://spa-comments-backend.onrender.com/api/connect', {
        withCredentials: true
      })
      const handle = (message) => {
        this.alertNewMessageText = message
        this.alertNewMessage = true
        setTimeout(() => {
          this.alertNewMessage = false
          this.alertNewMessageText = ""
        }, 3000)
      }

      eventSource.onmessage = function (event) {
        handle(event.data)
      }


    },
    async loadComments(pagination) {
      this.currentPagination = pagination - 1

      for(let alreadyUploaded of this.get_comments){
        if(alreadyUploaded.page === pagination){
          return;
        }
      }

      await this.fetchComments({page: pagination})

    },
  },

  async created() {
    this.isLogged = this.is_logged

    this.fetchComments({page: 1}).then(()=>{}).catch((e)=> console.log(e))
    this.fetchUser().then(() =>{}).catch((e)=> console.log(e))
    this.fetchPagination().then(()=>{}).catch((e)=> console.log(e))


    await this.subscribe()
  },

}
</script>

<style src="./globals.scss" lang="scss"/>

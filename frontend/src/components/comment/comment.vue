<template>

  <div class="comment" :class="gradation > 1 ? 'gradation-'+ gradation : ''">
    <div class="comment-header">

      <div class="comment-inner">
        <div class="comment-avatar">
          <img src="@/assets/img/anonim.jpg" alt="" v-if="!comment.image">
          <img :src="comment.image" alt="" v-else>
        </div>
        <h4> {{ comment.username ? comment.username : 'Anonim' }}</h4>
        <div class="comment-date">{{ this.date.toLocaleString() }}</div>
        <div class="comment-reply" @click="reply">
          <icon-reply/>
        </div>
        <transition name="fade">
          <div v-if="alertReplyLimit" class="comment-alert-log">too much replies for this comment
            <icon-close @click="alertReplyLimit = !alertReplyLimit"/>
          </div>
        </transition>
        <transition name="fade">
          <div v-if="alertNotLogged" class="comment-alert-log">firstly log in to reply comments
            <icon-close @click="alertNotLogged = !alertNotLogged"/>
          </div>
        </transition>
        <transition name="fade">
          <div v-if="alertGradation" class="comment-alert-log">too much replies for this topic(
            <icon-close @click="alertGradation = !alertGradation"/>
          </div>
        </transition>

      </div>
      <div class="comment-likes-dislikes"
           :class="isLiked ? 'comment-likes-dislikes-active' : '' || isDisliked ? 'comment-likes-dislikes-active' : ''">
        <arrow-top @click="like"/>
        <div @click="like">{{ comment.likes ? comment.likes : 0 }}</div>
        <div @click="dislike">{{ comment.dislikes ? comment.dislikes : 0 }}</div>

        <arrow-down @click="dislike"/>
      </div>
    </div>
    <div class="comment-message" v-html="comment.text">

    </div>

    <template v-if="childs.items && childs.items.length">

      <comment @openForm="this.$emit('openForm', $event)" v-for="(child, index) in childs.items"
               :gradation="child.gradation" :item="child" :key="index"/>

    </template>

  </div>
</template>

<script>

import IconReply from '@/components/icon/reply'
import IconClose from '@/components/icon/close'
import ArrowDown from '@/components/icon/arrow-down'
import ArrowTop from "@/components/icon/arrow-top";
import {mapActions, mapGetters} from "vuex";

export default {
  name: `comment`,
  emits: ['openForm'],
  components: {
    IconReply,
    IconClose,
    ArrowTop,
    ArrowDown
  },
  props: {
    item: {
      type: Object,
      required: true
    },
    gradation: {
      required: false
    },

  },
  data() {
    return {
      date: "",
      comment: {},
      isLiked: false,
      isDisliked: false,
      alertNotLogged: false,
      alertGradation: false,
      alertReplyLimit: false,
      childs: []
    }
  },
  computed: {
    ...mapGetters({
      getError: "account/get_error",
      user: "account/get_user_data",
      isLogged: "account/is_logged",
      get_child_comments: "comments/get_child_comments"
    }),
    watchChilds() {
      return this.get_child_comments({parentId: this.comment.id})
    }
  },
  watch: {
    watchChilds(value) {
      this.childs = value
    },
    isLogged(value) {
      if (!value) {
        this.isLiked = false
        this.isDisliked = false
      }
    },
    user() {
      if (this.user.likes && this.user.likes.includes(this.item.id)) {
        this.isLiked = true
      }
      if (this.user.dislikes && this.user.dislikes.includes(this.item.id)) {
        this.isDisliked = true
      }
    }
  },
  methods: {
    ...mapActions({
      fetchLike: "account/likeOrDislikeComment",
      fetchChilds: "comments/fetchChildComments"
    }),
    async reply() {
      if (!this.isLogged) {
        this.alertNotLogged = true
      } else if (this.gradation > 6) {
        this.alertGradation = true
      } else if (this.comment.parentof && this.comment.parentof.length > 4) {
        this.alertReplyLimit = true
      } else {
        this.$emit('openForm', this.comment.id)
      }
    },
    async like() {
      if (!this.isLogged) {
        this.alertNotLogged = true
      } else {
        if (!this.isLiked) {
          this.isLiked = true
          await this.fetchLike({commentId: this.comment.id, action: true})
          this.comment.likes += 1
          if (this.isDisliked) {
            this.comment.dislikes -= 1
            this.isDisliked = false
          }
        }
      }


    },
    async isParentOf() {

      if (this.comment.parentof && this.comment.parentof.length > 0) {

        await this.fetchChilds({parentId: this.comment.id})

      }
    },
    async dislike() {
      if (!this.isLogged) {
        this.alertNotLogged = true
      } else {
        if (!this.isDisliked) {
          this.isDisliked = true
          await this.fetchLike({commentId: this.comment.id, action: false})
          this.comment.dislikes += 1
          if (this.isLiked) {
            this.comment.likes -= 1
            this.isLiked = false
          }

        }
      }
    },
  },
  async created() {
    this.comment = this.item
    this.date = new Date(this.item.publicationdate)
    await this.isParentOf()
    if (this.user.likes && this.user.likes.includes(this.item.id)) {
      this.isLiked = true
    }
    if (this.user.dislikes && this.user.dislikes.includes(this.item.id)) {
      this.isDisliked = true
    }
  }

}
</script>

<style lang="scss" src="./comment.scss"></style>

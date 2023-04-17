<template>
  <div class="form-container">

    <div class="form">
      <icon-close class="form-close" @click="$emit('close')"/>
      <div class="form-title">
        Write a comment using tags to make your comment prettier
        <br>
        (make sure you close tags)
      </div>
      <div class="tags">
        <div style="margin-bottom: 10px;text-align: left;">Allowed tags(make your text prettier)</div>
        <div v-if="alertTag" style="font-weight: bold;">Only one tag you can use</div>
        <div v-if="tagAalert" style="margin-bottom: 10px;text-align: left;">Only one tag &lt;a&gt; you can use</div>
        <button class="tag" type="button" :disabled="this.tagAalert" @click="addTag('a');toggleColor($event)"> &lt;a&gt;(reference)</button>
        <button class="tag" type="button" @click="addTag('strong');toggleColor($event)"> &lt;strong&gt;(important
          text)
        </button>
        <button class="tag" type="button" @click="addTag('code');toggleColor($event)"> &lt;code&gt;(text
          of code)
        </button>
        <button class="tag" type="button" @click="addTag('i');toggleColor($event)"> &lt;i&gt;(italic
          text)
        </button>
        <button class="tag" type="button" @click="addTag('break');toggleColor()"> &lt;br&gt;(break line)
        </button>
      </div>

      <div>Text:</div>
      <div class="form-textarea-wrapper">
        <textarea class="form-text" v-model="writtenText" @change="observe"  required></textarea>
        <div class="preview-text" v-html="writtenText"></div>
      </div>


      <button class="form-submit" @click="newComment">submit</button>
      <div v-if="commentSuccess"> Added new comment!</div>
      <div v-if="alertEmptyText">Text must to be more than 5 symbols</div>
    </div>


  </div>

</template>

<script>
import IconClose from "@/components/icon/close"
import {mapActions, mapGetters} from "vuex";

export default {
  name: `action-form`,
  components: {
    IconClose
  },
  props: {
    replyToId: {
      type: Number
    }
  },
  data() {
    return {
      focusedTag: "",
      focusedValue: "",
      writtenText: "",
      alertTag: false,
      tagAalert: false,
      commentSuccess: false,
      alertEmptyText: false
    }
  },
  emits: ['close', 'submit'],
  computed: {
    ...mapGetters({
      getError: "account/get_error",
      userData: "account/get_user_data",
      gradation: "comments/get_gradation"
    }),
  },
  methods: {

    ...mapActions({
      fetchNewComment: "comments/createComment",
    }),

    async newComment() {
      if(this.writtenText.length > 5){
        this.alertEmptyText = false
        if (this.writtenText.indexOf('<a>') >= 0 && this.writtenText.lastIndexOf('</a>')) {
          let char1 = this.writtenText.indexOf('<a>') + 3;
          let char2 = this.writtenText.lastIndexOf('</a>');
          const tagA = this.writtenText.substring(char1, char2);
          this.writtenText = this.writtenText.replace('<a>', `<a href="${tagA}">`)
        }

        await this.fetchNewComment({
          author: this.userData.id,
          username: this.userData.username,
          text: this.writtenText,
          image: this.userData.avatar_url ? this.userData.avatar_url : null,
          isMajor: !this.replyToId,
          gradation: this.gradation({parentId: this.replyToId}),
          publicationDate: new Date(),
          parentId: this.replyToId ? this.replyToId : 0

        })

        this.$emit('submit')
        this.commentSuccess = true
        setTimeout(()=>{
          this.$emit('close')
        }, 500)
      } else {
        this.alertEmptyText = true
      }

    },
    toggleColor(event) {
      if(event){
        if (!this.alertTag) {
          event.target.classList.toggle('tag-active')
        }
      }
    },
    observe(char) {
      if (this.focusedTag) {
        this.focusedValue += char.target.value
      }
      if (this.writtenText.lastIndexOf('</a>') > 1) {
        this.tagAalert = true
      } else {
        this.tagAalert = false
      }

    },
    addTag(value) {
      this.alertTag = false

      if (this.focusedTag && value === this.focusedTag) {
        switch (value) {
          case 'a':
            this.writtenText += '</a>'
            this.focusedTag = ""
            break;
          case 'i':
            this.writtenText += '</i>'
            this.focusedTag = ""
            break;
          case 'code':
            this.writtenText += '</code>'
            this.focusedTag = ""
            break;
          case 'strong':
            this.writtenText += '</strong>'
            this.focusedTag = ""
            break;
        }
      } else if (!this.focusedTag) {
        switch (value) {
          case 'a':
            this.focusedTag = 'a'
            this.writtenText = this.writtenText + '<a>'
            break;
          case 'break':
            this.writtenText += '<br>'
            this.focusedTag = ""
            break;
          case 'i':
            this.focusedTag = 'i'
            this.writtenText = this.writtenText + '<i>'
            break;
          case 'strong':
            this.focusedTag = 'strong'
            this.writtenText = this.writtenText + '<strong>'
            break;
          case 'code':
            this.focusedTag = 'code'
            this.writtenText = this.writtenText + '<code>'
            break;
        }
      } else {
        this.alertTag = true
      }

    },

  },


}
</script>

<style src="./actionForm.scss" lang="scss"/>

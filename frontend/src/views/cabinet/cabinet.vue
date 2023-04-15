<template>
  <div class="cabinet-container">
    <template v-if="!loader">
      <div class="cabinet-article">
        You are in account! You can change username which you entered while registered, or avatar!
      </div>
      <div class="cabinet-avatar">avatar:
        <img src="@/assets/img/anonim.jpg" alt="" v-if="!user.avatar_url">
        <img :src="user.avatar_url" alt="" v-else>
      </div>

      <form enctype="multipart/form-data" @submit="submitForm">
        <div class="sigIn-inner">
          <div style="margin-bottom: 5px;">username:</div>
          <input class="form-email" v-model="user.username">
        </div>

        <div class="sigIn-inner">
          change avatar:
          <input type="file" ref="file" @change="onChange($event)" accept=".jpg, .png, .jpeg, .gif">
        </div>
        <div style="color: #751d21" v-if="error"> {{ error.message }}
          <div v-for="item in error.errors" :key="item">
            <span v-if="item.msg">{{ item.msg }}</span>
            <span v-else> {{ item }}</span><br></div>
        </div>
        <div style="display: flex;">
          <button type="submit" class="form-submit" style="margin-top: 20px;margin-right: 10px">update</button>
          <button class="form-submit" style="margin-top: 20px;" type="button" @click="logout">logout</button>
        </div>

      </form>
    </template>
    <template v-else>
      <div class="loader cabinet-loader"> Please wait
        <div class="clock-loader"></div>
      </div>
    </template>
  </div>
</template>

<script>
import {mapActions, mapGetters} from "vuex";


export default {
  name: `cabinet`,
  data() {
    return {
      user: {},
      error: {},
      file: null,
      loader: false
    }
  },
  watch: {
    get_user_data(value) {
      this.user = JSON.parse(JSON.stringify(value))
    },
    get_loader(value) {
      this.loader = value
    }
  },
  methods: {
    onChange(e) {
      this.file = e.target.files[0]
    },
    async submitForm(e) {
      e.preventDefault()
      let data = new FormData()

      data.append('file', this.file)
      data.append('username', this.user.username === this.get_user_data.username ? '' : this.user.username)
      data.append('userId', this.user.id)

      if (data.getAll('file')[0].size !== 0 && data.getAll('file')[0].size > 1024000) {
        this.error.message = "Bad Request"
        this.error.errors = ["Image must be less than 1 mb"]
      } else {
        await this.fetchUpdate({updatedData: data})
        this.error = this.get_error
      }

    },
    ...mapActions({
      fetchLogout: "account/logout",
      fetchUpdate: "account/updateUserData",
      fetchUserData: "account/fetchUserData"
    }),
    async logout() {
      this.loader = true
      await this.fetchLogout()
    },
  },
  computed: {
    ...mapGetters({
      get_user_data: "account/get_user_data",
      get_error: "account/get_error",
      get_loader: "account/get_loader"
    }),
  },
  async created() {
    this.user = JSON.parse(JSON.stringify(this.get_user_data))

    if (!this.get_user_data.id) {
      await this.fetchUserData()
    }

  }
}
</script>

<style lang="scss" src="./cabinet.scss">

</style>

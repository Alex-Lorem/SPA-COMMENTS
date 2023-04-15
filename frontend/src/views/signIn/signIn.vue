<template>
  <div class="signIn-container">
    <template v-if="!loader">


    <form action="" class="signIn-form">

      <icon-close class="form-close close-white"  @click="$emit('close')"/>
      <div class="sigIn-inner">
          <div class="error" v-if="this.error">
            {{this.error.message}}<br>
            <div v-if="this.error.errors && this.error.errors.length">
              {{this.error.errors[0].msg}}
            </div>
          </div>

          <div>
            <div style="margin-bottom: 5px;">Your email:</div>
            <input class="form-email" type="email" v-model="email" required>
          </div>
        <div>
          <div style="margin-bottom: 5px;">Your password:</div>
          <input class="form-password" type="password" v-model="password" required>
        </div>
        <button class="form-submit" type="button" @click="login">sign in</button>
      </div>
      <div class="sigIn-inner">
        <div>
          <div style="margin-bottom: 5px;">Your email:</div>
          <input class="form-email" type="email" v-model="regEmail" required>
        </div>
        <div>
          <div style="margin-bottom: 5px;">Your password:</div>
          <input class="form-password"  v-model="regPassword" required>
        </div>
        <div>
          <div style="margin-bottom: 5px;">Your username:</div>
          <input class="form-password"  v-model="regUser" required>
        </div>
        <button type="button" class="form-submit" @click="registration">sign up</button>
      </div>



    </form>
    </template>
    <template v-else>
      <div class="loader cabinet-loader"> Please wait<div class="clock-loader"></div></div>
    </template>

  </div>

</template>

<script>
import IconClose from "@/components/icon/close"
import {mapActions, mapGetters} from "vuex"
export default {
  name: `action-form`,
  components:{
    IconClose
  },
  data() {
    return {
      password: "dsff",
      email: "vvvfvvv@gmail.com",
      regUser: "",
      regPassword:"",
      regEmail:"",
      error: {},
      loader: true
    }
  },
  emits: ['close', 'success'],
  watch:{
    getLoader(value){
      this.loader = value
    }
  },
  computed: {
    ...mapGetters({
      getError: "account/get_error",
      getLoader: "account/get_loader"
    }),
  },
  methods: {
    ...mapActions({
      fetchLogin: "account/login",
      fetchRegister: "account/register"
    }),

    async login(){
      await this.fetchLogin({email: this.email, password: this.password})
      this.error = this.getError
    },

    async registration(){
      if(this.regUser.length > 15 || this.regUser.length < 2){
        this.error = {
          message: 'Bad request',
          errors:[{msg: "Username must to be more than 2 and less than 15 symbols"}]
        }
      } else if(this.regEmail.length < 3) {
        this.error = {
          message: 'Bad request',
          errors:[{msg: "Invalid email"}]
        }
      } else if(this.regPassword.length < 4){
        this.error = {
          message: 'Bad request',
          errors:[{msg: "Password must to be more than 4 and less than 10 characters"}]
        }
      } else {
        await this.fetchRegister({username: this.regUser, email: this.regEmail, password: this.regPassword})
        this.error = this.getError
      }

    }

  },
  created() {
    this.loader = this.getLoader
  }


}
</script>

<style src="./signIn.scss" lang="scss"/>


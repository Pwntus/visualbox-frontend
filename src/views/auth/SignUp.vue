<template lang="pug">
base-card
  v-card-text.pa-12
    .text-center.mb-8(v-if="!done")
      img(
        :src="require('../../assets/img/vbox.svg')"
        width="60"
      )
      h2.headline.primary--text.font-weight-light.mb-3 VISUALBOX
      .subheading.mb-5 Create an account to get started
    .text-xs-center(v-if="done")
      h1.headline.mb-3 Verify
      .subheading check the message sent to your email

    v-form(
      v-if="!done"
      v-model="form"
      ref="form"
    )
      v-container.pa-0
        v-layout.pb-4(wrap)
          v-flex.pa-1(xs12 sm6)
            v-text-field(
              v-model="firstName"
              :rules="[rules.required('Enter first name')]"
              label="First name"
              autofocus
            )
          v-flex.pa-1(xs12 sm6)
            v-text-field(
              v-model="lastName"
              :rules="[rules.required('Enter last name')]"
              label="Last name"
            )
          v-flex.pa-1(xs12)
            v-text-field(
              v-model="email"
              :rules="[rules.required('Enter your email address')]"
              label="Email"
              hint="You can use letters, numbers & periods"
              persistent-hint
            )
          v-flex.pa-1(xs12 sm6)
            v-text-field(
              v-model="password"
              :rules="[rules.required('Enter a password'), rules.pwdLength]"
              label="Password"
              type="password"
            )
          v-flex.pa-1(xs12 sm6)
            v-text-field(
              v-model="confirmPassword"
              :rules="[rules.required('Confirm your password'), rules.confirm]"
              label="Confirm password"
              type="password"
            )
          v-flex.pa-1(xs12)
            v-messages(:value="['Use a password with 6 or more characters']")

        v-layout.pa-1.pt-5(
          alig-center
          justify-space-between
        )
          v-btn.ma-0(
            to="/auth"
            color="primary"
            outlined
          ) Sign in instead
          v-btn.ma-0(
            :disabled="!form"
            :loading="isLoading"
            @click="submit"
            color="primary"
            prominent depressed
          ) Next
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { BaseCard } from '@/components/base'

export default {
  name: 'SignUp',
  components: { BaseCard },
  data () {
    const data = {
      form: false,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      password: undefined,
      confirmPassword: undefined,
      rules: {
        required: msg => v => !!v || msg,
        pwdLength: v => (!!v && v.length > 5) || 'Minimum 6 characters',
        confirm: v => (!!v && v === this.password) || 'Passwords do not match'
      },
      done: false
    }

    return data
  },
  computed: mapState('App', ['isLoading']),
  methods: {
    ...mapActions('App', ['setIsLoading', 'setSnackbar']),
    ...mapActions('Cognito', ['registerUser']),
    async submit () {
      if (!this.$refs.form.validate())
        return

      this.setIsLoading(true)
      try {
        await this.registerUser({
          username: this.email,
          password: this.password,
          attributes: {
            name: `${this.firstName} ${this.lastName}`,
            email: this.email
          }
        })
        this.setSnackbar({
          type: 'success',
          msg: 'Account created. Check your email for verification'
        })
        this.done = true
      } catch (e) {
        this.setSnackbar({
          type: 'error',
          msg: e.message,
          timeout: 10000
        })
      } finally {
        this.setIsLoading(false)
      }
    }
  }
}
</script>

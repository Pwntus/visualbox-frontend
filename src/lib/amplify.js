import API from '@aws-amplify/api'
import Auth from '@aws-amplify/auth'
import { Logger } from '@aws-amplify/core'
import config from '@/config'

Logger.LOG_LEVEL = process.env.NODE_ENV === 'development'
  ? 'INFO'
  : 'ERROR'

API.configure({
  API: {
    endpoints: [
      {
        name: config.env,
        endpoint: config.apiGateway.ENDPOINT,
        region: config.apiGateway.REGION
      }
    ]
  }
})
Auth.configure({
  Auth: {
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    userPoolWebClientId: config.cognito.CLIENT_ID
  }
})

import configProd from './prod.js'
import configDev from './dev.js'


export var config

if (process.env.NODE_ENV === 'production') {
  config = configProd
  console.log('prod');
  
} else {
  config = configProd
  console.log('dev');
  // config = configDev
}
config.isGuestMode = true



process.noDeprecation = true
process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, '--no-deprecation']
  .filter(Boolean)
  .join(' ')

require('../node_modules/react-scripts/bin/react-scripts.js')

{ exec, execSync } = require 'child_process'

task 'grammar', 'rebuild parser grammer', ->
  exec './node_modules/.bin/metacoffee ./dest/ ./src/LittlePrologGrammar.mc', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    
task 'build', 'compile src/*.coffee -> dest/*.js', ->
  exec './node_modules/.bin/coffee -bcm -o dest/ src/cs/*.coffee', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    
task 'all', 'compile CS->JS & make grammar', ->
  execSync '''
    cake build
    cake grammar''', stdio: 'inherit'
  

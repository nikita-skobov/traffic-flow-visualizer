const { buildStatus, cloverCoverage } = require('nikitas-badges')

function parseCommandLineArguments(argList) {
  const has = Object.prototype.hasOwnProperty
  const args = argList.slice(2)

  const cliObj = {
    _: [], // fills an array of command line arguments that arent
    // options, eg: program.sh runsomething then do something --some-arg yes
    // will fill the array with: ['runsomething', 'then', 'do', 'something']
    // and the 'some-arg' will become a seperate property of the cliObj
  }

  // used to skip iteration of indices which have already been grabbed
  const skipIndices = []

  // used to semantically check the next command line string
  const checkNext = ind => ({
    // this is a function that immediately returns an object with
    // 3 properties. exists is a bool,
    // doesntStartWith is a function,
    // str is the string of the argument at index 'ind'.
    exists: typeof args[ind] !== 'undefined',
    doesntStartWith: str => !args[ind].startsWith(str),
    str: args[ind],
  })

  const checkForDuplicates = (str) => {
    if (has.call(cliObj, str)) {
      throw new Error(`Duplicate command line argument found: ${str}`)
    }
  }

  const fillCliObject = (numDashes, str, index) => {
    const nextIndex = checkNext(index + 1)
    const property = str.substring(numDashes)
    if (nextIndex.exists && nextIndex.doesntStartWith('-')) {
      checkForDuplicates(property)

      // option with a value, ie: --name jimmy
      const value = nextIndex.str
      cliObj[property] = value
      // mark this index, and the next index as already been read
      skipIndices.push(index, index + 1)
    } else {
      checkForDuplicates(property)

      // boolean option, ie: --ignore-warnings-flag
      cliObj[property] = true
      // mark this index as already been read
      skipIndices.push(index)
    }
  }


  args.forEach((str, index) => {
    if (skipIndices.indexOf(index) >= 0) {
      // we already grabbed that index, so skip
      return null
    }

    if (str.startsWith('--')) {
      fillCliObject(2, str, index)
    } else if (str.startsWith('-')) {
      fillCliObject(1, str, index)
    } else {
      // adds an argument to an array of arguments that dont
      // correspond to any options like --name, or -c
      cliObj._.push(str)
      skipIndices.push(index)
    }

    return null
  })

  return cliObj
}


const cliObj = parseCommandLineArguments(process.argv)

const coverageBadge = cloverCoverage.fn(cliObj)
const buildStatusBadge = buildStatus.fn(cliObj)

const branchSplit = cliObj.branch.split('/')
const lastBranchIndex = branchSplit.length - 1
const start = parseInt(cliObj['build-start'], 10) / 1000 // convert to seconds
const duration = parseInt(cliObj['build-duration'], 10) / 1000 // convert to seconds
const end = start + duration
const stagesCSV = cliObj.stages

const stages = []

let previousDuration = 0
let previousIndex = 0
stagesCSV.split(',').forEach((str, index) => {
  if (index % 2 === 0) {
    // this means it is a title of a stage
    previousIndex = stages.length
    stages.push({
      name: str.replace('_', ' '),
      duration: '-',
    })
  } else if (str !== '.') {
    // if index % 2 != 0, then str is a duration of a stage
    // if its a dot then that means the stage failed, so dont modify
    const durationMS = parseInt(str, 10)
    stages[previousIndex].duration = Math.floor(durationMS) - previousDuration
    previousDuration = durationMS
  }
})

const report = {
  badges: [
    buildStatusBadge,
    coverageBadge,
  ],
  num_commits: cliObj['num-commits'],
  branch: branchSplit[lastBranchIndex],
  time_ended: Math.floor(end),
  duration: Math.floor(duration),
  current_commit: cliObj['current-commit'],
  status: cliObj['build-status'],
  stages,
}

console.log(JSON.stringify(report))

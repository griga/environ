#!/usr/bin/env node

console.log('==================================== ENVIRON here ||=====');
const DEV = true

const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv
const mkdirp = require('mkdirp')
const cwd = process.cwd()


const command = argv._[0]
const useProfile = argv._[1]

// 0. check params 
const confPath = argv.config ?
  path.resolve(cwd, argv.config) :
  path.resolve(cwd, '.environ')
if (!fs.existsSync(confPath))
  throw new Error('Missing `.environ` project file. ' + confPath)
const environ = JSON.parse(fs.readFileSync(confPath, 'utf8'))
const sourcesPath = path.resolve(cwd, environ.sources)
const targetPath = path.resolve(cwd, environ.target)

if (!fs.existsSync(sourcesPath)) {
  throw new Error('sources path not exists!')
} else if (!fs.existsSync(targetPath)) {
  throw new Error('target path not exists!')
} else if (!useProfile) {
  throw new Error('Usage:   environ <command> <profile-id>')
}

const profilePath = path.resolve(sourcesPath, useProfile)
if (!fs.existsSync(profilePath)) {
  throw new Error('directory profile <profile-id> ' + useProfile + ' not exists. use real path')
} else if (!environ.profiles[useProfile]) {
  throw new Error('profile ' + useProfile + ' is not defined in .environ conf')
} else {
  console.log('Use ' + useProfile + ' as profile')
}



// 1. action

switch (command) {
  case 'use':
    use()
    break

  case 'backup':
    backup(useProfile)
    break

  default :
    console.log('Wrong or absent action name');
}


function use() {
  return (environ.__current ? // make backup if __current is set
      backup(environ.__current).then(() => { // cleanup current
        return cleanupProfile(environ.__current, targetPath)
      }) :
      Promise.resolve()
    ).then(() => {
      // push in profile
      return copyProfile(useProfile, profilePath, targetPath)
    })
    .then(() => {

      //end
      environ.__current = useProfile
      fs.writeFileSync(confPath, JSON.stringify(environ, null, '  '))
    })
   
}


function backup(profile) {
  const backupDir = path.resolve(sourcesPath, profile, '__backup', profile + '_' +Date.now())
  return ensureDir(backupDir)
    .then(() => {
      return copyProfile(profile, // first backup profile itself
        path.resolve(sourcesPath, profile),
        backupDir)
    })
    .then(() => { // copy current profile
      return copyProfile(profile,
        targetPath,
        path.resolve(sourcesPath, profile))
    })
    .catch(error => {
      console.error(error.stack)
    })
}


// ====================================
// functions 
function copyProfile(profile, from, to) {
  debug('copyProfile', ['profile', 'from', 'to'], arguments)

  return Promise.all(environ.profiles[profile].map(item => {
    const itemPath = path.resolve(from, item)
    if (!fs.existsSync(itemPath)) console.log('Warning: source ' + itemPath + ' from ' + profile + ' not exists')
    const itemStat = fs.statSync(itemPath)
    const itemTarget = path.resolve(to, item)

    if (itemStat.isDirectory()) {
      return copyDirRecursive(itemPath, itemTarget)
    } else {
      return copyFile(itemPath, itemTarget)
    }
  }))
}

function copyDirRecursive(from, to) {
  debug('copyDirRecursive', ['from', 'to'], arguments)

  return ensureDir(to).then(() => {
    return Promise.all(fs.readdirSync(from).map(it => {
      const itsPath = path.resolve(from, it);
      const itsTarget = path.resolve(to, it);
      const itsStat = fs.statSync(itsPath);
      if (itsStat.isDirectory()) {
        return copyDirRecursive(itsPath, itsTarget)
      } else {
        return copyFile(itsPath, itsTarget)
      }
    }))
  })
}

function copyFile(from, to) {
  debug('copyFile', ['from', 'to'], arguments)

  return ensureDir(path.dirname(to)).then(()=>{
    return new Promise((resolve, reject) => {
      var rd = fs.createReadStream(from);
      rd.on('error', rejectCleanup);
      var wr = fs.createWriteStream(to);
      wr.on('error', rejectCleanup);
  
      function rejectCleanup(err) {
        rd.destroy();
        wr.end();
        reject(err);
      }
      wr.on('finish', resolve);
      rd.pipe(wr);
    });
  })
  
}

function cleanupProfile(profile, dir) {
  debug('cleanupProfile', ['profile', 'dir'], arguments)

  return Promise.all(environ.profiles[profile].map(item => {
    const itemPath = path.resolve(dir, item)
    const itemStat = fs.statSync(itemPath)

    if (itemStat.isDirectory()) {
      return cleanupDirRecursive(itemPath)
    } else {
      fs.unlinkSync(itemPath)
      return Promise.resolve()
    }
  }))
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    console.log('Warning: dir ' + dir + ' doesnt exist. create');
    mkdirp.sync(dir)
  }
  return Promise.resolve()
}

function cleanupDirRecursive(dir) {
  debug('cleanupDirRecursive', ['dir'], arguments)

  return Promise.all(fs.readdirSync(dir).map(item => {
      const itemPath = path.resolve(dir, item)
      const itemStat = fs.statSync(itemPath)

      if (itemStat.isDirectory()) {
        return cleanupDirRecursive(itemPath)
      } else {
        fs.unlinkSync(itemPath)
        return Promise.resolve()
      }
    }))
    .then(() => {
      fs.rmdirSync(dir)
      return Promise.resolve()
    })

}

function debug(title, names, values) {
  console.log('\n' + title);
  names.forEach((it, idx) => {
    console.log(it.padStart(8) + ':  ' + values[idx]);
  })
}
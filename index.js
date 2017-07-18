"use strict"
const PATH = require('path');
const FS = require('fs');
const PROCESS = require( "process" );
const READLINE = require('readline');
const HTTP = require('http');
var countDown = 5;
var config;
var env;
var BUILD_PATH,CONFIG_PATH,configFile;

let rl = READLINE.createInterface({
    input: PROCESS.stdin,
    output: PROCESS.stdout
});

function recursiveReadFile (folderName, ignoreList) {
    var folderList = [];
    var fileList = [];
    var ignoreList = ignoreList || [];
    folderList.push(folderName);
    do {
        var folder = folderList.shift(); 
        var files = FS.readdirSync(folder);
        files.forEach(file => {
            var fileWithPath = PATH.join(folder, file);
            var stats = FS.statSync(fileWithPath); 
            if (~ignoreList.indexOf(file)) {
                return;
            } else if (stats.isDirectory()) {
                //at this time file refers to folder
                folderList.push(folder + '/' + file);
            } else {
                fileList.push(fileWithPath);
            }
        });
    } while (folderList.length);
    return fileList;
}
function recursiveGenerator (folderName, config) {
    var fileList = recursiveReadFile(folderName, ['config.json', 'config-version.json'].concat(configFile.globalIgnoreList));
    fileList.forEach(fileWithPath => {
        var hash = MD5.sync(fileWithPath);
        config.files[PATH.relative(BUILD_PATH, fileWithPath)] = hash;
    });
}
function ensureDirectoryExistence(filePath) {
  var dirname = PATH.dirname(filePath);
  if (FS.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  FS.mkdirSync(dirname);
}
function writeFile (path, jsonFile, isJSON = true) {
    ensureDirectoryExistence(path);
    FS.writeFileSync(path, isJSON ? JSON.stringify(jsonFile,null,4).replace(/\\\\/g,'/'): jsonFile);
}
function writeConfigFile () {
    config.files = {};
    writeFile(CONFIG_PATH, configFile);
    console.log('>>> 结束，offline-config.json的版本号加一升级');
}
function parseJSON (jsonFile) {
   return JSON.stringify(jsonFile,null,4).replace(/\\\\/g,'/') 
}
var exports = {
    initConf () {
        var reponame = '';
        rl.question('>>> 正在生成confmap...\nproceed or not, type yes/no\n', answer => {
            if (answer !== 'yes') {rl.close(); return;}
            var confMap = {
                "env1": {
                    "param": 1
                },
                "env2": {
                    "param": 1
                },
                "env3": {
                    "param": 1
                },
            };
            console.log('================================================\n', JSON.stringify(confMap, null, 4));
            rl.question('does it looks good to you? yes/no\n', answer => {
                if (answer === 'yes') {
                    writeFile(PATH.join(__dirname, 'confMap.json'), confMap);
                    console.log('confMap.json file success created!');
                } else {
                    console.log('exit. please reinit');
                    rl.close();
                    return;
                }
                rl.question('where do wish to save you conf file ?', path => {
                    var fileWithPath = PATH.join(__dirname, path);
                    var savedPath = PATH.join(__dirname, '.packConf/saveInfo');

                    writeFile(savedPath, fileWithPath);
                    rl.question('cmd or es6 import? cmd/es6', answer => {
                        if (answer === 'es6') {
                            writeFile(fileWithPath, 'exports default' + parseJSON(confMap['env1']));        
                        } else {
                            writeFile(fileWithPath, 'module.exports = ' + parseJSON(confMap['env1']));
                        }
                        rl.close();
                    })
                });
            });
        });
    },
    run () {
        BUILD_PATH = PATH.resolve('./build');
        CONFIG_PATH = PATH.resolve('./offline-config.json');
        configFile = JSON.parse(FS.readFileSync(CONFIG_PATH, 'utf8'));

        rl.question('>>> 你想生成哪个环境对应的离线json文件？ qa, pre或者online\n', answer => {
            if (['qa', 'pre', 'online'].indexOf(answer) === -1) {
                console.log('>>> error input, close');
                rl.close()
                return;
            }
            env = answer;
            config = configFile[answer];
            //版本号升1
            config.version++;
            config.repo = configFile.gitRepoName;
            recursiveGenerator(BUILD_PATH, config);
            //console.log(recursiveReadFile(BUILD_PATH, ['config.json', 'folderInner']));
            console.log(JSON.stringify(config, null, 4).replace(/\\\\/g,'/'));
            rl.question('>>> config.json如上，是否继续生成？ yes/no\n', answer => {
                if (answer === 'yes') {
                    writeFile(BUILD_PATH + '/config.json', config);
                    writeFile(BUILD_PATH + '/config-version.json', {version: config.version});
                    console.log('>>> config.json已经生成');
                    console.log('>>> config-version.json已经生成');
                } else {
                    rl.close();
                    console.log('>>> 取消生成，offline-config.json的版本号没有升级');
                    return;
                }
                rl.question('>>> 你希望继续发布吗？yes/no\n', answer => {
                    if (env === 'online') {
                        console.log('>>>>>> 线上发布请到jekins上进行 <<<<< ');
                        writeConfigFile();
                        rl.close();
                        return;
                    }
                    if (answer === 'yes') {
                        var fileList = recursiveReadFile(BUILD_PATH);
                        publishFile(fileList);
                    } else {
                        console.log('>>>>>> 用户取消 <<<<< ');
                        rl.close();
                    }
                });
            });
        });

    }
};
//exports.run();
module.exports = exports;


packconf
====

> packconf aimed to generate different config file based on your need.

> two bin scripts are included, packinit and packrun, using them in any task runner or simply include them in your package.json’s script filed

* packinit

    you have to run packinit first. packinit generate a confMap.json in your root directory. which looks like below:

    ```javascript

    {
      "env1": {
          "param": 1
      },
      "env2": {
          "param": 2
      },
      "env3": {
          "param": 3
      }
    };
    ```

    you might modify confMap.json into anything you like, keep in mind that the root key of this json file is the "environment"

* packrun

    executing packrun will ask you which environment config file you'd like to generate. packConf will create the config file using the path you typed in the first place



* confMap.json

    ```json

      {
        "env1":{
            "logo": "XXX管理系统(普通json数据)",
            "script":"require('../common.js')(直接插入到生成的config文件内的js,生成的config文件内不包含script属性)",
            "desc": "这是XXX管理系统的配置(配置的简单描述,生成的config文件内不包含desc属性)",
            "title":"{{document.title}}(值为js代码,使用'{{}}'包裹)",
        }
      }

    ```

    生成配置 =>

    ```javascript
      require('../common.js');
      export default{
        "logo": "XXX管理系统",
        "title":document.title
      }
    ```

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


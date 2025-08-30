## node-red-contrib-enocean

**important!** for this nodes to work correctly you have to change the node-red [setting for context stores](https://nodered.org/docs/user-guide/context#context-stores).

in `settings.js` set the `contextStorage` setting to `localfilesystem`

```
contextStorage: {
   default: {
       module: "localfilesystem"
   }
}
```
### listening to incoming messages

![image](https://user-images.githubusercontent.com/10807348/57431654-c70e1c00-7233-11e9-8b40-5a44c3e42522.png)

[example flow](https://flows.nodered.org/flow/1f0dd4b46e783c6306fc5fc8f8584630)

### sending telegrams

![image](https://user-images.githubusercontent.com/10807348/57432580-911e6700-7236-11e9-872a-d68f239324b9.png)

[example flow](https://flows.nodered.org/flow/0ab5bbccc5b4457db66bf81442228aaf)

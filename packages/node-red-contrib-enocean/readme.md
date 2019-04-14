## node-red-contrib-enocean

### the enocean-input node

![screenshot](https://user-images.githubusercontent.com/10807348/56092773-6f90c080-5ec0-11e9-9da0-8e31729de3be.png)

#### automatic teach in

pressing the button on the left of the node will set the node into the *teach in mode*. It will listen for learn telegrams for **30s**. When a learn telegram is received within that time period, the corrensponding sensor will automatically be paired.

**important!** for the automatic teach in to be persistent you have to change the node-red [setting for context stores](https://nodered.org/docs/user-guide/context#context-stores).

in `settings.js` set the `contextStorage` setting to `localfilesystem`

```
contextStorage: {
   default: {
       module: "localfilesystem"
   }
}
```

#### manually teach in

instead of automatic teach in you can also provide the sensor id and eep yourself in the nodes property pane.

[scrennshot](https://user-images.githubusercontent.com/10807348/56090574-2e8ab300-5ea4-11e9-8217-971ca713bc7c.png)

#### combining manuell and automatic teach in

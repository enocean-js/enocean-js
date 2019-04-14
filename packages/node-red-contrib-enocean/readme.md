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

![screenshot](https://user-images.githubusercontent.com/10807348/56090574-2e8ab300-5ea4-11e9-8217-971ca713bc7c.png)

**sender Id** can usually be found on the device itself and is written as a 4Byte (8 digit) string in hexadecimal form (f.e.: `001a2b3c`).

**EEP** is the **E**nocean **E**quipment **P**rofile which should be provided with the documentation of your device and is written in the form of 3Bytes seperated by a dash (f.e.: `f6-02-01`).
The description of the eep and the meaning of the telegram content can be found in the [EEP Specefication](https://www.enocean-alliance.org/wp-content/uploads/2018/02/EEP268_R3_Feb022018_public.pdf)

**Direction**

is used for the rare case of bidirectional telegram encodindgs where the from and the to case have different encodings. f.e.: `a5-11-05`

#### combining manually and automatic teach in

after automatic teach in you can change anything by hand to overwrite the automatically learned values.
You can try this with a rocker switch. Rocker Switches are allways tought in as `f6-02-01`, teach in a button automatically, and overwrite the EEP value with `f6-02-03` and see a different interpretation of the incomming telegrams.

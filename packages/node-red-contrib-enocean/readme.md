## node-red-contrib-enocean

* [enocean-in](#enocean-in)
* [enocean-out](#enocean-out)
* [enocean-btn](#enocean-btn)

### enocean-in

![screenshot](https://user-images.githubusercontent.com/10807348/56092773-6f90c080-5ec0-11e9-9da0-8e31729de3be.png)

#### automatic teach in

pressing the button on the left of the node will set the node into the *teach-in mode*: It will listen for LRN telegrams for **30s**. When a learn telegram is received within that time period, the corrensponding sensor will automatically be paired.

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

instead of automatic teach in you can also provide the sensor-id and eep yourself in the nodes property pane.

![screenshot](https://user-images.githubusercontent.com/10807348/56090574-2e8ab300-5ea4-11e9-8217-971ca713bc7c.png)

**sender Id** can usually be found on the device itself and is written as a 4Byte (8 digit) string in hexadecimal form (f.e.: `001a2b3c`).

**EEP** is the **E**nocean **E**quipment **P**rofile which should be provided with the documentation of your device and is written in the form of 3Bytes seperated by a dash (f.e.: `f6-02-01`).
The description of the eep and the meaning of the telegram content can be found in the [EEP Specification](https://www.enocean-alliance.org/wp-content/uploads/2018/02/EEP268_R3_Feb022018_public.pdf)

**Direction**

is used for the rare case of bidirectional telegram encodindgs where the from and the to case have different encodings. You migth need a direction other than 1 for the following EEPs:

* a5-11-05
* a5-20-01
* a5-20-02
* a5-20-03
* a5-20-04
* a5-20-10
* a5-20-11
* d2-a0-01

### enocean-out


### enocean-btn

![screenshot](https://user-images.githubusercontent.com/10807348/56548719-17715280-6581-11e9-9674-618d6852d5c6.png)

the enocean button is a convenient node to make it easier to send switch commands.

It is controled by a simple JSON payload:

```
{
  "button" : 0,
  "event" : "click",
  "channel" : 1
}
```
#### button

button can have the value `0`, `1`, `2` or `3`. The node implements a 2 Rocker (4 Button) Switch.

the buttons are numbered like this:

![btnS](https://user-images.githubusercontent.com/10807348/56549766-f52d0400-6583-11e9-8e90-810123f926fd.JPG)

so to switch a light on send `"button": 0 ` and to switch it of send `"button": 1`. Or `2` and `3` respectively

#### event

each button can be `clicke`d, `down`ed or `released`

for ligth switches you usualy send a `click` event.

For blind conrtrol or dimming lights, you send a `down` event, to start a blind movement or dimming, and the blind or light will move in the chosen direction until a release event is fired.

#### channel

you can send telegrams on up to 128 channels (`0` - `127`)
Each channel represents one virtual device. For this node, each channel represents one 2-Rocker switch.

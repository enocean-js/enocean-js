# Common Command

the Common Command interface lets you manage your TCM310 (your enocean USB Stick for example) you can read or write 
your Base Id etc.


## CO_WR_SLEEP

Function: Order to enter the energy saving mode

### usage

    .send('CO_WR_SLEEP','00nnnnnn')

Period in 10 ms units

* min 00000000 (deafult)
* max 00ffffff (46h)

After waking up, the module generate an
internal hardware reset

### returns

* 00 RET_OK
* 02 RET_NOT_SUPPORTED

## CO_WR_RESET

Function: Order to reset the device.

### usage

    .send('CO_WR_RESET')

### returns

* 00 RET_OK
* 01 RET_ERROR
* 02 RET_NOT_SUPPORTED

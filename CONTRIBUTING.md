# Contributing to enocean-js

* all library files and modules live in `/packages/node_modules/@enocean-js`
* all lib users live in `/packages/` (?)

## adding a new package

* create a folder in `/packages/node_modules/@enocean-js` with the name `my_module` ( or whatever your module is named ;-) )
* copy the template package.json file from `resources/templates/package.json`
* change the name in package.json to `@enocean-js/my_module`
* change the other fields as needed.
* DON'T touch the fields `version`, `license` or `repository`

install dependencies at the global root directory. NOT inside your module folder. You have to add the dependencies you need to your package.json by hand.

alternatively you can add the dependencies with `npm i -S whatever` but immediately delete your node_modules folder.

if you `import` any other submodule, add it to the dependencies as well.

every new package needs an initial publication so that it can be published to our scope.

    `npm publish --access public`

#CategoryTreeMod

Added some features to the Mediawiki's extension [Category Tree](https://www.mediawiki.org/wiki/Extension:CategoryTree), for Mediawiki 1.22+, based on [Cornucopia](https://www.mediawiki.org/wiki/User:Cornucopia)'s modifications

It 'heavily' uses localStorage, so, please, check your browser's support

## Features
* Remember opened nodes
* Remember the last link clicked
 
#Instalation
1. __Install latest Category Tree__

  Follow [Category Tree](https://www.mediawiki.org/wiki/Extension:CategoryTree)'s page for instructions

2. __Backup Category Tree's javascript__

  Navigate to _<category tree dir>/modules/_, and rename _ext.categoryTree.js_ to _ext.categoryTree.js.bak_

3. __Clone this project__:

  ```sh
  $git clone https://github.com/kbooz/CategoryTreeMod.git
  ```

4. __Modify 'expand' constant to your Mediawiki's language__: If your Mediawiki is in another language _i.e.: portuguese, spanish, italian..._, you'll need to change a simple line, or else __it'll break your extension__
  
  4a. Navigate to <category tree __mod__ dir>, open _ext.categoryTree.js_ in your text editor

  4b. Locate this line: _line 13, probably_

    ```javascript
    const expand = 'expand'; // expand text in l18n
    ```
  4c. Modify to your Mediawiki's language:
  
  ```javascript
    const expand = 'expandir'; // expand text in l18n
  ```
  
5. __Copy the mod into CategoryTree's modules directory__

__Presto!__

##To-do
* Eliminate 4 step, by using CategoryTree's Localisation
* Correct text errors

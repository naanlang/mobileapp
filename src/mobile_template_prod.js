/*
 * template_prod.js
 *
 * Portions Copyright (c) 2021-2024 by Richard C. Zulch
 *
 * This file is a template for the Mobile webapp, comprising the following modules and components:
 *
 * For testing, you can load the JavaScript module directly with something like this:
 *     require("frameworks/common").JsLoadScript("run/mobileAppDev/code/mobile.js")
 *
 * column positioning:                          //                          //                      !
 *
 */

(function() {
    'use strict';

    /*
     * initialize
     *
     * First throw a caught exception to allow for Chrome debugging from a script tag. Second, find
     * our interpreter instance for subsequent low-level calls.
     *
     */

    try { throw "" } catch(e) { }                                           // helpful debug entry

    var ninti;
    try {
        ninti = Naanlang.naancon.anaan;
    } catch (e) {
        console.log("unable to find Naan instance");
        return;
    }

    /*
     * moduleBegin
     * moduleEnd
     *
     *     This little big of magic creates a module with the same location as the script so that
     * calls to require will find modules in the right locations. It also arranges for the current
     * namespace to be set to the new module so that subsequent references to module.id will find
     * the correct one.
     *     After initializing your module it's important to call moduleEnd to restore the original
     * namespace structure. It's also crucial to initialize each component before it is required,
     * or otherwise require() will go looking for it elsewhere, which is not what you want.
     *
     */

    function moduleBegin(modname) {
        var savens = ninti._InheritNamespace();
        var newns = savens;
        if (newns[0][2][3] == "Start") {                                    // remove "Start" if present
            newns.shift();
            ninti._SetNamespace(newns);
        }
        ninti._SetNamespace(modname);
        var curns = ninti._InheritNamespace("Lang_Lingo");                  // get basic operators from Lingo
        ninti._Execute(['.', ['.', 'Naan', 'module'], 'build', ['$'.concat(modname), '$'.concat(modname)]]);
        return (savens);
    }

    function moduleEnd(savens) {
        var retval = ninti._Execute(['.', 'module', 'exports']);
        ninti._SetNamespace(savens, true);
        return (retval);
    }

    /*
     * =============================================================================================
     * mobileApp
     * =============================================================================================
     *
     */

    var savens = moduleBegin("mobileApp");

    $src/code/mobileApp/frames.js$
    $src/code/mobileApp/page_settings.js$
    $src/code/mobileApp/page_start.js$
    $src/code/mobileApp/swipe.js$
    $src/code/mobileApp/mobileApp.js$
    $src/code/mobileApp/utils.js$
    $src/code/mobileApp/utilsUI.js$

    ninti._SetBindingList("init_mobileApp",
        ["function", "init_mobileApp", ["false", "var"],
            ['utilsInit'],
            ['utilsUiInit'],
            ['framesInit'],
            ['pageSettingsInit'],
            ['pageStartInit'],
            ['swipeInit'],
            ['mobileInit']]);
    ninti._Execute(["set.", ['.', 'module', 'exports'], ["`", "init"], "init_mobileApp"]);
    moduleEnd(savens);

    /*
     * =============================================================================================
     * Naanlib/frameworks/browser
     * =============================================================================================
     *
     */

    savens = moduleBegin("browser");

    $../naan/frameworks/browser/browser.js$
    $../naan/frameworks/browser/https_request.js$

    ninti._SetBindingList("init_browser",
        ["function", "init_browser", ["false", "var"],
            ['brorInit'],
            ['https_browserInit']]);
    ninti._Execute(["set.", ['.', 'module', 'exports'], ["`", "init"], "init_browser"]);
    moduleEnd(savens);

    /*
     * =============================================================================================
     * Naanlib/frameworks/common
     * =============================================================================================
     *
     */

    savens = moduleBegin("common");

    $../naan/frameworks/common/common.js$
    $../naan/frameworks/common/watching.js$
    $../naan/frameworks/common/utils.js$

    ninti._SetBindingList("init_common",
        ["function", "init_common", ["false", "var"],
            ['comrInit'],
            ['wachInit'],
            ['utilsInit']]);
    ninti._Execute(["set.", ['.', 'module', 'exports'], ["`", "init"], "init_common"]);
    return (moduleEnd(savens));

})();

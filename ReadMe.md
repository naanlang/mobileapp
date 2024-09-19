# MobileApp ReadMe
This folder contains the **MobileApp** example webapp for the NaaN software platform.

MobileApp is an example webapp targeting vertical orientation devices like phones. This simple demo app just shows chess pieces on a virtual chessboard with swipe navigation, and a settings page to upgrade or change the interface language. Below the surface it incorporates important capabilities needed for web apps, including:

* release versioning and upgrades
* service worker for page caching
* multiple language UI
* dev and prod stages integrated with the IDE
* mobile device simultation on desktops for debug and fast build cycles
* simple inbuilt web server for testing on physical phones

MobileApp is designed to be an educational tool for learning NaaN, which is a modern software platform targeting web and cloud applications. This project uses NaanIDE to build and debug the webapp. NaanIDE is a "batteries included" development environment that requires minimal effort for installing and maintaining the tool chain.

NaaN's goal is to be a highly productive software platform that keeps software development a fun activity. NaaN combines radical simplicity, minimal abstractions, and high capability to avoid many of the time sinks that have been plaguing developers in recent years.

The follow sections describe out to install and build MobileApp.

## Preparation

The prerequisites for using this project are:

* A desktop or laptop computer that runs MacOS, Linux, Windows, or ChromeOS
* Up-to-date desktop web browser, preferably Chrome
* Recent NodeJS and git
* The latest @naanlang/naan and @naanlang/naanide NPM packages

Following are detailed instructions for preparing the environment.

### Recommended Folder Environment
Create a place where NaaN files will reside on your computer disk. The recommended structure is:

```
NaanWorld/
	naan/               # NaaN library for projects
	mobileapp/          # this project
```
The `naan` folder is the version of Naanlib used for building projects. This structure makes it possible to retain a consistent version of `naan` even if you update the tools.

### Installing NodeJS

The [NodeJS website](https://nodejs.org/) has an install button on the main page. This will install `node` and `npm` and both are needed. We recommend the LTS version unless you have other requirements.

If you already have node, check that the version is at least 18:

```
% node --version
v20.10.0
```

### Installing git

Git comes preloaded on most OS distributions, but you can obtain installers from the website [download page](https://git-scm.com/downloads). Any version from recent years will work, but at least 2.34 is preferred.

```
% git --version
git version 2.39.3 (Apple Git-146)
```

### Installing NaaN and NaanIDE

It's easiest to install both packages globally so you can invoke them anywhere on your computer:

```
sudo npm install -g @naanlang/naan @naanlang/naanide
```

### Create the `NaanWorld` folder structure and clone the repo

```
mkdir NaanWorld
cd NaanWorld
cp -r `npm root -g`/@naanlang/naan .
git clone https://github.com/naanlang/mobileapp
```

## Using NaanIDE

NaanIDE is designed to combine familiar UI features with deeper platform functionality. The UI combines project management, source code editor, build/make system, REPL, GUI debugger, execution instance manager, and plugins for additional functions. 

NaanIDE includes the Platform Storage Manager (PSM) providing an abstract filesystem with service-specific plugins. This enables storing files and opening projects on the local filesystem, browser local storage, S3-compatible endpoints, generic databases, etc. Other platform infrastructure allows remote REPL and debugging of NaaN instances on other computers, including in the cloud.

### Opening the project

The following steps describe how to open a new project in NaaN. The project and its location are saved in the Projects list in NaanIDE.

**[1]** Invoke `naanide` to open as a browser page. It starts on the **Home** page at the **Welcome** tab. You will see a separate terminal window for the server that supports the web page.

![NaanIDE Welcome tab](https://naanlang.org/naanlang/blog/posts/naanide-mobileapp-screenshots/v0-9-x/NaanIDE-01+-+Welcome.png)

**[2]** Select the blue **Projects** tab. You will see an empty projects list.
![NaanIDE Projects tab](https://naanlang.org/naanlang/blog/posts/naanide-mobileapp-screenshots/v0-9-x/NaanIDE-03+-+Empty+Projects.png)

**[3]** Click the **[+]** button at the bottom of the page to add a project. It will show you folders on your computer. Navigate to the _**mobileapp**_ folder you just created with git. Click **Select**.
![NaanIDE folder selector](https://naanlang.org/naanlang/blog/posts/naanide-mobileapp-screenshots/v0-9-x/NaanIDE-04+-+Open+Project+Folder.png)

**[4]** NaanIDE will open the project and switch to the **Project** page, showing the contents of the _**mobileapp**_ project.
![NaanIDE mobileapp project](https://naanlang.org/naanlang/blog/posts/naanide-mobileapp-screenshots/v0-9-x/NaanIDE-05+-+Project+After+Open.png)

### Building the app

To build the app click the ▶️ *build and run* button in the menu bar at the top of the NaanIDE page. To the left of this is the stage selector, which defaults to `dev`. 
![Build and Run button](https://naanlang.org/naanlang/blog/posts/naanide-mobileapp-screenshots/v0-9-x/NaanIDE-09+-+Build+and+Run.png)

After a brief delay NaanIDE will open the executing mobileapp in a new window that simulates a physical phone. You can resize this window to experiment with the variation of layouts across different devices.
![App in Simulator](https://naanlang.org/naanlang/blog/posts/naanide-mobileapp-screenshots/v0-9-x/NaanIDE-10+-+App+in+Simulator.png)

MobileApp implements a virtual chessboard, where you navigate from one square to the next by swiping in the desired direction by mouse or by touch. You can also use the arrow keys instead of swiping.

### Debugging

To use the debugger, select the **Run** page in the NaanIDE menu bar. Find the line in the navigator on the left showing *NaaN MobileApp 0.9.0-dev+1* and click it to show the REPL and open the GUI debugger.
![GUI Debugger](https://naanlang.org/naanlang/blog/posts/naanide-mobileapp-screenshots/v0-9-x/NaanIDE-11+-+Run+tab+with+Debugger+and+Console.png)
These are connected to the webapp running in the simulator window, and the REPL shows the webapp's debugging messages such as the following:

```
firstLoadInit dev
referrer: http://localhost:8009/nide.html
query: { : "" }
Start-lingo> orientation is now vertical
```
The REPL text in green is generated by calls to `debuglog()` while text in white is generated by the REPL and calls to `printline()`.

You can type commands and expressions into the REPL. For example `/help` lists the "executive" commands implemented by the REPL.

### Stages: dev, prod, and server

NaanIDE supports multiple *stages* which are entirely separate builds of the project for different purposes. In MobileApp there are three stages:

1. `dev` offers slow execution but easy debugging
2. `prod` offers fast execution but without the GUI debugger
3. `server` provides a simple server for testing on physical devices
![](https://naanlang.org/naanlang/blog/posts/naanide-mobileapp-screenshots/v0-9-x/NaanIDE-08+-+Build+Stages.png)

### Testing on an actual device

The simulator provides for a very fast build/test cycle, so you can experiment with several builds in one minute. But there is no substitute for testing on actual mobile devices, for example to use the touch interface.

For the MobileApp server, select the `server` stage and build it. Instead of opening a separate window this runs inside the REPL console in a new worker thread. It will prompt you to evaluate either `dev()` or `prod()` to start the corresponding server, and will provide the server URL to use with your device.

This simple server uses http over an insecure connection to avoid the need for SSL certificates. That disables some of the browser features for this page, such as the Service Worker, but this application doesn't require more.

## Next Steps

Please visit the [naanlang.org](https://naanlang.org) website for more about the NaaN platform. There are also resources available on [GitHub](https://github.com/naanlang/) and NPM for [naan](https://www.npmjs.com/package/@naanlang/naan) and [naanide](https://www.npmjs.com/package/@naanlang/naanide).

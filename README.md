# Repl.it Mobile

A mobile client for the online coding platform and community [Repl.it](https://repl.it/). **This is a work in progress, [join the Discord server](https://discord.gg/sVxJJZA) if you're interested!**

If you want to try it out, I will sometimes be hosting a "tunnel." If you want to access this, download the [Expo mobile app](https://expo.io/tools#client) and open [mobile.repl.co](https://mobile.repl.co/) on your phone.

If you're on Android and want to test out a more stable build, you can download that [here](https://mobile.repl.co/download.html).

## Motivation

Repl.it is amazing but the site isn't very mobile friendly. This app's development will enable programmers to edit code on the go, and empower students who only have access to tablets or phones to learn how to program.

## Development

- Clone this repository or pull the latest changes
- Make sure to run `yarn` to install packages
- Install the [Expo mobile app](https://expo.io/tools#client)
- Run `yarn dev` to start a development server
- On your phone scan the QR code or enter in the address

**Or, just click the button below!** Warning: this might be a little buggy.

[![Run on Repl.it](https://repl.it/badge/github/kognise/repl.it-mobile)](https://repl.it/github/kognise/repl.it-mobile)

## File Structure

Some files and directories are excluded due to boringness.

- `assets/` - Static assets to be imported
  - `fonts/` - Font files
  - `images/` - Images
    - `app/` - Icons and splash screens
    - `logos/` - Other company logos
- `components/` - React components
  - `ui/` - Custom UI elements/components
  - `dialogButtons/` - Self-contained buttons that trigger dialogs
    - `fabs/` - FAB-style buttons
    - `menuItems/` - Menu buttons
  - `webViews/` - Components that are primarily `WebView`s
  - `wrappers/` - Components meant to be used as wrappers
- `lib/` - Library and utility functions
- `html/` - Static HTML files for `WebView`s
- *`node_modules/`  - The black hole that keeps everything running*
- `screens/` - App screens
  - `app/` - Main app interface screens
  - `auth/` - Auth and setup process screens
    - `providers/` - Login screens for social auth providers
- `App.js` - The app entrypoint
- `app.json` - Expo and app-wide config file

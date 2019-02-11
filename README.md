# Multi-Room Control Audio System
#### MERN Stack, WebRTC, Audio API

#### TL`DR
Think about a recording studio control room with multiple recording rooms.

#### Why did you create this?
This is a digital version of an analog system created to help with reading disabilities treatment

#### What can it do?
The application is in its early stages but right now it implements: 
* One central control room (ADMIN) can connect & control and listen to many listening rooms (USERS).
* WebRTC (PeerJS) - handles peer 2 peer connection for data and audio streaming connection.
* Web Audio API is used to handle Stream to Audio Context / Audio Context  to Stream & Gain control over audio elements.
* Node serverside API handles authentication and data fetching from mongoDB.

*While listening to a room admin can:*

* Start, Stop, Pause, FF, Rewind audio playback
* Hold talkback button to interact with current room
* Activate / Deactive Pitch detection Oscillator and ajust the OSC gain.
* View current room playback time

## REQUIREMENTS

* *UPDATED CHROME OR FIREFOX* - for Audio HTML elements stream capture
* *GET OPEN SSL Certificate* - save as server.cert + server.key - for serving HTTPS (Required for proper audio context streams)
* *SETUP ENV VARIABLES* - PORT, HOST, DEV_DB_URL
* *Run* : npm install, num run build || num run start-build (with nodemon)

## Available Scripts

In the project directory, you can run:

### `npm build-start`

Builds the app for production to the `build` folder.<br>
Builds react and serves with nodemon

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

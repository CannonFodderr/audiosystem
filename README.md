# Multi-Room Control Audio System
#### MERN Stack, WebRTC, Audio API

#### TL`DR
Imagine a recording studio control room only with multiple recording rooms.
The control room is able to monitor, talkback, control playback, volume and many other element for each room.

#### Why did you create this?
This is a digital version of an analog system created to help with reading disabilities treatment.

#### What can it do?
The application is in its early stages but already implements: 
* One central *control room (ADMIN)* that can connect & control and listen to many *listening rooms (USERS)*.
* Admin can recive many connections but send data commands only for one room at a time (While listening...)
* WebRTC (PeerJS) - handles peer 2 peer connection for data and audio streaming connection.
* Web Audio API is used to handle Stream to Audio Context / Audio Context  to Stream & Gain control over audio elements.
* Node serverside API handles authentication and data fetching from mongoDB.
* Pitch Detection - *optional* for triggering audio context oscillator over the User playback.
* Heavy workload (Audio Context, Stream Generation & Pitch Detection )implemented on the user side to prevent overloading the admin.
* Node scans assets/books folder and generates media database.
* Audio is buffered and streamed to client.
* Centrelized state managment with React Context System.
* Visual indicators for the online status of each room: 
    * *grey* - disconnected
    * *green* - connected 
    * *orange* - listening to room

*While listening to a room admin can:*

* Start, Stop, Pause, FF, Rewind audio playback
* Hold talkback button to interact with current room
* Activate / Deactive Pitch detection Oscillator and ajust the OSC gain.
* View current room playback time

## REQUIREMENTS
* *UPDATED CHROME OR FIREFOX* - for Audio HTML elements stream capture
* *GET OPEN SSL Certificate* - save as server.cert + server.key - for serving HTTPS (Required for proper audio context streams otherwise mose browsers will silence the output).
* *Create media library* - server/assets/books, each subfolder will be logged in the DB, each file in subfolder will be added as parts array. *NOTE:*(This project refers to audio books but you can change the scan path...)
* *SETUP ENV VARIABLES* - PORT, HOST, DEV_DB_URL
* *Run* : npm install, num run build || num run start-build (with nodemon)
* *This project runs localy* to provide service without internet connection.

## Available Scripts

In the project directory, you can run:

### `npm build-start`

Builds the app for production to the `build` folder.<br>
Builds react and serves with nodemon

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

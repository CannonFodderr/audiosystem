# Multi-Room Control/Monitoring Audio System
#### MERN Stack, WebRTC, Audio API

#### TL`DR
Imagine a recording studio control room only with multiple recording rooms.
The control room is able to monitor, talkback, control playback, volume and many other element for each room. This is a digital version of an analog system created to help with reading disabilities treatment.

#### Can I try it?
Yep but, This is a local project that supposed to work offline. 
You can download the **Electron Demo Server** which also includes some media assets to try out the app.

##### Electron Setup

* **Windows Only**
* Running a mongoDB service is required.
* [Download and unzip the file](https://drive.google.com/open?id=1CPRC5LDkLggWuIbdhVyE5Hot5TP597MS "Electron Demo").
* Run "Audio System.exe" to run the local server.
* Open 2 chrome/firefox tabs for Admin and User - 
##### if you are connecting from a remote computer use your IPv4 address instead of localhost.
##### **Tab 1 - Admin**
* Enter Admin credentials:
    * Username: admin
    * Password: admin
* Setup Room 0 and save.
##### **Tab 2 - User**
* Enter User credetials (Change numbers for diffrent rooms):
    * Username: Room 0
    * Password: Room0
* **Enjoy!**

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
* *UPDATED CHROME OR FIREFOX* - for Audio HTML elements stream capture.
* An active MongoDB **local** service.
* *GET OPEN SSL Certificate* - save as server.cert + server.key - for serving HTTPS (Required for proper audio context streams otherwise mose browsers will silence the output).
* *Create media library* - server/assets/books, each subfolder will be logged in the DB, each file in subfolder will be added as parts array. *NOTE:*(This project refers to audio books but you can change the scan path...)
* *SETUP ENV VARIABLES* - PORT, HOST, DEV_DB_URL
* *Run* : npm install, num run build || num run start-build (with nodemon)
* *This project runs localy* to provide service without internet connection.

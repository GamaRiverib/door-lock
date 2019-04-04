# Door Lock
Door Lock solution includes Mongoose based firmware (with embedded WebApp) for ESP8266 and Mobile App NativeScript based

## tl;dr
It is a simple and basic solution to remotely control, through WiFi, the opening of an electric lock. Using a WiFi module ESP8266 connected to it (relay for opening and integrated magnetic signal).

### Firmware (with embedded web app)
The Firmware is based on Mongoose OS, and it is written and read to the corresponding pins through RPC, as well as the reading and writing of the configuration of the module, it includes the credentials of the access point. A Web application embedded in the firmware is included to check the status of the door, control it and configure the controller module (pins and access to the network).

### Mobile App
Additionally, a mobile application based on NativeScript is included, which basically offers the same functions as the embedded Web application.

## Requirements
* Install NodeJS and NPM
* Install Mongoose OS CLI (mos)
* Install NativeScript CLI (tns)

### Compilation of the Web application
1. Download the source code from the repository.
2. Go to the Embedded folder and install the dependencies (npm i)
3. Compile the solution (npm run build)
4. Replace (if necessary) the driver path (change http://192.168.0.1/rpc to / rpc) in the generated app.js file

### Compile the firmware
5. Copy the app.js file to the folder **fs** of the Firmware project.
6. Compile and generate the firmware (mos build --platform esp8266).
7. Flash the firmware in the controller (mos flash).

### Configure device
8. Find the access point that the controller lifts (see file mos.yml to know or set the name and password)
9. Connect through the computer or cellphone to the access point and access to http://192.168.4.1
10. In the Embedded Web application, enter the menu, Settings.
12. Set the SSID and password of your router.
13. Optionally, establish the relay and magnetic pins.
14. Press the save button.

### Using
15. Search for the device in your network and connect using the IP address that was assigned to it.
16. Control your electric lock.

### Generate mobile application
17. Compile the mobile application (tns build android)
18. Install the generated .apk file on your device
19. Add the device using the IP address assigned to it.
20. Control your electric lock from the mobile application.
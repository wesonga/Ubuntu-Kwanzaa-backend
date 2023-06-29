<h1 align="center">Golden Time - Backend 🛸</h1>
<h3 align="center">For 2023 Google Developers Solution Challenge</h3>
<p align="center">
  <img src="https://user-images.githubusercontent.com/11978494/228843932-c59e03fb-d4e7-458d-a548-58e80583a7ea.png" alt="icon" width="250" height="250">
</p>

## Overview
This is our service Golden Time's backend repository which only contains content about backend logic. Please visit [Android for Golden Time](https://github.com/gdsc-ys/golden-time-android) to get more general information about our service. [Wear OS for Golden Time](https://github.com/gdsc-ys/golden-time-wearos) is also available. Or please refer our submission or introduction video to find out what we are looking for!

## API Base URL
http://gdsc-next.com:3000 (Only during the competition!)

We strongly recommend to clone and run this locally to prevent unexpected problem during the competition.

## Endpoints
Please refer to [APISpec.md](https://github.com/gdsc-ys/golden-time-backend/blob/main/APISpec.md) to know which request parameters are needed and how the responses look like for each endpoint.

### SOS
|Name|Method|URL|
|-|-|-|
|Make new SOS|POST|/sos|
|See current SOS situation|GET|/sos/:sos_id|
|Report my location|POST|/sos/:sos_id/rescuer/location|
|Accept rescue request|POST|/sos/:sos_id/rescuer/accept|
|Notify my arrival|POST|/sos/:sos_id/rescuer/arrived|
|Notify the situation is over|POST|/sos/:sos_id/done|
|See rescuers status|POST|/sos/:sos_id/rescuers|

### Disease
|Name|Method|URL|
|-|-|-|
|Get a list of diseases|GET|/disease?ids=1,2,3 (Get entire list if no ids specified)|
|Get information of specific disease|GET|/disease/:disease_id|

### Case
|Name|Method|URL|
|-|-|-|
|Get a list of cases|GET|/case|
|Get information of specific case|GET|/case/:case_id|

## Technologies
- Node.js with express, firebase-admin, forever, morgan, mysql, nodemon
- Firebase
- MySQL

## Prerequisites
- Node.js: v18.12.1 (minimum)
- MySQL: v8.0.32 (minimum)
- Firebase Project and its Project Key
- Google Cloud Platform Project (to deploy)

## Getting Started
1. Clone the project.
    ```bash
    git clone https://github.com/gdsc-ys/golden-time-backend.git
    ```
2. Make folder `/auth` which will contain your authentication information.
3. Make `fbAuth.json` in `/auth` to save your Firebase authentication information with following format:
    ```json
    {
        "type": "",
        "project_id": "",
        "private_key_id": "",
        "private_key": "",
        "client_email": "",
        "client_id": "",
        "auth_uri": "",
        "token_uri": "",
        "auth_provider_x509_cert_url": "",
        "client_x509_cert_url": ""
    }
    ```
4. Make `sqlAuth.json` in `/auth` to save you MySQL authentication information with following format:
    ```json
    {
        "host": "",
        "user": "",
        "password": "",
        "database": ""
    }
    ```
5. Run MySQL command line and run `source databaseDump.sql;` to set up database and some sample datas. If you are re-setting the database, note that you should delete the previous database with ```drop database `gdsc-ys-golden-time`;```.
6. Run `npm init` to initialize app you cloned. This will automatically install all of the required packages.
7. Run `npm start` to execute the server. You can make the app to run persistently with some packages you prefer. I will provide an example of deploying server with `tmux` and `forever`.
    ```bash
        tmux new -s deploy
        forever --minUpTime=1000 --spinSleepTime=1000 start -c ‘npm start’ ./
    ```
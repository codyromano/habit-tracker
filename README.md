# Habit Tracker
### A web app that helps you form long-lasting, positive life habits.
![http://habits.elasticbeanstalk.com](http://s18.postimg.org/9939haahl/Screenshot_2015_10_10_22_45_28.png)

### How it works

* Describe an activity you want to do regularly.
* A progress bar appears. Tap it to "level up" in that activity.
* Your progress bar constantly drains down. If you slack off, you'll lose a level.

  #### [Live Demo](http://habits.elasticbeanstalk.com)

### Tech Overview

* **Front-end:** React.js
* **Server:** Node.js with Gulp
* **Data Storage:** AWS - DynamoDB
* **Hosting Environment:** AWS - Elastic Beanstalk

### Set Up for Local Development

#### Dependencies
* [Node](https://nodejs.org) - version 0.12.0 or greater
* [SASS](http://sass-lang.com/) - version 3.3.4 or greater

1. [Fork and clone this repo](https://github.com/codyromano/habit-tracker#fork-destination-box)
2. Go to the repo's root directory and install dependencies: 
    ```
    npm install
    ```

3. Set up your appConfig file:
    ```
    cp appConfig.example.json appConfig.json
    ```
    In the copied file you'll notice two placeholders for secret keys. AWS uses the keys to access DynamoDB. Unfortunately        you'll need to [message me](http://codyromano.com/contact/) for credentials. (I apologize for the convenience; creating a     mock data service is on my To Do list.)
    
4. Start the server: 
    ```
    npm start
    ```
  
5. View the app in your browser: 
    ```
    open http://localhost:8081/
    ```

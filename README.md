# Habit Tracker
### A web app that helps you form long-lasting, positive life habits.
![](http://s18.postimg.org/9939haahl/Screenshot_2015_10_10_22_45_28.png)

### How it works

* Describe an activity you want to do regularly.
* A progress bar will appear. Tap the bar and mark the habit as "done" to level up in that activity.
* Your progress bar constantly drains down. If you slack off, you'll lose a level.

### Tech Overview

* **Front-end:** React.js
* **Server:** Node.js with Gulp
* **Data Storage:** AWS - DynamoDB
* **Hosting Environment:** AWS - Elastic Beanstalk

### Set Up

1. [Fork this repo](https://github.com/codyromano/habit-tracker#fork-destination-box)
2. Go to the project's root directory and install dependencies: 
    ```
    npm install
    ```

3. Set up your appConfig file:
    ```
    cp appConfig.example.json appConfig.json
    ```
    In the copied file you'll notice two placeholders for secret keys. AWS uses the keys to access DynamoDB. Unfortunately        you'll need to [message me](http://codyromano.com/contact/) for credentials. (I apologize for the convenience; creating a     mock data service is on my To Do list.)

4. If you're not editing CSS, you can skip to Step #5. To make CSS-related changes you need [SASS](http://sass-lang.com/). With SASS installed, navigate to the project's root directory and run: 
    ```
    cd public/styles
    sass --watch main.scss --style compressed
    ```
    SASS will generate a new `main.css` whenever a `.scss` file changes. `main.scss` is the primary SASS file, which              references all the other stylesheets. (Note that this step up of setup could be replaced with a `Gulp` task in Node. Also     on my To Do list.)
5. Start the server: 
    ```
    npm start
    ```
  
6. Navigate to the following URL in your browser: 
    ```
    http://localhost:8081/
    ```

#React.run

[React.run](http://www.react.run)

[![React.run Demonstration](http://img.youtube.com/vi/Mjo-LVRaL7M/0.jpg)](http://www.youtube.com/watch?v=Mjo-LVRaL7M)


## What is it?

React.run is an in-browser tool that allows you to write, run, and experiment writing
[React](https://facebook.github.io/react/) components in the browser with no additional tools or configuration. It is the fastest way to get started learning the patterns and practices of React.

##Features

* Automatic Babel transpilation of React JSX/ES6 code
* Create and save multiple revisions
* Add external Javascript and CSS resources
* Track the state of your component, save that state to the server, and "rehydrate" the state when the revision is loaded

Even more features are on the horizon. We are tracking features we would like implement in the [Roadmap](https://github.com/RinconStrategies/react-run/blob/master/roadmap.md)

## Building

React.run is built with a [KoaJS](http://koajs.com/) server, and stores data using [Mongoose](http://mongoosejs.com/) 
and a [MongoDB](https://www.mongodb.org) database. 

### Global dependencies
Ensure you have the following global dependencies installed

* [NodeJS](https://nodejs.org/en/)
* [GulpJS](http://gulpjs.com/)
* [MongoDB](https://www.mongodb.org)

### Setting up environment

React.run uses [dotenv](https://www.npmjs.com/package/dotenv) to define process variables for local development. Currently React.run uses just two variables. ```MONGOLAB_URI```
or ```MONGO_URI```. The ```MONGOLAB_URI``` is used for the production database. To run React.run locally, you will need to define
one of these variables in your environment. You can do this by setting up a .env in the root directory with a
 [Mongo URI](https://docs.mongodb.org/v2.6/reference/connection-string/) string to your local database-

```
MONGO_URI=mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
```

The simplest version of this with a local mongo instance would look like - ```MONGO_URI=mongodb://localhost/reactrun```


### Running the code
Once the dependencies have been installed, you can run

```npm run develop``` 

to start the build process and the local server. 

### Running the tests

There aren't tests currently, but we are working on some!


## Contributing
Contributions are welcome! We have a lot of ideas in the [Roadmap](https://github.com/RinconStrategies/react-run/blob/master/roadmap.md), and bugs and features flagged in the issues. Feel 
free to tackle any of the un-implemented features. Please make sure if you plan on tackling a feature, that you 
call it out in an issue so we can talk about it.

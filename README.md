
  <h1 align="center">An Application to Process Azure Event Hub Data and Store in MongoDB</h1>
    <p align="center">


## Description
The goal of this assessment is to develop an application that reads data from an Azure Event Hub and sends them to different Service Bus queues based on specific criteria. Subsequently, the application should listen to the queues, retrieve the messages, and store them in a MongoDB database for further processing and analysis. The project will require the use of [Nest](https://github.com/nestjs/nest), TypeScript, MongoDB, Azure Event Hub, and Azure Service Bus.

### Tips
<ul>
  <li>Consider using MongoDB Atlas, a fully managed cloud database, for handling scalability, backups, monitoring, and more.</li>
  <li>Database Sharding/Partitioning: For extremely large datasets, consider sharding to distribute data across multiple machines.</li>
  <li>Microservices: If appropriate, structure your application as microservices to allow different parts of your system to scale independently.</li>
  <li>For more scalability I suggest separating this app into two serverless microservices; one for receiving events from Azure Event Hub, and sending them to another microservice by Azure Service Bus. another microservice for receiving data from Azure Service Bus queue and saving it into MongoDB storage </li>
</ul>

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Stay in touch

- Author - [Ahmad Sobhani](mailto://ahmad.sobhani@hotmail.com)
- LinkedIn - [Ahmad Sobhani](https://www.linkedin.com/in/ahmad-sobhani-4449108b/)

## License

[MIT licensed](LICENSE).

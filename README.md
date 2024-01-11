# Firefly Home Task

## Author [Alex](mralxizr@gmail.com)

### How To Start Project Environment

This project depends on several services that are running inside a docker container, within a docker compose environment. We must pay attention to this small nuance and have [Docker](https://docs.docker.com/desktop/install/mac-install/) installed in our operating system before attempting to execute this command and run this project locally.

there is a bash file that does it partially **start_application.sh**

start

```bash
>    docker compose up -V --remove-orphans --force-recreate --build -d
```

stop

```bash
>    docker compose down
```

### Project Tech Stack

- Docker
- Nodejs runtime
- Typescript
- MongoDB - persistent database
- Redis - caching layer
  - [UI Console](http://localhost:8001)
- Kafka [Redpanda](https://redpanda.com/) for event streaming
  - Broker
  - [UI Console](http://localhost:8080)

## Application Flow In Steps

| Step | Domain              | Description                                                                                           | Comments                                                                                                                                                                                                              |
| ---- | ------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Epilogue            | enter                                                                                                 | run **start_application.sh** in terminal                                                                                                                                                                              |
| 2    | Epilogue            | bootstrap application environment                                                                     | .env file is located in /app/src/config folder <br><br>static files are located in /app/src/assets. <br><br>this service responsible for bootstrapping the application data in the cache and the database, **then it is querying the database on an interval to get the top 10 word occurrences**.                                     |
| 3    | Epilogue            | spin up Redis Docker container                                                                        |
| 4    | Epilogue            | spin up MongoDB Docker container                                                                      |
| 6    | Epilogue            | spin up Red Panda Kafka Broker Docker container                                                       |
| 7    | Epilogue            | spin up Red Panda Kafka Console Management UI Docker container                                        |
| 8    | Main Business Logic | read words bank file                                                                                  |
| 9    | Main Business Logic | validate and filter bank words                                                                        | should be case insensitive                                                                                                                                                                                            |
| 10   | Main Business Logic | create Redis cache layer                                              | valid word saved as the key with initial value 0                                                                                                                                                                      |
| 11   | Main Business Logic | read urls file and insert to topic                                                                    | implemented as a triple partition Topic, achieves the same behavior like rabbitmq queue, single message to single consumer. <br><br>Topic configured with 3 consumers, 3 partitions, 1 consumer group and 1 producer                  |
| 12   | Main Business Logic | consume urls 1 by 1 to get all essay words                                                            | need to use rate limiter on the request. <br><br> implemented with axios npm package leveraging the axios single instance. limit defined to 3 req / 666 milliseconds. <br><br> this is deployed as a triple instance service with 3 partitions on the topic                                                                |
| 13   | Main Business Logic | insert all essay html response to topic                                                               | this service responsible for making the HTTP GET request, get the HTML response, and then pass it forward to the next service for parsing. <br><br>requests are throttled.                                                                               |
| 14   | Main Business Logic | consume html response from topic, parse and split text on whitespace. insert words to next topic      | consuming topic: _KAFKA_HTMLS_TOPIC_. <br><br>producing to topic: _KAFKA_WORDS_TOPIC_. <br><br>parsing implemented leveraging npm package Cheerio, which is similar to beautiful soup in python and/or jsoup in java.  <br><br>configured as 2 consumers, 2 partitions and 1 consumer group |
| 15   | Main Business Logic | consume essay words 1 by 1 and validate. validated essay words updated with word count in Redis cache | can use the Redis UI console to check it out                                                                                                                                                                          |
| 17   | Main Business Logic | persist to database                | persisting to the database implemented with additional topic, 1 consumer, 1 consumer group and 1 producer. this topic acts as full on rabbitmq queue                                                                                                                                                                                                               |
| 18   | Prologue            | query top 10 words.  | |
| 19   | Prologue            | print json to console in a table format| use bootstrap service to watch output|


## Microservices Description

| Domain | Topic             | Consumer Group       | Partitions | Description |
| ------ | ----------------- | -------------------- | ---------- | ----------- |
| url    | KAFKA_URLS_TOPIC  | URLS_CONSUMER_GROUP  | 3 | |
| html   | KAFKA_HTMLS_TOPIC | HTMLS_CONSUMER_GROUP | 2 | |
| word   | KAFKA_WORDS_TOPIC | WORDS_CONSUMER_GROUP | 1 | |
| word   | KAFKA_PERSIST_DB_TOPIC | PERSIST_DB_CONSUMER_GROUP | 1 | |
| database  | | | | MongoDB NoSql  |
| cache | | | | Redis |
| Kafka Broker  | | | | RedPanda  |
| Kafka UI  |  |  | | RedPanda |

## Nuances:

- provided with a shell script for the application bootstrap.
- provided with links to the local ui console for Redis and Kafka
- provided with docker compose file\* mandatory application information located in a **.env** file
- domain separation implemented with folder structure
- implemented rate limiter and assigned to http client singleton instance with 3 requests / 666 milliseconds
- implemented cache layer with redis
- implemented asynchronous event streaming solution using kafka, topics and pubsub
- i scaffolded this project from scratch instead of using Nestjs which comes fully equipped with microservices support. i wanted to show a full solution with no dependencies.
- created util functions as factory to create different services, such as, producers, consumers, http and other
- all messages are acknowledged manually
- testing locally requires Docker.
- you can control the number of urls to scan, please see .env file
- you can scale and service to any amount you'd like. please see docker file and service urls-service

- pay attention that this is not a production grade solutions as it is missing proper error handling, logging, fallbacks, custom exceptions, dependency injection, meta programming, aka, abstract classes and interfaces for reusability in same domain areas and more


## Rant

- i had a small bug that writing to the database using the mongodb client that i missed and it consumed valuable time
- the rate limiting package has a bug when using redis if rate limiting is distributed. many github issues are still pending for resolution   

Thank you,  
best of luck  
Alex

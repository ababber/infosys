# azure basics

> Azure Serverless Functions, also known as Azure Functions, are a platform-as-a-service (PaaS) offering by Microsoft Azure that enables developers to run event-driven, serverless workloads. With Azure Functions, developers can focus on writing the code to address specific problems without worrying about managing infrastructure.

## serverless functions

### Resources

* [azure fns node.js dev guide](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node?tabs=javascript%2Cwindows%2Cazure-cli&pivots=nodejs-model-v4)

### Key Features

* Event-Driven:
  * Azure Functions are triggered by events such as HTTP requests, messages in a queue, file uploads, database changes, and more.
  * They integrate seamlessly with other Azure services (e.g., Azure Storage, Event Grid, Service Bus) and third-party services.

* Serverless:
  * Developers don't need to provision or manage servers. Azure handles the infrastructure, including scaling, availability, and maintenance.
  * Pay-per-execution: Costs are based on the number of executions and resources consumed (compute time, memory).

* Scalability:
  * Automatically scales up or down based on workload demand.
  * Supports both consumption-based plans (auto-scaling) and dedicated plans (fixed resources).

* Multi-Language Support:
  * Azure Functions can be written in various programming languages, including:
  * C#
  * JavaScript/TypeScript
  * Python
  * Java
  * PowerShell
  * Custom handlers for other languages.

* Integration:
  * Deep integration with Azure ecosystem services like Cosmos DB, Logic Apps, Key Vault, and more.
  * Support for third-party APIs via connectors.

### Typical Use Cases

* HTTP API Endpoints:
  * Build lightweight APIs or microservices that handle HTTP requests.

* Data Processing:
  * Process data in real-time or batch (e.g., analyze files uploaded to Azure Blob Storage).

* Automation:
  * Automate repetitive tasks such as scheduled maintenance or sending reminders.

* Event Handling:
  * React to events from Azure Event Hub, Service Bus, or Event Grid.

* IoT:
  * Process telemetry data from IoT devices.

### Execution Models

* Consumption Plan:
  * Fully serverless and scales automatically.
  * Pay only for the compute resources consumed while your code runs.

* Premium Plan:
  * Offers advanced features like reserved instances, VNet integration, and longer execution timeouts.

* Dedicated (App Service) Plan:
  * Run functions on dedicated VMs in an App Service environment for consistent performance.

### Benefits

* Cost-Effective: Pay only for the resources used during execution.
* Agility: Rapid development and deployment of functions.
* Flexibility: Write code in the language of choice and integrate with a wide range of services.
* Ease of Use: Simplifies complex workflows through triggers and bindings.

### Setup

* install `azure-cli`

```sh

```

* install `azure-functions`

```sh
brew tap azure/functions
brew install azure-functions-core-tools@4
```

* init `azure-functions`

```sh
mkdf myFuncApp
func init
# select runtime: node, javascript
```

* add an `HTTP trigger` function

```sh
func new
# select template: HTTP trigger
# name function: funcName
# DO NOT REPLACE TEMPLATE TO ENSURE EVERYTHING WORKS!
```

* test locally

```sh
func start

# if started correctly, output will have:

# Functions:

# funcName: [GET,POST] http://localhost:7071/api/funcName
```

* test a `GET` req

```sh
curl -X GET "http://localhost:7071/api/<funcName>" | cat
```

* test a `POST` req

```sh
curl -X POST "http://localhost:7071/api/httpTrigger" -H "Content-Type: application/json" -d '{"name": "Ankit"}' | cat
```

* to publish

```sh
az login
# then follow prompts
```

```md
0. if first time creating a function app (also easiest method)
1. go to [azure portal](https://portal.azure.com/)
2. select create a resource -> function app
3. select create and walk through prompts
4. create resource groups etc...
```

```sh
func azure functionapp publish funcName
```

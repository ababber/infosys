# azure basics

> Azure Serverless Functions, also known as Azure Functions, are a platform-as-a-service (PaaS) offering by Microsoft Azure that enables developers to run event-driven, serverless workloads. With Azure Functions, developers can focus on writing the code to address specific problems without worrying about managing infrastructure.

## serverless functions

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

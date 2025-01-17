# Azure Devops Basics

## Resources

* [azure devops docs](https://learn.microsoft.com/en-us/azure/devops/get-started/?view=azure-devops)
* [azure dashboards](https://learn.microsoft.com/en-us/azure/devops/report/dashboards/overview?view=azure-devops)
* [azure boards docs](https://learn.microsoft.com/en-us/azure/devops/boards/?view=azure-devops)
* [add features and epics](https://learn.microsoft.com/en-us/azure/devops/boards/boards/kanban-epics-features-stories?view=azure-devops)
* [define features and epics](https://learn.microsoft.com/en-us/azure/devops/boards/backlogs/define-features-epics?view=azure-devops&tabs=agile-process)
* [add tasks](https://learn.microsoft.com/en-us/azure/devops/boards/sprints/add-tasks?view=azure-devops)
* [change azure process](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/change-process-basic-to-agile?view=azure-devops)
* [create/manage inherit process](https://learn.microsoft.com/en-us/azure/devops/organizations/settings/work/manage-process?view=azure-devops#change-the-process-used-by-a-project)

## Dev Ops Overview

### 1. Azure Boards

* Purpose: Agile project management and work tracking.
* Features:
  * Work item tracking for tasks, bugs, user stories, and epics.
  * Kanban boards, Scrum boards, and backlogs to visualize and organize work.
  * Dashboards and analytics for tracking progress and performance.
  * Use Case: Manage and monitor team workflows, ensuring alignment with project goals.

### 2. Azure Repos

* Purpose: Source code version control.
* Features:
  * Supports Git and Team Foundation Version Control (TFVC).
  * Branching and pull requests for collaborative development.
  * Code reviews with inline comments and feedback.
  * Integrated CI/CD pipeline support.
  * Use Case: Version control for managing source code and collaboration among developers.

### 3. Azure Pipelines

* Purpose: Continuous integration and continuous delivery (CI/CD).
* Features:
  * Build, test, and deploy code automatically across platforms.
  * Supports multiple languages and frameworks (e.g., .NET, Java, Python, Node.js).
  * Integration with GitHub, Bitbucket, and other version control systems.
  * Scalable with cloud-hosted agents or self-hosted agents.
  * Use Case: Automating builds and deployments for faster and more reliable software delivery.

### 4. Azure Test Plans

* Purpose: Manual and exploratory testing.
* Features:
  * Manage test cases, plans, and test suites.
  * Perform manual testing with detailed tracking.
  * Collect and analyze feedback from exploratory testing.
  * Integration with Azure Boards for tracking test results.
  * Use Case: Ensure software quality by integrating testing into the development lifecycle.

### 5. Azure Artifacts

* Purpose: Package management and artifact sharing.
* Features:
  * Host and share Maven, NPM, Python, NuGet, and Universal packages.
  * Create and maintain package feeds within an organization.
  * Upstream sources for consuming packages from public repositories.
  * Use Case: Manage and distribute reusable code packages securely within development teams.

### 6. Extensions Marketplace

* Purpose: Enhance and customize Azure DevOps functionality.
* Features:
  * Access to a wide range of third-party and Microsoft-developed extensions.
  * Integration with other tools like Slack, Jira, and Docker.
  * Build custom extensions to address specific needs.
  * Use Case: Extend Azure DevOps capabilities to fit unique workflows and toolchains.

## ADO Dashboard

> An Azure DevOps (ADO) Dashboard is a customizable, interactive workspace within Azure DevOps that provides a visual representation of project data and metrics. Dashboards are designed to help teams monitor progress, track performance, and gain insights into their projects by displaying key information in a single, easily accessible location.

### 1. Key Features of an ADO Dashboard

* Customizable Layout:
  * Users can design the dashboard by adding, resizing, and arranging widgets to suit their needs.
  * Supports multiple dashboards for different teams or project phases.

* Widgets:
  * Dashboards are built using widgets, which are small, interactive components that display specific data or metrics.
  * Examples of widgets include:
    1. Query Results: Displays the results of a custom query.
    2. Charts: Visualizes work items, builds, or test data.
    3. Burndown/Burnup Charts: Tracks progress against project goals.
    4. Team Velocity: Shows the team's sprint velocity over time.
    5. Pull Request Overview: Summarizes the status of pull requests.
    6. Pipeline Status: Displays the latest build or release status.

* Real-Time Updates:
  * Dashboards provide live data from Azure DevOps services, ensuring up-to-date insights.

* Collaboration:
  * Dashboards can be shared among team members to promote transparency and collaboration.
  * Permissions can be set to control who can view or edit a dashboard.

* Integration:
  * Dashboards integrate seamlessly with Azure Boards, Repos, Pipelines, Test Plans, and Artifacts.
  * Users can link widgets to specific work items, queries, or pipelines for deeper exploration.

### 2. Use Cases for ADO Dashboards

* Team Monitoring:
  * Track sprint progress, completed tasks, and remaining workload.
  * Visualize team velocity and identify potential blockers.

* Project Management:
  * Monitor key project milestones and deliverables.
  * Display burnup or burndown charts to ensure alignment with timelines.

* DevOps Insights:
  * Track CI/CD pipeline health, build durations, and deployment success rates.
  * Visualize code coverage and test pass rates.

* Quality Assurance:
  * Monitor test case execution and defect trends.
  * Identify areas of high bug density or test coverage gaps.

### 3. How to Create and Use an ADO Dashboard

* Access the Dashboard:
  * Navigate to the Azure DevOps project.
  * Select the "Dashboards" tab from the sidebar.

* Create a New Dashboard:
  * Click on the "+ New Dashboard" button.
  * Name the dashboard and set its visibility (team or project-wide).

* Add Widgets:
  * Click on "Add Widget" to browse the available widgets.
  * Configure each widget by connecting it to relevant data (e.g., work items, pipelines).

* Customize Layout:
  * Drag and drop widgets to organize the layout.
  * Resize widgets to display information effectively.

* Share the Dashboard:
  * Use sharing settings to grant access to team members or stakeholders.

## EPIC -> FEATURE -> PBI -> TASKS

### EPIC

> In the context of project management, particularly within Agile and Azure DevOps (ADO), an Epic is a large body of work that can be broken down into smaller tasks, stories, or work items. It represents a high-level objective or requirement that typically spans multiple sprints or iterations and involves collaboration across teams.

#### 1. Characteristics of an Epic

* High-Level Scope:
  * Epics define the overarching goals or deliverables of a project.
  * They are typically broad in scope and not immediately actionable.

* Decomposable:
  * Epics can be broken down into smaller units like Features, User Stories, or Tasks to facilitate incremental work.

* Longer Duration:
  * Completing an epic often takes weeks or months and spans multiple iterations or sprints.

* Alignment with Goals:
  * Each epic aligns with business objectives or user needs, ensuring that work contributes to the overall success of a project.

* Tracking and Progress:
  * In tools like Azure DevOps, epics can be tracked for their status, progress, and dependencies.

#### 2. Hierarchy in Azure DevOps

> In Azure DevOps, work items are structured hierarchically to organize work

* Epics:
  * The highest level of work item, representing large, strategic initiatives.

* Features:
  * Represent functional groupings or components of an epic.

* User Stories/Tasks:
  * Individual pieces of work or functionality that contribute to features and, ultimately, the epic.

#### 3. Example of an Epic

> Epic: "Develop a Mobile Banking Application"

* Features:
  * User Authentication
  * Account Management
  * Transaction Processing
  * Notifications System

* User Stories for "User Authentication":
  * "As a user, I want to log in using my email and password."
  * "As a user, I want to reset my password if I forget it."
  * "As a user, I want to enable two-factor authentication for enhanced security."

#### 4. Benefits of Using Epics

* Strategic Vision:
  * Keeps teams focused on delivering high-value objectives aligned with business goals.

* Clarity and Organization:
  * Simplifies complex projects by breaking them into manageable pieces.

* Prioritization:
  * Helps stakeholders prioritize work at a high level before diving into details.

* Progress Tracking:
  * Provides a clear view of how smaller tasks contribute to larger objectives.

#### 5. Managing Epics in Azure DevOps

* Creating an Epic:
  * Navigate to Boards > Work Items.
  * Select New Work Item and choose Epic.
  * Define the title, description, and any relevant details like priority or effort.

* Linking Features and Stories:
  * Use the "Add link" feature to associate features or stories with the epic.

* Tracking Progress:
  * Use dashboards, queries, and charts to monitor the status of epics and their child items.

### FEATURE

> In the context of Dashboards and DevOps, particularly within Azure DevOps (ADO), Features refer to a mid-level work item type that represents a functional area or grouping of related tasks, designed to deliver a specific value or capability to the user. Features are used to break down Epics (larger, high-level objectives) into manageable, actionable units of work.

#### 1. Key Aspects of Features in Azure DevOps

* Mid-Level Work Item:
  * Features bridge the gap between high-level Epics and more granular User Stories or Tasks.

* Purpose:
  * Represent specific functionality or components required to achieve the goals defined by an Epic.

* Hierarchy:
  * Epic → Feature → User Story/Task
  * Each Feature is linked to an Epic, and each Feature contains multiple User Stories or Tasks.

* Timeframe:
  * Completing a Feature typically spans a few sprints, depending on its complexity.

* Focus on Delivering Value:
  * Features encapsulate a deliverable or capability that provides tangible value to the user or business.

#### 2. Features in the Context of Dashboards

> In Azure DevOps, dashboards allow teams to visualize the progress and status of Features and related work. Features appear as part of the project’s work tracking and are often monitored using the dashboard.

* Tracking Progress:
  * Dashboards can display widgets showing the status of Features, such as:
    1. Percentage completed.
    2. Features by status (e.g., Active, Resolved, Closed).
    3. Burnup charts showing progress toward completing Features.

* Dependencies and Hierarchy:
  * Features can be displayed in dashboards to highlight their relationship with Epics and Stories.
  * Work item widgets allow tracking related child items (User Stories or Tasks) associated with a Feature.

* Reporting and Metrics:
  * Dashboards can provide metrics like:
    1. Total Features in progress.
    2. Features completed during a sprint or release cycle.
    3. Time spent on specific Features.

#### 3. Example of a Feature

> Epic: "Develop a Mobile Banking Application"

* Feature 1: "Implement User Authentication"
  * User Stories:
    1. "As a user, I want to log in using my email and password."
    2. "As a user, I want to reset my password if I forget it."
    3. "As a user, I want to enable two-factor authentication."

* Feature 2: "Enable Transaction Processing"
  * User Stories:
    1. "As a user, I want to transfer money to another account."
    2. "As a user, I want to view my transaction history."

#### 4. Benefits of Using Features

* Organized Development:
  * Features help organize work into logical, manageable groupings, making it easier to track progress.

* Alignment with Goals:
  * By linking Features to Epics, teams ensure their work aligns with high-level project goals.

* Scalable Work Management:
  * Features enable teams to handle larger projects efficiently by breaking them into actionable parts.

* Clear Value Delivery:
  * Each Feature delivers a distinct part of the product’s value, making progress measurable and meaningful.

#### 5. How to Manage Features in Azure DevOps

* Create a Feature:
  * Go to Boards → Work Items → New Work Item → Feature.
  * Fill in the title, description, and other fields (e.g., priority, effort).

* Link Features to Epics:
  * Use the Link Work Items feature to associate Features with their parent Epics.

* Add User Stories or Tasks:
  * Break down Features into smaller work items and link them under the Feature.

* Monitor via Dashboards:
  * Use widgets like Query Results, Charts, or Progress Trackers to display the status of Features.

### PBI (PRODUCT BACKLOG ITEM)

> In the context of Azure DevOps (ADO) and Dashboards, a PBI (Product Backlog Item) refers to a specific type of work item commonly used in Scrum-based projects. PBIs represent individual units of work, such as user stories, tasks, or requirements, that deliver value to the end-user and contribute to the completion of a larger Feature or Epic.

#### 1. Key Characteristics of PBIs

* Smallest Workable Units:
  * PBIs are smaller, actionable work items that can be completed in a single sprint.
  * They are more detailed and focused than Features or Epics.

* Focus on Value Delivery:
  * Each PBI describes functionality or changes that provide value to the user or customer.

* Scrum Framework:
  * PBIs are central to Scrum projects, serving as the items in the Product Backlog that are prioritized and planned for sprints.

* Hierarchy in Azure DevOps:
  * Epic → Feature → PBI (Product Backlog Item)
  * PBIs may also have child tasks that further break down the work.

* Flexible Terminology:
  * In some projects or organizations, PBIs might be referred to as User Stories, Requirements, or simply Backlog Items depending on the team's processes.

#### 2. PBIs in the Context of Dashboards

> Azure DevOps dashboards allow teams to track, monitor, and visualize the progress of PBIs and related work. Here's how PBIs fit into dashboards

* Status Tracking:
  * Widgets can display PBIs by their status, such as:
    1. Active, Committed, In Progress, or Completed.
    2. Remaining work (effort) for all PBIs in the sprint or backlog.

* Queries and Reporting:
  * Custom queries can be used to filter PBIs by criteria like priority, assignee, or status, and the results displayed on the dashboard.

* Burndown/Burnup Charts:
  * Charts that show the completion rate of PBIs against sprint goals.
  * Useful for tracking sprint or release progress.

* Progress Visualization:
  * PBIs can be visualized as part of hierarchical reports, such as Features and their associated PBIs.
  * Dashboards can show completion rates, average cycle time, or lead time for PBIs.

* Task-Level Breakdown:
  * Dashboards can drill down into PBIs to show associated child tasks and their completion status.

#### 3. Example of PBIs

> Epic: "Develop a Mobile Banking Application"

* Feature: "User Authentication"
  * PBIs:
    1. "As a user, I want to log in using my email and password."
    2. "As a user, I want to reset my password if I forget it."
    3. "As a user, I want to enable two-factor authentication."

* Feature: "Account Management"
  * PBIs:
    1. "As a user, I want to view my account balance."
    2. "As a user, I want to update my contact information."

#### 4. How to Manage PBIs in Azure DevOps

* Create a PBI:
  * Go to Boards → Work Items → New Work Item → Product Backlog Item.
  * Fill in fields like title, description, acceptance criteria, priority, and effort estimation.

* Link PBIs to Features:
  * Use the Link Work Items feature to associate PBIs with their parent Features or Epics.

* Add Child Tasks:
  * Break PBIs into smaller tasks for tracking granular progress within a sprint.

* Track Progress in Dashboards:
  * Use widgets such as Query Results, Burndown Charts, or Kanban Boards to monitor PBIs in real time.

#### 5. Benefits of PBIs

* Focused Delivery:
  * PBIs help teams focus on delivering specific increments of value.

* Improved Planning:
  * Breaking down Features into PBIs enables better sprint planning and workload management.

* Transparency:
  * PBIs provide clear, actionable items that stakeholders can understand and track.

* Alignment with Goals:
  * Ensures that work aligns with broader objectives by linking PBIs to Features and Epics.

### TASKS

> In the context of Azure DevOps (ADO) and Dashboards, Tasks are the smallest, most granular work items used to track and manage specific activities or actions required to complete a Product Backlog Item (PBI), User Story, or Bug. Tasks help teams break down work into actionable, measurable components that can be assigned, tracked, and completed within a sprint or iteration.

#### Key Characteristics of Tasks

* Granular Work Units:
  * Represent specific activities or steps needed to complete higher-level work items like PBIs or Features.

* Actionable:
  * Tasks are concrete and specific, making them immediately actionable by the team.

* Time-Bound:
  * Typically small enough to be completed within hours or a single day.
  * Include estimates of effort or remaining work (measured in hours or story points).

* Hierarchy in Azure DevOps:
  * Epic → Feature → PBI (or User Story) → Task
  * Tasks are children of PBIs or User Stories, meaning they contribute directly to completing the parent work item.

* Trackable:
  * Tasks are tracked individually for progress, status, and assignment.

#### Tasks in the Context of Azure Dashboards

> Azure DevOps Dashboards allow teams to visualize and monitor the progress of Tasks as part of their workflow. Tasks are often included in dashboard visualizations to provide detailed insights into work execution.

* Status Tracking:
  * Widgets can display tasks by their status, such as:
  * To Do, In Progress, or Done.

* Effort Estimation and Burndown:
  * Dashboards can show:
  1. Remaining work (in hours or points) for tasks in a sprint or project.
  2. Burndown charts reflecting task completion over time.

* Progress Reporting:
  * Query-based widgets or charts can display how many tasks are completed, in progress, or pending.

* Task-Level Views:
  * Dashboards can include detailed views that allow drilling down into tasks under PBIs or User Stories.

* Sprint Workload:
  * Dashboards may highlight task distribution among team members to ensure balanced workloads.

#### Example of Tasks

> Epic: "Develop a Mobile Banking Application"

* Feature: "User Authentication"
* PBI: "As a user, I want to log in using my email and password."
* Tasks:
  * "Design the login UI."
  * "Implement backend API for login authentication."
  * "Write unit tests for authentication logic."
  * "Perform user acceptance testing (UAT) for login feature."

#### How to Manage Tasks in Azure DevOps

* Create a Task:
  * Navigate to Boards → Work Items → New Work Item → Task.
  * Fill in the title, description, remaining work (time estimate), and other relevant fields.

* Link Tasks to Parent Work Items:
  * Use the Link Work Items feature to associate Tasks with PBIs, User Stories, or Bugs.

* Update Task Status:
  * As work progresses, update the status (e.g., In Progress, Done) and adjust the remaining effort.

* Track via Dashboards:
  * Use widgets like Query Results, Work Item Charts, or Burndown Charts to track the status and progress of tasks in real-time.

#### Benefits of Using Tasks

* Granularity:
  * Breaks down large work items into specific, actionable steps.

* Clarity:
  * Ensures all team members understand their responsibilities and next steps.

* Progress Monitoring:
  * Provides detailed visibility into how work is progressing at a micro-level.

* Improved Sprint Planning:
  * Helps estimate workloads and distribute tasks effectively among team members.

* Transparency:
  * Allows stakeholders to track the detailed progress of ongoing work.

## Change the process from Basic -> Agile

* use the resource to navigate menu
* Steps to manually update your work items and board settings:
  1. Update the column to state mapping for each Team Kanban Board.
  2. Update existing work items using the right work item types set by the target process.
  3. Update existing work items using the correct state model in the target process.

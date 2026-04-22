# Architecture Decision Document - GHC-AI Doctor Mobile App

## Table of Contents

- [Architecture Decision Document - GHC-AI Doctor Mobile App](#table-of-contents)
  - [stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
inputDocuments: [
"_bmad-output/planning-artifacts/prd/index.md",
"_bmad-output/planning-artifacts/ux-design-specification/index.md",
"docs/reverse-engineering/00-system-overview/system-architecture-survey.md"
]
workflowType: 'architecture'
project_name: 'GHC-AI'
user_name: 'Itobeo'
date: '2026-04-21'
architecturalFocus: 'Fast to ship and demo, multi-platform support with Android-first focus'
technologyStack: 'React Native + Expo SDK 55 + TypeScript + React Native Paper v5'
coreDecisions:
stateManagement: 'SWR'
httpClient: 'Axios'
authentication: 'Expo SecureStore + 30-min timeout'
testing: 'Jest + React Native Testing Library'
theming: 'React Native Paper MD3 + OpenMRS O3 brand'
patternsEnforced: true
projectStructureDefined: true
validationComplete: true
status: 'COMPLETE'](#stepscompleted-1-2-3-4-5-6-7-inputdocuments-bmad-outputplanning-artifactsprdmd-bmad-outputplanning-artifactsux-design-specificationmd-docsreverse-engineering00-system-overviewsystem-architecture-surveymd-workflowtype-architecture-projectname-ghc-ai-username-itobeo-date-2026-04-21-architecturalfocus-fast-to-ship-and-demo-multi-platform-support-with-android-first-focus-technologystack-react-native-expo-sdk-55-typescript-react-native-paper-v5-coredecisions-statemanagement-swr-httpclient-axios-authentication-expo-securestore-30-min-timeout-testing-jest-react-native-testing-library-theming-react-native-paper-md3-openmrs-o3-brand-patternsenforced-true-projectstructuredefined-true-validationcomplete-true-status-complete)
  - [Project Context Analysis](./project-context-analysis.md)
    - [Requirements Overview](./project-context-analysis.md#requirements-overview)
    - [Technical Constraints & Dependencies](./project-context-analysis.md#technical-constraints-dependencies)
    - [Cross-Cutting Concerns Identified](./project-context-analysis.md#cross-cutting-concerns-identified)
  - [Starter Template Evaluation](./starter-template-evaluation.md)
    - [Primary Technology Domain](./starter-template-evaluation.md#primary-technology-domain)
    - [Starter Options Considered](./starter-template-evaluation.md#starter-options-considered)
    - [Selected Starter: Expo Default Template (SDK 55)](./starter-template-evaluation.md#selected-starter-expo-default-template-sdk-55)
  - [Core Architectural Decisions](./core-architectural-decisions.md)
    - [Decision Priority Analysis](./core-architectural-decisions.md#decision-priority-analysis)
    - [Data Architecture & State Management](./core-architectural-decisions.md#data-architecture-state-management)
    - [API Integration & Communication](./core-architectural-decisions.md#api-integration-communication)
    - [Authentication & Security](./core-architectural-decisions.md#authentication-security)
    - [Testing Strategy](./core-architectural-decisions.md#testing-strategy)
    - [Error Handling & Network Resilience](./core-architectural-decisions.md#error-handling-network-resilience)
    - [Environment Configuration](./core-architectural-decisions.md#environment-configuration)
    - [Material Design 3 Theming](./core-architectural-decisions.md#material-design-3-theming)
    - [Project Structure & Code Organization](./core-architectural-decisions.md#project-structure-code-organization)
    - [Development Workflow & Tooling](./core-architectural-decisions.md#development-workflow-tooling)
    - [Decision Impact Analysis](./core-architectural-decisions.md#decision-impact-analysis)
  - [Implementation Patterns & Consistency Rules](./implementation-patterns-consistency-rules.md)
    - [Pattern Categories Defined](./implementation-patterns-consistency-rules.md#pattern-categories-defined)
    - [Naming Patterns](./implementation-patterns-consistency-rules.md#naming-patterns)
    - [Structure Patterns](./implementation-patterns-consistency-rules.md#structure-patterns)
    - [Format Patterns](./implementation-patterns-consistency-rules.md#format-patterns)
    - [Communication Patterns](./implementation-patterns-consistency-rules.md#communication-patterns)
    - [Process Patterns](./implementation-patterns-consistency-rules.md#process-patterns)
    - [Enforcement Guidelines](./implementation-patterns-consistency-rules.md#enforcement-guidelines)
    - [Pattern Examples](./implementation-patterns-consistency-rules.md#pattern-examples)
  - [Project Structure & Boundaries](./project-structure-boundaries.md)
    - [Complete Project Directory Structure](./project-structure-boundaries.md#complete-project-directory-structure)
    - [Architectural Boundaries](./project-structure-boundaries.md#architectural-boundaries)
    - [Requirements to Structure Mapping](./project-structure-boundaries.md#requirements-to-structure-mapping)
    - [Integration Points](./project-structure-boundaries.md#integration-points)
    - [File Organization Patterns](./project-structure-boundaries.md#file-organization-patterns)
    - [Development Workflow Integration](./project-structure-boundaries.md#development-workflow-integration)
  - [Architecture Validation & Completion](./architecture-validation-completion.md)
    - [Coherence Validation](./architecture-validation-completion.md#coherence-validation)
    - [Requirements Coverage Validation](./architecture-validation-completion.md#requirements-coverage-validation)
    - [Implementation Readiness](./architecture-validation-completion.md#implementation-readiness)
    - [Architecture Validation Summary](./architecture-validation-completion.md#architecture-validation-summary)
  - [Next Steps](./next-steps.md)

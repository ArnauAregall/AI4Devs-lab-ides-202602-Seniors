Please analyze and fix the following ticket, which is provided as a markdown user story:

# Add Candidate to the System

```
As a recruiter, 
I want to have the ability to add candidates to the ATS system, 
so that I can efficiently manage their data and selection processes.
```

# Acceptance Criteria:

- Feature accessibility: There must be a clearly visible button or link to add a new candidate from the recruiter's main dashboard page.
- Data entry form: Upon selecting the option to add a candidate, a form must be presented that includes the necessary fields to capture the candidate's information such as first name, last name, email, phone, address, education, and work experience.
- Data validation: The form must validate the entered data to ensure it is complete and correct. For example, the email must have a valid format and mandatory fields must not be empty.
- Document upload: The recruiter must have the option to upload the candidate's CV in PDF or DOCX format.
- Addition confirmation: Once the form is completed and the information submitted, a confirmation message must appear indicating that the candidate has been successfully added to the system.
- Errors and exception handling: In case of an error (e.g., server connection failure), the system must display an appropriate message to the user to inform them of the problem.
- Accessibility and compatibility: The functionality must be accessible and compatible with different devices and web browsers.

## Notes:

- The interface must be intuitive and easy to use to minimize the training time required for new recruiters.
- Consider the possibility of integrating autocomplete functionality for the education and work experience fields, based on pre-existing data in the system.

# Technical Tasks:

- Implement the user interface for the add candidate form.
- Develop the backend necessary to process the information entered in the form.
- Ensure the security and privacy of the candidate's data.

Follow these steps:

1. Act as a product expert with strong technical knowledge.
2. Understand the problem described in the ticket and compare it with the user story and acceptance criteria above.
3. Decide whether or not the User Story is completely detailed according to product's best practices: include a full description of the functionality, a comprehensive list of fields to be updated, the structure and URLs of the necessary endpoints, the files to be modified according to the architecture and best practices, the steps required for the task to be considered complete, how to update any relevant documentation or create unit tests, and non-functional requirements related to security, performance, etc.
4. If the user story lacks the technical and specific detail necessary to allow the developer to be fully autonomous when completing it, provide an improved story that is clearer, more specific, and more concise in line with product best practices described in step 3. Use the technical context you will find in @documentation. Return it in markdown format.
5. Produce a markdown output that contains two clearly separated sections, using h2 headings: `## [original]` and `## [enhanced]`. Under `## [original]`, include the original ticket content. Under `## [enhanced]`, include your improved, production-ready user story with all necessary technical details, following the structure and best practices above.


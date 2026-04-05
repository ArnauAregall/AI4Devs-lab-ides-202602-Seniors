## ADDED Requirements

### Requirement: Change-password form is only accessible to authenticated users
The frontend SHALL render the change-password form only within a `ProtectedRoute`-guarded route. Unauthenticated users who navigate to the route SHALL be redirected to `/login`.

#### Scenario: Unauthenticated access to change-password route redirects to login
- **WHEN** a user navigates to the change-password route without a valid in-memory access token and the silent refresh also fails
- **THEN** the user SHALL be redirected to `/login`

#### Scenario: Authenticated user can access the change-password form
- **WHEN** a user navigates to the change-password route with a valid in-memory access token
- **THEN** the form SHALL render with three password inputs: current password, new password, and confirm new password

### Requirement: Change-password form renders three password fields and a submit button
The `ChangePasswordForm` component SHALL render an input of type `password` for each of the following fields: `currentPassword`, `newPassword`, and `confirmNewPassword`. It SHALL also render a submit button.

#### Scenario: Form renders all required fields on load
- **WHEN** the change-password route is rendered
- **THEN** the page SHALL display three password inputs (current password, new password, confirm new password) and a submit button

### Requirement: Change-password form validates fields client-side before calling the API
The form SHALL perform client-side validation on submission before dispatching the API call. It SHALL display a specific inline error beneath the relevant field for each unmet rule without clearing non-sensitive inputs.

#### Scenario: Empty form submission shows inline required-field errors
- **WHEN** the form is submitted with all fields empty
- **THEN** the form SHALL NOT call the API and SHALL display an inline error beneath each empty field

#### Scenario: New password failing strength rules shows specific inline errors
- **WHEN** `newPassword` does not meet one or more strength rules (min 8 chars, uppercase, lowercase, digit, special character)
- **THEN** the form SHALL display a distinct error message beneath the `newPassword` field for each unmet rule without clearing the `confirmNewPassword` field

#### Scenario: Mismatched passwords shows inline error on confirmation field
- **WHEN** `newPassword` and `confirmNewPassword` differ at submission
- **THEN** the form SHALL display "Passwords do not match." beneath the `confirmNewPassword` field

### Requirement: Change-password form displays server-returned errors inline without losing non-sensitive input
When the API returns a `400` error, the form SHALL map each `fieldError` to the corresponding input and display the message inline. The values of `newPassword` and `confirmNewPassword` fields SHALL be cleared. The value of non-password-content fields SHALL be preserved where applicable, but both new-password fields SHALL be cleared to prompt re-entry. The current password field SHALL also be cleared.

#### Scenario: Server error for incorrect current password shown inline
- **WHEN** the API responds with `400` and `{ "field": "currentPassword", "message": "Current password is incorrect." }`
- **THEN** the form SHALL display "Current password is incorrect." beneath the current password input and SHALL clear all three password fields

#### Scenario: Server error for password strength shown inline
- **WHEN** the API responds with `400` and a `newPassword` field error
- **THEN** the form SHALL display the error message beneath the new password input

#### Scenario: Server error for mismatched passwords shown inline
- **WHEN** the API responds with `400` and `{ "field": "confirmNewPassword", "message": "Passwords do not match." }`
- **THEN** the form SHALL display "Passwords do not match." beneath the confirm new password input

### Requirement: Change-password form disables the submit button and indicates loading during API call
While the `PATCH /api/v1/auth/password` request is in flight, the form SHALL disable the submit button and SHALL display a loading indicator or label to prevent duplicate submissions.

#### Scenario: Submit button is disabled during submission
- **WHEN** the form has been submitted and the API request is in progress
- **THEN** the submit button SHALL be disabled and SHALL indicate a loading state

### Requirement: Change-password form displays a success confirmation message after a successful update
On a `200` response from the API, the form SHALL display an inline confirmation message "Your password has been changed successfully." and SHALL clear all three password fields.

#### Scenario: Successful password change shows confirmation message
- **WHEN** the API responds with `200 OK`
- **THEN** the form SHALL display "Your password has been changed successfully." and SHALL clear all three password input fields

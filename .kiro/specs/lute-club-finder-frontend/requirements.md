# Requirements Document: Lute Club Finder Frontend

## Introduction

The Lute Club Finder is a web application designed to help Pacific Lutheran University (PLU) students discover and engage with campus clubs. The system connects to an existing Firebase Firestore backend containing 55 migrated PLU clubs and provides role-based access for students, club leaders, and administrators. This document specifies the Phase 1 MVP requirements for the React frontend application.

## Glossary

- **Authentication_System**: The component responsible for user sign-in, email verification, and session management
- **Club_Discovery_Interface**: The browsable grid view of all clubs with search and filter capabilities
- **Club_Detail_Page**: The individual page displaying comprehensive information about a single club
- **Matching_Quiz**: The 5-question assessment that recommends clubs based on user preferences
- **Admin_Portal**: The administrative interface for managing clubs, users, and roles
- **User**: Any authenticated person using the system (student, club_leader, or admin)
- **Student**: A user with basic access to browse and save clubs
- **Club_Leader**: A user who manages one or more clubs
- **Admin**: A user with full system access including user and club management
- **PLU_Email**: An email address ending with @plu.edu domain
- **Club_Card**: A visual component displaying club summary information in the grid layout
- **Match_Percentage**: A numerical score (0-100) indicating compatibility between user and club
- **Protected_Route**: A route that requires authentication to access
- **Firestore**: The Firebase database containing clubs, users, events, and quiz data

## Requirements

### Requirement 1: User Authentication with Email Restriction

**User Story:** As a PLU student, I want to sign in with my @plu.edu email, so that I can access the club finder system securely.

#### Acceptance Criteria

1. WHEN a User attempts Google Sign-In, THE Authentication_System SHALL verify the email domain is @plu.edu
2. IF the email domain is not @plu.edu, THEN THE Authentication_System SHALL reject the sign-in and display an error message "Please use your @plu.edu email address"
3. WHEN a User attempts email/password registration, THE Authentication_System SHALL verify the email domain is @plu.edu before creating the account
4. WHEN authentication succeeds, THE Authentication_System SHALL create a session token valid for 30 days
5. THE Authentication_System SHALL store the user role (student, club_leader, or admin) in the session
6. WHEN a User signs out, THE Authentication_System SHALL invalidate the session token and redirect to the login page

### Requirement 2: Role-Based Access Control

**User Story:** As a system administrator, I want different user roles to have appropriate access levels, so that sensitive features are protected.

#### Acceptance Criteria

1. WHEN a Student accesses the application, THE Authentication_System SHALL grant access to club browsing, search, quiz, and saved clubs features
2. WHEN a Club_Leader accesses the application, THE Authentication_System SHALL grant access to all Student features plus club editing for their assigned clubs
3. WHEN an Admin accesses the application, THE Authentication_System SHALL grant access to all features including user management and full club CRUD operations
4. WHEN a User attempts to access a route above their permission level, THE Authentication_System SHALL redirect to the home page and display "Access denied"
5. THE Authentication_System SHALL verify role permissions on every protected route navigation
6. WHEN a User's role is updated in Firestore, THE Authentication_System SHALL refresh the session within 5 minutes

### Requirement 3: Protected Route Navigation

**User Story:** As a developer, I want unauthenticated users redirected to login, so that protected content remains secure.

#### Acceptance Criteria

1. WHEN an unauthenticated User attempts to access a Protected_Route, THE Authentication_System SHALL redirect to the login page
2. WHEN redirection occurs, THE Authentication_System SHALL store the intended destination URL
3. WHEN authentication succeeds, THE Authentication_System SHALL redirect to the stored destination URL
4. THE Authentication_System SHALL allow unauthenticated access to the login page, registration page, and public landing page
5. WHEN a User's session expires, THE Authentication_System SHALL redirect to login on the next route navigation

### Requirement 4: Club Discovery Grid Display

**User Story:** As a student, I want to browse all clubs in a visual grid, so that I can quickly scan available options.

#### Acceptance Criteria

1. WHEN a User navigates to the clubs page, THE Club_Discovery_Interface SHALL display all clubs in a responsive grid layout
2. THE Club_Discovery_Interface SHALL display 12 clubs per page
3. FOR EACH club, THE Club_Card SHALL display the club logo, name, short description (truncated to 100 characters), category, and up to 3 tags
4. WHEN the viewport width is below 768px, THE Club_Discovery_Interface SHALL display 1 club per row
5. WHEN the viewport width is between 768px and 1024px, THE Club_Discovery_Interface SHALL display 2 clubs per row
6. WHEN the viewport width is above 1024px, THE Club_Discovery_Interface SHALL display 3 clubs per row
7. WHEN a User clicks a Club_Card, THE Club_Discovery_Interface SHALL navigate to that club's detail page

### Requirement 5: Club Search Functionality

**User Story:** As a student, I want to search for clubs by name, so that I can quickly find specific clubs I'm interested in.

#### Acceptance Criteria

1. THE Club_Discovery_Interface SHALL display a search input field at the top of the clubs page
2. WHEN a User types in the search field, THE Club_Discovery_Interface SHALL filter clubs where the club name contains the search text (case-insensitive)
3. THE Club_Discovery_Interface SHALL update the displayed results within 300ms of the last keystroke
4. WHEN no clubs match the search criteria, THE Club_Discovery_Interface SHALL display "No clubs found. Try different keywords."
5. WHEN the search field is cleared, THE Club_Discovery_Interface SHALL display all clubs again
6. THE Club_Discovery_Interface SHALL maintain search text in the URL query parameter for shareable links

### Requirement 6: Club Category Filtering

**User Story:** As a student, I want to filter clubs by category, so that I can focus on clubs that match my general interests.

#### Acceptance Criteria

1. THE Club_Discovery_Interface SHALL display a category filter dropdown with all 9 categories (academic, cultural, arts, service, sports, religious, professional, special_interest, governance)
2. WHEN a User selects a category, THE Club_Discovery_Interface SHALL display only clubs matching that category
3. THE Club_Discovery_Interface SHALL display an "All Categories" option that shows all clubs
4. THE Club_Discovery_Interface SHALL display the count of clubs for each category in the dropdown
5. WHEN a category filter is active, THE Club_Discovery_Interface SHALL display a visual indicator showing the active filter
6. THE Club_Discovery_Interface SHALL allow clearing the category filter with a clear button

### Requirement 7: Club Tag Filtering

**User Story:** As a student, I want to filter clubs by tags, so that I can find clubs with specific interests or characteristics.

#### Acceptance Criteria

1. THE Club_Discovery_Interface SHALL display a tag filter interface with all available tags from Firestore
2. WHEN a User selects one or more tags, THE Club_Discovery_Interface SHALL display clubs that have ANY of the selected tags
3. THE Club_Discovery_Interface SHALL display the count of selected tags
4. WHEN multiple tags are selected, THE Club_Discovery_Interface SHALL use OR logic (clubs matching any tag are shown)
5. THE Club_Discovery_Interface SHALL allow removing individual tags from the active filter
6. THE Club_Discovery_Interface SHALL display a "Clear all tags" button when tags are selected

### Requirement 8: Combined Search and Filter

**User Story:** As a student, I want to use search and filters together, so that I can narrow down clubs precisely.

#### Acceptance Criteria

1. WHEN a User applies both search text and filters, THE Club_Discovery_Interface SHALL display clubs matching ALL criteria (AND logic)
2. THE Club_Discovery_Interface SHALL apply filters in this order: search text, then category, then tags
3. WHEN combined filters result in zero clubs, THE Club_Discovery_Interface SHALL display "No clubs match your criteria. Try removing some filters."
4. THE Club_Discovery_Interface SHALL display the total count of matching clubs
5. THE Club_Discovery_Interface SHALL persist all filter states in URL query parameters

### Requirement 9: Pagination Controls

**User Story:** As a student, I want to navigate through multiple pages of clubs, so that I can browse all available clubs efficiently.

#### Acceptance Criteria

1. WHEN more than 12 clubs match the current filters, THE Club_Discovery_Interface SHALL display pagination controls
2. THE Club_Discovery_Interface SHALL display page numbers, previous button, and next button
3. WHEN a User clicks a page number, THE Club_Discovery_Interface SHALL load that page and scroll to the top of the club grid
4. WHEN on the first page, THE Club_Discovery_Interface SHALL disable the previous button
5. WHEN on the last page, THE Club_Discovery_Interface SHALL disable the next button
6. THE Club_Discovery_Interface SHALL display "Page X of Y" text
7. WHEN filters change, THE Club_Discovery_Interface SHALL reset to page 1

### Requirement 10: Club Detail Information Display

**User Story:** As a student, I want to view complete club information, so that I can decide if I want to join.

#### Acceptance Criteria

1. WHEN a User navigates to a club detail page, THE Club_Detail_Page SHALL display the club logo, full name, full description, category, and all tags
2. THE Club_Detail_Page SHALL display the meeting schedule including day, time, and frequency
3. THE Club_Detail_Page SHALL display the meeting location
4. THE Club_Detail_Page SHALL display officer names and contact information
5. THE Club_Detail_Page SHALL display social media links (Instagram, Discord, Facebook) as clickable icons
6. WHEN a social media link is not provided, THE Club_Detail_Page SHALL hide that icon
7. THE Club_Detail_Page SHALL display a back button that returns to the previous page

### Requirement 11: Club Bookmarking

**User Story:** As a student, I want to save clubs I'm interested in, so that I can easily find them later.

#### Acceptance Criteria

1. THE Club_Detail_Page SHALL display a bookmark button (heart icon) in the top right corner
2. WHEN a User clicks the bookmark button on an unsaved club, THE Club_Detail_Page SHALL save the club to the user's saved clubs in Firestore
3. WHEN a User clicks the bookmark button on a saved club, THE Club_Detail_Page SHALL remove the club from saved clubs
4. THE Club_Detail_Page SHALL display a filled heart icon for saved clubs and an outline heart icon for unsaved clubs
5. WHEN the save operation completes, THE Club_Detail_Page SHALL display a toast notification "Club saved" or "Club removed"
6. THE Club_Detail_Page SHALL update the bookmark state within 500ms of the button click

### Requirement 12: Related Clubs Suggestions

**User Story:** As a student, I want to see related clubs on a club detail page, so that I can discover similar clubs.

#### Acceptance Criteria

1. THE Club_Detail_Page SHALL display a "Related Clubs" section at the bottom of the page
2. THE Club_Detail_Page SHALL show up to 4 related clubs based on matching category and tags
3. THE Club_Detail_Page SHALL prioritize clubs with the most matching tags
4. THE Club_Detail_Page SHALL exclude the current club from related suggestions
5. FOR EACH related club, THE Club_Detail_Page SHALL display a Club_Card with the same information as the grid view
6. WHEN a User clicks a related club, THE Club_Detail_Page SHALL navigate to that club's detail page

### Requirement 13: Matching Quiz Interface

**User Story:** As a student, I want to take a quiz to find clubs that match my interests, so that I can discover clubs I might not have found otherwise.

#### Acceptance Criteria

1. WHEN a User starts the quiz, THE Matching_Quiz SHALL display a welcome screen explaining the quiz purpose
2. THE Matching_Quiz SHALL display 5 questions sequentially, one at a time
3. FOR EACH question, THE Matching_Quiz SHALL display the question text and all answer options
4. THE Matching_Quiz SHALL display a progress indicator showing "Question X of 5"
5. WHEN a User selects an answer, THE Matching_Quiz SHALL enable the "Next" button
6. WHEN on the last question, THE Matching_Quiz SHALL display a "See Results" button instead of "Next"
7. THE Matching_Quiz SHALL allow navigating back to previous questions to change answers

### Requirement 14: Quiz Question Types

**User Story:** As a student, I want to answer different types of quiz questions, so that the matching algorithm can understand my preferences accurately.

#### Acceptance Criteria

1. WHERE a question is single-choice, THE Matching_Quiz SHALL allow selecting exactly one answer option
2. WHERE a question is multiple-choice, THE Matching_Quiz SHALL allow selecting one or more answer options
3. WHEN a User selects an answer in single-choice mode, THE Matching_Quiz SHALL deselect any previously selected answer
4. WHEN a User selects answers in multiple-choice mode, THE Matching_Quiz SHALL allow toggling each option independently
5. THE Matching_Quiz SHALL display a visual indicator (checkbox or radio button) appropriate to the question type
6. THE Matching_Quiz SHALL load question data from the quizQuestions collection in Firestore

### Requirement 15: Quiz Scoring Algorithm

**User Story:** As a developer, I want the quiz to calculate match percentages using weighted scoring, so that recommendations are accurate and meaningful.

#### Acceptance Criteria

1. WHEN the quiz is completed, THE Matching_Quiz SHALL calculate match scores for all clubs using the weighted algorithm
2. THE Matching_Quiz SHALL apply these weights: 35% interests, 25% time commitment, 20% vibes, 10% experience level, 10% meeting preferences
3. THE Matching_Quiz SHALL normalize each component score to a 0-100 scale before applying weights
4. THE Matching_Quiz SHALL calculate the final Match_Percentage as the weighted sum of all components
5. THE Matching_Quiz SHALL round Match_Percentage values to whole numbers
6. THE Matching_Quiz SHALL sort clubs by Match_Percentage in descending order

### Requirement 16: Quiz Results Display

**User Story:** As a student, I want to see my top club matches with explanations, so that I understand why each club was recommended.

#### Acceptance Criteria

1. WHEN quiz scoring completes, THE Matching_Quiz SHALL display the top 10 matching clubs
2. FOR EACH matched club, THE Matching_Quiz SHALL display the club logo, name, Match_Percentage, and a brief explanation
3. THE Matching_Quiz SHALL generate explanations based on the highest-weighted matching factors
4. THE Matching_Quiz SHALL display clubs in descending order by Match_Percentage
5. THE Matching_Quiz SHALL display a "View Club" button for each result that navigates to the Club_Detail_Page
6. THE Matching_Quiz SHALL display a "Retake Quiz" button that clears previous answers and restarts the quiz
7. THE Matching_Quiz SHALL display a "Save Results" button that stores the results in the user's Firestore profile

### Requirement 17: Quiz Results Persistence

**User Story:** As a student, I want my quiz results saved to my profile, so that I can review them later without retaking the quiz.

#### Acceptance Criteria

1. WHEN a User clicks "Save Results", THE Matching_Quiz SHALL store the quiz answers and match results in the user's Firestore document
2. THE Matching_Quiz SHALL store the timestamp of when the quiz was completed
3. THE Matching_Quiz SHALL store the top 10 club IDs and their Match_Percentage values
4. WHEN a User has previously taken the quiz, THE Matching_Quiz SHALL display a "View Previous Results" option on the welcome screen
5. WHEN a User views previous results, THE Matching_Quiz SHALL load the saved match data from Firestore
6. THE Matching_Quiz SHALL allow retaking the quiz, which overwrites previous results

### Requirement 18: Admin Dashboard Overview

**User Story:** As an admin, I want to see a dashboard with key metrics, so that I can monitor system usage and health.

#### Acceptance Criteria

1. WHEN an Admin navigates to the admin portal, THE Admin_Portal SHALL display a dashboard with summary statistics
2. THE Admin_Portal SHALL display the total number of clubs in the system
3. THE Admin_Portal SHALL display the total number of registered users
4. THE Admin_Portal SHALL display the number of users by role (students, club_leaders, admins)
5. THE Admin_Portal SHALL display the number of quiz completions in the last 30 days
6. THE Admin_Portal SHALL display the most popular clubs based on bookmark count
7. THE Admin_Portal SHALL refresh statistics when the page loads

### Requirement 19: Admin Club Management

**User Story:** As an admin, I want to create, edit, and delete clubs, so that I can maintain accurate club information.

#### Acceptance Criteria

1. THE Admin_Portal SHALL display a "Manage Clubs" section with a list of all clubs
2. THE Admin_Portal SHALL display a "Create New Club" button that opens a club creation form
3. WHEN an Admin clicks a club in the list, THE Admin_Portal SHALL open the club edit form
4. THE Admin_Portal SHALL display a delete button for each club
5. WHEN an Admin clicks delete, THE Admin_Portal SHALL display a confirmation dialog "Are you sure you want to delete [Club Name]?"
6. WHEN deletion is confirmed, THE Admin_Portal SHALL remove the club from Firestore and update the club list
7. THE Admin_Portal SHALL display success or error messages for all club operations

### Requirement 20: Club Edit Form

**User Story:** As an admin, I want to edit all club fields including uploading images, so that club information stays current.

#### Acceptance Criteria

1. THE Admin_Portal SHALL display a form with fields for club name, description, category, tags, meeting schedule, location, officers, and social links
2. THE Admin_Portal SHALL display an image upload field for the club logo
3. WHEN an Admin uploads an image, THE Admin_Portal SHALL validate the file is an image format (jpg, png, gif, webp)
4. WHEN an Admin uploads an image, THE Admin_Portal SHALL validate the file size is under 5MB
5. THE Admin_Portal SHALL upload the image to Firebase Storage and store the URL in Firestore
6. THE Admin_Portal SHALL display a preview of the uploaded image
7. THE Admin_Portal SHALL validate required fields (name, description, category) before allowing save
8. WHEN an Admin clicks "Save", THE Admin_Portal SHALL update the club document in Firestore
9. WHEN save succeeds, THE Admin_Portal SHALL display "Club updated successfully" and close the form

### Requirement 21: Admin User Management

**User Story:** As an admin, I want to view and manage user accounts, so that I can handle user issues and permissions.

#### Acceptance Criteria

1. THE Admin_Portal SHALL display a "Manage Users" section with a searchable list of all users
2. FOR EACH user, THE Admin_Portal SHALL display email, display name, role, and account creation date
3. THE Admin_Portal SHALL allow searching users by email or name
4. WHEN an Admin clicks a user, THE Admin_Portal SHALL open a user detail panel
5. THE Admin_Portal SHALL display a role dropdown for changing user roles
6. WHEN an Admin changes a user's role, THE Admin_Portal SHALL update the role in Firestore
7. THE Admin_Portal SHALL display a "Disable Account" button that prevents the user from signing in
8. WHEN account changes are saved, THE Admin_Portal SHALL display a confirmation message

### Requirement 22: Admin Role Assignment

**User Story:** As an admin, I want to assign club leader roles to specific clubs, so that club leaders can manage their clubs.

#### Acceptance Criteria

1. WHEN viewing a user with club_leader role, THE Admin_Portal SHALL display a "Managed Clubs" section
2. THE Admin_Portal SHALL display a dropdown of all clubs for assignment
3. WHEN an Admin selects a club, THE Admin_Portal SHALL add that club ID to the user's managedClubs array in Firestore
4. THE Admin_Portal SHALL display all currently assigned clubs with remove buttons
5. WHEN an Admin clicks remove, THE Admin_Portal SHALL remove that club ID from the user's managedClubs array
6. THE Admin_Portal SHALL validate that a club leader has at least one assigned club before saving
7. WHEN assignments are saved, THE Admin_Portal SHALL display "Club assignments updated"

### Requirement 23: Responsive Design Requirements

**User Story:** As a student using a mobile device, I want the application to work well on my phone, so that I can browse clubs anywhere.

#### Acceptance Criteria

1. THE Club_Discovery_Interface SHALL display a mobile-optimized layout on screens below 768px width
2. THE Club_Detail_Page SHALL stack all content vertically on mobile devices
3. THE Matching_Quiz SHALL display full-width questions and answers on mobile devices
4. THE Admin_Portal SHALL provide a mobile-responsive layout with collapsible navigation
5. WHEN on mobile, THE Authentication_System SHALL display a simplified navigation menu
6. ALL interactive elements SHALL have touch targets of at least 44x44 pixels
7. THE application SHALL be usable in both portrait and landscape orientations

### Requirement 24: Performance Requirements

**User Story:** As a student, I want pages to load quickly, so that I can browse clubs without frustration.

#### Acceptance Criteria

1. WHEN a User navigates to the clubs page, THE Club_Discovery_Interface SHALL display initial content within 2 seconds on a 3G connection
2. THE Club_Discovery_Interface SHALL implement lazy loading for club images
3. WHEN scrolling, THE Club_Discovery_Interface SHALL load images within 500ms of entering the viewport
4. THE application SHALL cache Firestore query results for 5 minutes to reduce database reads
5. THE Club_Detail_Page SHALL load and display content within 1.5 seconds
6. THE Matching_Quiz SHALL calculate results and display the results page within 1 second of clicking "See Results"
7. THE application SHALL achieve a Lighthouse performance score of 80 or higher

### Requirement 25: Accessibility Requirements

**User Story:** As a student using assistive technology, I want the application to be accessible, so that I can use all features independently.

#### Acceptance Criteria

1. ALL interactive elements SHALL be keyboard navigable using Tab, Enter, and arrow keys
2. THE Club_Discovery_Interface SHALL announce filter changes to screen readers
3. THE Matching_Quiz SHALL associate labels with form inputs using proper ARIA attributes
4. ALL images SHALL have descriptive alt text
5. THE application SHALL maintain a color contrast ratio of at least 4.5:1 for normal text
6. THE application SHALL maintain a color contrast ratio of at least 3:1 for large text and UI components
7. WHEN focus moves, THE application SHALL display a visible focus indicator
8. THE application SHALL use semantic HTML elements (nav, main, article, button) appropriately


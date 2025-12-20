Changelog - recent updates

- Fixed registration wizard navigation and validation
  - Added missing error message elements for `fullName`, `faculty`, `semester`, `section`
  - Corrected validation IDs in `students.js` so Next/Previous navigation works reliably
  - Guarded camera access when saving face image to avoid runtime errors
  - Added captured image preview in the confirmation pane (`#confirmImagePreview`)

- UX/data improvements
  - Added "Remove face image" action in Registered Students list to delete stored face images and free storage
  - Added `Academic Year` column to Registered Students table
  - Added dashboard stat *With Face Data* to show how many students have face images stored
  - CSV export omits face images to keep exports small

- Next steps
  - Manual verification in-browser and minor styling tweaks if needed
  - (Optional) Add an HV support to purge images in bulk

New additions:
- Implemented **autosave draft** while filling the registration form (localStorage key `student_registration_draft`) with a Restore Draft button.
- Implemented **auto-advance**: when a step's fields validate, the wizard advances automatically and supports Enter-to-next behavior.
- Draft is cleared on successful save or manual reset.

If you'd like, I can open a short PR with these changes or continue with additional UI/UX polish and automated tests.
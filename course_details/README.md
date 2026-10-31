# Editing courses

This is a static HTML/CSS/JavaScript website. The same course files work when you double-click `courses.html` and when you upload the website to static hosting. No PHP, Python, updater, generated catalog or fallback is needed.

## Add a course

1. Copy `_TEMPLATE.js` and rename the copy to your course name, for example `Python Programming.js`.
2. Edit the fields inside `window.registerISCTCourse({ ... });`. Keep that opening function call and its closing `);`. Use double quotes for text, `""` for blank text, and lists such as `["Python", "SQL"]`.
3. Choose the category and set `"published": true` when the course is ready to show.
4. Add its filename once to `course-list.js`:

```js
window.ISCT_COURSE_FILES = [
  "your-existing-course.js",
  "Python Programming.js"
];
```

Keep the other filenames already in your list. Put a comma between entries. Filenames in this list are relative to `course_details`, so do not add the folder name. Spaces in filenames are supported.

5. Save both files and refresh the Courses page.

For an existing course, edit its `.js` file, save and refresh. There is nothing to generate. When removing or renaming a file, also update its entry in `course-list.js`. When uploading the website, upload the changed course files and `course-list.js` too.

Only files in `course-list.js` are loaded. Do not list `_TEMPLATE.js` or `course-list.js` itself. The replaced JSON files and previous loader resources are preserved in `OLD_Resources/course_details_json` for reference; the website does not use them.

## Image brochures

Save course brochure images in `course_details/Brochures/` as JPG or PNG files. In the course's `.js` file, set:

```js
"brochure": {
  "show": true,
  "file": "course_details/Brochures/course-name.png"
}
```

Replace `course-name.png` with the exact image filename, including its extension. The path is relative to the website root, not the course file. The Brochure button opens the image in a popup over the page, both when opening the HTML locally and on static hosting. Close it with the close button, Escape, or a click outside the popup. Upload the `Brochures` folder with the website. The `test` course uses `Brochures/test.png` as a working mock example.

## Categories

Set `category` to one of these labels:

- `Coding & Development`
- `Civil & Architechture`
- `Mechanical & Design`
- `Achademic`

`Civil & Architecture` is also accepted and goes under the existing Civil label. `sort_order` controls order within a category: lower numbers appear first. Set `published` to `false` to hide a course without removing its filename.

## Fields

| Field | What to enter / where it appears |
| --- | --- |
| `published` | `true` to display, `false` to keep as a draft. |
| `category`, `course_name` | Required for published courses. Category label and card title. |
| `tagline` | Short sentence under the card title. |
| `delivery_mode` | For example Online, Offline, Hybrid, or Self-paced. Appears on the card. |
| `duration` | Duration badge, for example `80 Hours` or `6 Months`. |
| `level` | For example Beginner, Intermediate, or Advanced. Appears on the card. |
| `skills` | List of software, technologies or skills, shown as tags. |
| `card.focus` | Short learning focus shown at the bottom of the card. |
| `card.banner` | Optional bottom strip, for example Admissions Open. |
| `card.icon` | Optional Bootstrap icon name, for example `bi-code-slash`. Blank uses the category icon. |
| `card.image` | Optional image path relative to the website root. Replaces the icon. |
| `projects.count` | Optional project count on the card. Use a number or text such as `15+`. |
| `batch.next_batch` | Confirmed date or date/time, written as you want it displayed. |
| `batch.enrolled_students` | Optional enrolled-student count. Zero is supported. |
| `overview`, `audience`, `prerequisites` | Full program information. `prerequisites` is a list. |
| `modules`, `learning_outcomes` | Lists shown in the supplied order inside program details. |
| `projects.description`, `projects.capstone` | Project information inside program details. |
| `certificate` | Certificate information inside program details. |
| `batch.timings`, `batch.location`, `batch.batch_size` | Batch information inside program details. |
| `fees`, `scholarship`, `contact` | Optional information inside program details. |
| `brochure.show`, `brochure.file` | Set `show` to `true` and provide an image path such as `course_details/Brochures/python.png` to display a Brochure link. |
| `program.show` | Set to `true` to display View Program; `false` displays no action. |
| `program.action` | `expand` opens the supplied details inside the card; `link` opens `program.url`. |
| `program.url` | Page path or HTTPS URL used only when `program.action` is `link`. |

Blank fields are omitted from the website. Brochure and View Program actions stay hidden unless you explicitly enable them. File and page paths are relative to the website root, for example `course_details/Brochures/python.png`. Course details are displayed as plain text, not HTML.

If a published file has invalid JavaScript, an invalid field type or an unknown category, the panel shows the filename and the issue instead of silently dropping the course. Valid files continue to load.

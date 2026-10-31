# Editing courses

The Courses page reads its cards from the JSON files in this folder. There is one file per course. The existing courses have already been moved here; their card content is unchanged.

## Add a course

1. Copy `_TEMPLATE.json` and rename the copy to your course name, for example `Python Programming.json`.
2. Fill in the values. Keep the property names, double quotes, brackets and commas intact. Use `""` for an empty text field and `[]` for an empty list. Add list entries as `["Python", "SQL"]`.
3. Set `published` to `true` when the course is ready to show.
4. From the website folder, run `python course_details/update_index.py` to register the new filename.
5. Refresh the Courses page.

When viewing through a web server, edits to an existing course only need saving and refreshing. Run the updater when you add, rename or remove files. Publish the `course_details` folder with the website, including `index.json` and `catalog.js`.

You can also double-click `courses.html` to preview it directly. Browsers block JSON fetching from local HTML files, so direct-file previews use the generated `catalog.js`. Run `python course_details/update_index.py` after every JSON edit when using this preview method, then refresh. Do not edit `catalog.js` directly; the JSON files remain the source of course content.

For a live JSON preview, start a local web server from the website folder with `python -m http.server 8000`, then open http://localhost:8000/. This reads existing JSON files directly on each page refresh.

## Categories

Set `category` to one of these labels:

- `Coding & Development`
- `Civil & Architechture`
- `Mechanical & Design`

`Civil & Architecture` is also accepted and goes under the existing Civil label. `sort_order` controls course order within its category: lower numbers appear first. Set `published` to `false` to hide a course. `_TEMPLATE.json` is never listed.

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
| `brochure.show`, `brochure.file` | Set `show` to `true` and provide a PDF/file path to display a Brochure link. |
| `program.show` | Set to `true` to display View Program; `false` displays no action. |
| `program.action` | `expand` opens the supplied details inside the card; `link` opens `program.url`. |
| `program.url` | Page path or HTTPS URL used only when `program.action` is `link`. |

Blank fields are omitted from the website. Brochure and View Program actions stay hidden unless you explicitly enable them. File and page paths are relative to the website root, for example `assets/brochures/python.pdf`. Course details are displayed as plain text, not HTML.

If a published file has invalid JSON, an invalid field type or an unknown category, the panel shows the filename and the issue instead of silently dropping the course. Valid files continue to load.

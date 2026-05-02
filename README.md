# Bible Explorer

A fast, minimal Bible study app with original language support (Hebrew/Greek), Strong's concordance, and multi-version search. Built with React + Vite + Tailwind. Works offline as a PWA.

---

## Stack

- **React + Vite** — frontend
- **Tailwind CSS v4** — styling (via `@tailwindcss/vite` plugin)
- **React Router** — routing
- **No state management library** — React hooks only
- **PWA** — `public/manifest.json` + `public/sw.js` (no plugin needed)

---

## Project Structure

```
bible-explorer/
├── public/
│   ├── data/                          ← generated Bible data (run processor first)
│   │   ├── kjv.json                   ← KJV verse text { "Gen.1.1": "In the beginning..." }
│   │   ├── drc.json                   ← Douay-Rheims verse text
│   │   ├── gnt-words.json             ← Greek NT word objects per verse
│   │   ├── ot-words.json              ← Hebrew OT word objects per verse
│   │   ├── strongs-greek.json         ← Greek Strong's definitions
│   │   ├── strongs-hebrew.json        ← Hebrew Strong's definitions
│   │   ├── chapter-index.json         ← chapter → verse ID list
│   │   ├── books.json                 ← book metadata
│   │   └── source/                    ← raw source files (not served)
│   │       ├── KJVA.json
│   │       ├── DRC.json
│   │       ├── strongs-greek-dictionary.js
│   │       ├── strongs-hebrew-dictionary.js
│   │       ├── stepbible/
│   │       │   └── Translators Amalgamated OT+NT/
│   │       │       ├── TAGNT Mat-Jhn*.txt
│   │       │       ├── TAGNT Act-Rev*.txt
│   │       │       ├── TAHOT Gen-Deu*.txt
│   │       │       ├── TAHOT Jos-Est*.txt
│   │       │       ├── TAHOT Job-Sng*.txt
│   │       │       └── TAHOT Isa-Mal*.txt
│   ├── manifest.json                  ← PWA manifest
│   └── sw.js                          ← service worker
│
├── src/
│   ├── data/
│   │   ├── versions.js                ← ⭐ single source of truth for all Bible versions
│   │   ├── apiClient.js               ← all data fetching (json or api mode)
│   │   ├── useBibleData.js            ← React hooks wrapping apiClient
│   │   └── searchParser.js            ← BibleGateway-compatible query parser
│   │
│   ├── components/
│   │   ├── nav/
│   │   │   ├── TopBar.jsx             ← header with passage label + mode toggle
│   │   │   ├── PassageDropdown.jsx    ← search + browse + version picker overlay
│   │   │   ├── SearchInput.jsx        ← search input with autocomplete
│   │   │   ├── AutocompleteList.jsx   ← suggested searches
│   │   │   ├── BookGrid.jsx           ← 66-book navigation grid
│   │   │   ├── ChapterGrid.jsx        ← chapter number picker
│   │   │   └── VersionSelector.jsx    ← translation radio buttons
│   │   │
│   │   ├── passage/
│   │   │   ├── ReaderView.jsx         ← prose reader mode (continuous text)
│   │   │   ├── VerseByVerseView.jsx   ← verse mode with original language + hover
│   │   │   ├── HoverableWord.jsx      ← clickable original language word
│   │   │   ├── WordGlossCard.jsx      ← hover card: word → definition → occurrences
│   │   │   └── ChapterNav.jsx         ← prev/next chapter arrows
│   │   │
│   │   └── ui/
│   │       ├── LoadingState.jsx
│   │       ├── ErrorState.jsx
│   │       ├── EmptyState.jsx
│   │       ├── SectionLabel.jsx
│   │       └── VerseReference.jsx
│   │
│   ├── pages/
│   │   ├── BibleReader.jsx            ← main reading page
│   │   ├── SearchResults.jsx          ← search results page
│   │   └── WordStudy.jsx              ← /word/G3056 shareable word study
│   │
│   ├── App.jsx                        ← routes
│   ├── main.jsx                       ← entry point + PWA registration
│   └── index.css                      ← @import "tailwindcss"
│
└── process-bible-data.mjs             ← data processor (run once)
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Download source data

```powershell
# Create source folder
mkdir public\data\source

# KJV with Apocrypha (scrollmapper)
# Download from: https://github.com/scrollmapper/bible_databases
# → sources/en/KJVA/KJVA.json → save as public/data/source/KJVA.json

# Douay-Rheims (scrollmapper)
# → sources/en/DRC/DRC.json → save as public/data/source/DRC.json

# Strong's dictionaries (openscriptures)
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js" -OutFile "public\data\source\strongs-greek-dictionary.js"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.js" -OutFile "public\data\source\strongs-hebrew-dictionary.js"

# Greek NT with morphology (STEPBible)
git clone https://github.com/STEPBible/STEPBible-Data public\data\source\stepbible

# Hebrew OT morphology is included in STEPBible above
```

### 3. Process the data

```bash
npm install xml2js --save-dev
node process-bible-data.mjs
```

This generates all files in `public/data/`. Takes ~30 seconds.

### 4. Run the app

```bash
npm run dev
```

---

## Adding a New Bible Version

Three steps, no refactoring needed.

**Step 1 — Get the source file**

Download the translation in scrollmapper JSON format into `public/data/source/`:
```json
{
  "books": [
    {
      "name": "Genesis",
      "chapters": [
        {
          "chapter": 1,
          "verses": [
            { "verse": 1, "text": "In the beginning..." }
          ]
        }
      ]
    }
  ]
}
```

**Step 2 — Process it**

In `process-bible-data.mjs`, add one block in section `[1] Bible translations`:

```js
if (fs.existsSync(`${SOURCE}/YLT.json`)) {
  console.log('  YLT...')
  const ylt = processTranslation(`${SOURCE}/YLT.json`)
  write('ylt.json', ylt)
}
```

Run: `node process-bible-data.mjs`

**Step 3 — Register it**

In `src/data/versions.js`:

```js
{
  versionId:  'YLT',
  label:      'YLT',
  fullName:   "Young's Literal Translation (1898)",
  language:   'english',
  isOriginal: false,
  dataFile:   'ylt.json',
  isDefault:  false,
},
```

Done. It appears in the version picker automatically.

---

## Switching to a Real API

In `src/data/apiClient.js`, change one line:

```js
const DATA_SOURCE = 'api'        // was 'json'
const API_BASE_URL = 'https://your-api.com/v1'
```

Expected API endpoints:

| Endpoint | Returns |
|----------|---------|
| `GET /versions` | Array of version objects |
| `GET /passage?book=John&chapter=1&versions=KJV,GNT` | Array of verse objects |
| `GET /search?q=love&type=keyword&versions=KJV` | Array of search results |
| `GET /strongs/G3056` | Strong's entry object |
| `GET /strongs/G3056/occurrences` | Array of search results |

Response shapes match the existing JSON file shapes — see `apiClient.js` comments for details.

---

## Search Format

Supports BibleGateway-compatible queries:

| Query | Result |
|-------|--------|
| `John 3:16` | Single verse |
| `John 3:16-18` | Verse range |
| `John 3` | Whole chapter |
| `Jn 3:16` | Abbreviated book name |
| `John 3.16` | Period as separator |
| `jn3:16` | No space |
| `Gen 1:1, 3` | Non-consecutive verses (comma = same chapter) |
| `Gen 1:1; Matt 5:1` | Semicolon = separate passages |
| `Matt 6:16, 18; 17:21` | Mixed |
| `G3056` | Strong's Greek number |
| `H430` | Strong's Hebrew number |
| `love faith` | Keyword AND |
| `love OR faith` | Keyword OR |
| `love -hate` | Keyword exclude |
| `"in the beginning"` | Exact phrase |

---

## Data Sources

All open license:

| Data | Source | License |
|------|--------|---------|
| KJV text | [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases) | Public domain |
| Douay-Rheims | [scrollmapper/bible_databases](https://github.com/scrollmapper/bible_databases) | Public domain |
| Greek NT (SBLGNT) + morphology | [STEPBible/STEPBible-Data](https://github.com/STEPBible/STEPBible-Data) | CC BY 4.0 |
| Hebrew OT (WLC) + morphology | [STEPBible/STEPBible-Data](https://github.com/STEPBible/STEPBible-Data) | CC BY 4.0 |
| Strong's Greek dictionary | [openscriptures/strongs](https://github.com/openscriptures/strongs) | CC BY-SA |
| Strong's Hebrew dictionary | [openscriptures/strongs](https://github.com/openscriptures/strongs) | CC BY-SA |

---

## PWA

The app installs as a PWA on mobile and desktop.

- `public/manifest.json` — app metadata and icons
- `public/sw.js` — cache-first service worker
- Service worker only activates in production (`npm run build`)
- Bible data files are cached on first load — works fully offline after that

To test PWA: `npm run build && npm run preview`

---

## Architecture Notes

**Data flow:**
```
versions.js          → defines what versions exist
process-bible-data   → downloads + processes source files → public/data/*.json
apiClient.js         → loads JSON files (or calls API)
useBibleData.js      → React hooks wrapping apiClient
components           → receive data as props, stateless
pages                → own state, compose components
```

**Key design decisions:**
- Every component is stateless and receives data as props
- `apiClient.js` is the only file that touches data sources
- `versions.js` is the only file that defines what versions exist
- `searchParser.js` is pure JS with no dependencies — fully testable
- Switching from JSON files to a real API requires changing one line

**Verse ID format:** `Book.Chapter.Verse` — e.g. `John.3.16`, `Gen.1.1`, `Ps.23.1`

**Word object shape:**
```js
{
  wordId:          'John.1.1.5',
  surface:         'λόγος',          // Greek/Hebrew characters
  transliteration: 'logos',
  strongsNumber:   'G3056',
  morphology:      'N-NSM',
  englishGloss:    'Word',
  definition:      'word, speech, divine reason...',
}
```

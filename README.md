# Auto on Render

A browser-based tool that turns a folder of photos into a fully formatted Word document in one shot — no manual pasting, no manual formatting.

## The problem this solves

A client of mine used to build survey/inspection reports by hand: open Word, paste in a photo, resize it, add a border, pick a color, set the caption font, move to the next photo, repeat. For a report with even a modest number of photos, that was 2-3 hours of repetitive, mind-numbing work every single time.

Now he just selects all his photos at once. The tool reads each image, corrects orientation, lays them out into a table, and applies the borders, colors, and fonts automatically — same result, about 5 minutes of his time instead of hours.

## Live demo

https://httpsmarinecargo-autoonrender.com/

## Tech stack

- **Next.js 14** (App Router) with **React 18** and **TypeScript**
- **Tailwind CSS** for styling
- **docx** for building the actual .docx file in the browser — tables, image cells, borders, fonts, and colors are all constructed programmatically with it
- **file-saver** to trigger the download once the document is packed
- **blueimp-load-image** for decoding images, fixing EXIF orientation, and rotating portrait shots to landscape before they go into the document
- **react-dropzone** for the file picker / drag-and-drop upload area
- **Firebase (Firestore)** backing a simple passcode-based login, used to gate access to the tool
- **lucide-react** for icons

## How it works

The app has three modes, all sharing the same core pipeline:

- **Normal Mode** — drop in your photos and get a clean two-column table of images with captions underneath, no extra configuration.
- **Pro Mode** — the same layout, but with control over border color, font, font size, font color, and auto-numbered captions (e.g. "Survey Photo No. 1", "Survey Photo No. 2", ...), plus optional image compression presets for keeping file size down on large batches.
- **Bulk Mode** — built for processing a large number of images at once.

Under the hood, every image is passed through `imageProcessor.ts`, which loads it, applies EXIF-correct orientation, rotates portrait images to landscape so they sit consistently in the layout, and optionally compresses it. The processed images are then handed to `docxGenerator.ts`, which builds a `docx` `Document` from scratch: a borderless or bordered table, one row per image pair, image cells sized to fixed dimensions, and a description row underneath with whatever font/color settings were chosen. The finished document is packed to a blob and downloaded straight to the browser — everything runs client-side, no server round-trip for the document generation itself.

---

**Ankit Singh**
[LinkedIn](https://www.linkedin.com/in/ankit-singh-117925249/)

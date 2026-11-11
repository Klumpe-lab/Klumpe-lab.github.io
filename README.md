# Klumpe Lab website

Source of the website of the Klumpe Lab at the IMP and IMBA, Vienna BioCenter.

**Live site:** https://klumpe-lab.github.io/

The site is plain HTML, CSS and JavaScript with no build step. GitHub Pages serves this repository directly from the `main` branch.

## Structure

| Path | Contents |
| --- | --- |
| `index.html` | Home page |
| `research.html` | Research themes |
| `people.html` | Team, honorary members, alumni and lab animals |
| `news.html` | News & fun |
| `publications.html` | Publication list with search and filters |
| `structures.html` | PDB/EMDB structure gallery |
| `software.html` | Software projects |
| `contact.html` | Join us (open positions) and contact details |
| `join.html` | Redirects to `contact.html#join` for old links |
| `assets/js/data.js` | **All list content**: people, alumni, publications, news, structures, software, sponsors |
| `assets/js/site.js` | Shared header, menu and footer, light/dark toggle, and the code that renders the lists from `data.js` |
| `assets/css/style.css` | All styles, including light and dark themes |
| `assets/img/` | Downsampled images used on the site (people, news, research) |
| `sponsors/` | Funder and partner logos |

## Editing content

Most updates only need a change to `assets/js/data.js`:

- **New person:** add an entry to `people` (name, role, bio, optional `photo` and `links`). The lab lead comes first; everyone else is sorted by surname.
- **Someone leaves:** move the entry from `people` to `alumni`.
- **News item:** add an entry to `news` (`date` as `YYYY-MM-DD` or `YYYY-MM`, `kind` `news` or `fun`, optional `image` / `imageLarge`).
- **Publication:** add an entry to `publications` (`type`: `article`, `preprint`, `review`, `chapter` or `patent`; optional `image`).
- **Structure:** add an entry to `structures` (PDB or EMDB ID). Thumbnails load from RCSB and EMDB.

The top menu is the `NAV` list at the top of `assets/js/site.js`.

Before adding images, downsample them (for example to WebP, 1600 px on the longest side) and put them in `assets/img/`. Full-size originals stay out of the repository; `images/` and `labpictures/` are ignored.

## Previewing locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765/. Opening the HTML files directly from disk does not load all assets.

## Publishing

Commit and push to `main`; GitHub Pages updates the live site within a minute or two.

```bash
git add -A && git commit -m "Update site" && git push
```

## License

- **Code** (HTML, CSS and JavaScript) is licensed under the [GNU General Public License v3.0](LICENSE).
- **Text and images** created by the Klumpe Lab are licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE-CONTENT). Please credit "Klumpe Lab, IMP/IMBA Vienna" and link to https://klumpe-lab.github.io/.

The following are **not** covered by these licenses and remain the property of their owners:

- Logos in `sponsors/`: trademarks of the respective institutions and funders.
- Portrait photos in `assets/img/people/`: rights remain with the people shown and their photographers.
- Structure images loaded from [RCSB PDB](https://www.rcsb.org) and [EMDB](https://www.ebi.ac.uk/emdb/), which are subject to those resources' own terms.

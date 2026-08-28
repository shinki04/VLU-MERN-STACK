---
layout: home

hero:
  name: "MERN Stack"
  text: "Shopping Online"
  tagline: "Learn how to build a full-stack e-commerce application using MongoDB, Express, React, and Node.js."
  image:
    src: /images/mern-logo-light.png
    alt: MERN Stack Logo
    dark: /images/mern-logo-dark.png
  actions:
    - theme: brand
      text: Get Started (Lab 1)
      link: /en/labs/lab1
    - theme: alt
      text: View Source
      link: https://github.com/shinki04/VLU-MERN-STACK
---

## Introduction

This is a personal project inspired by the Web Development course at Van Lang University (VLU). If you would like to contribute and improve this project, please feel free to open a **Pull Request (PR)**. Any contributions are highly appreciated!

### Important Notes

- **Environment Security (.env):** I use a customized `.env` configuration file, which differs from the lab guide, to ensure safety and security for sensitive credentials.
- **Legacy React Version:** This project uses a fairly old version of React (using Class Components instead of Functional Components and Hooks), following the exact specification of the university curriculum.
- **Convenient Script Commands:** Additional script commands have been configured in `server/package.json` to make running the project easier using commands like `pnpm dev` / `npm run dev` or `pnpm start` / `npm start`.
- **Local Nodemon Dependency:** On the server-side, I installed `nodemon` as a local project dependency rather than installing it globally (`-g`) in order to optimize storage space.
- **pnpm Package Manager:** This project is built using `pnpm` for faster installation and disk space optimization. However, you can still use `npm` as described in the lab guide without any issues.

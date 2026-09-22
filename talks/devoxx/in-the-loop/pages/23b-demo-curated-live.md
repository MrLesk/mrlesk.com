---
layout: default
mood: 4
class: full
meter: false
clicks: 8
routeAlias: live-curated
---

<GromaFrame
  origin="http://localhost:4802"
  :views="[
    'hud=off',
    'hud=off&container=keycloak-server',
    'actor=end-user',
    'flow=sign-in-with-a-password&step=1',
    'flow=sign-in-with-a-password&step=2',
    'flow=sign-in-with-a-password&step=3',
    'flow=sign-in-with-a-password&step=4',
    'component=oidc-protocol',
    'component=oidc-protocol&tab=how',
  ]"
  :captions="[
    'Keycloak. 8,467 Java files, 57 components.',
    'The server, by responsibility.',
    'Who uses it.',
    'Sign in with a password, step by step.',
    'Sign in with a password, step by step.',
    'Sign in with a password, step by step.',
    'Sign in with a password, step by step.',
    'OpenID Connect: what it does.',
    '264 files behind one box.',
  ]"
  :stills="['demo/keycloak-0.webp', 'demo/keycloak-1.webp', 'demo/keycloak-2.webp', 'demo/keycloak-3.webp', 'demo/keycloak-4.webp', 'demo/keycloak-5.webp', 'demo/keycloak-6.webp', 'demo/keycloak-7.webp', 'demo/keycloak-8.webp']"
  :scale="0.6"
/>

<!--
⏱ 21:15 to 23:00. Keycloak after agent curation, prepared in advance in ~/projects/keycloak.

Click 0. The landscape: users, Keycloak, LDAP, the database, SMTP. "8,467 Java files. I can read this in a minute."
[click] The server container: Authentication, OpenID Connect, SAML, storage, federation.
[click] Who uses it: the end user.
[click] x4. Follow "Sign in with a password" through the system.
[click] One component: OpenID Connect. What it does, who it talks to.
[click] How it is built: 264 files behind one box, and I can open any of them.

Land the point before leaving the demo: this is the level I review at now. Not every line. The architecture.

`bun run dev` starts this map for you.
The numbers in the first caption come from Keycloak at commit dd4ae31d. Re-check them if you update the checkout.
-->

# Projekta instrukcijas MI palīgam

## Tehnoloģijas un valoda

- Projekts izmanto React, TypeScript, Vite un npm.
- Saskarnes teksti pašlaik ir angļu valodā. Maini tos tikai tad, ja uzdevumā tas ir prasīts.
- Koda nosaukumos un testu aprakstos izmanto esošo projekta stilu.

## Automatizētie testi

- Ja pievieno vai maini lietotājam redzamu funkcionalitāti, izveido vai atjaunini tai automatizētos testus.
- React komponentes testē ar Vitest, React Testing Library un `jsdom`.
- Testus izvieto blakus pārbaudāmajam kodam ar nosaukumu `*.test.tsx` vai `*.test.ts`.
- Pārbaudi lietotājam redzamu uzvedību un pieejamības atribūtus; izvairies no iekšējās implementācijas detaļu pārbaudes.
- Pirms darba pabeigšanas palaid `npm test`, `npm run lint` un `npm run build`.
- Ja kādu pārbaudi nav iespējams izpildīt, skaidri norādi iemeslu un rezultātu.

## CI pārbaudes

- GitHub Actions darbplūsma atrodas `.github/workflows/ci.yml`.
- Tā automātiski palaiž lint, testus un būvējumu pēc katra `push` uz `main` zaru.
- Rezultātu var apskatīt GitHub repozitorija cilnē **Actions**.

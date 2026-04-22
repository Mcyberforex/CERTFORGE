# CertForge

Interactive study app for CompTIA Network+ built with React Native (Expo).

## Why I Built This
I wanted a more interactive way to study instead of just reading notes or watching videos. Most resources felt passive, so I built this app to simulate real exam conditions while reinforcing weak areas through active practice.

## Features
- Domain-based lessons (Network Fundamentals implemented)
- Quizzes and PBQs (Performance-Based Questions)
- Final exam simulation with scoring (100–900 scale)
- Resume progress functionality (continue where you left off)

## Challenges
One challenge was fixing quiz progress not restoring properly after refresh. The app would reset to question 1 instead of resuming where the user left off.  

I identified that the issue was related to how state was being initialized and restored. I fixed it by properly saving and restoring quiz state (question index and answers), ensuring users could resume seamlessly.

## Future Improvements
- Add Security+ content
- Improve question explanations (why answers are correct/incorrect)
- Enhance PBQs for more realistic scenarios
- Add demo deployment for easier access

## How to Run
```bash
npm install
npx expo start

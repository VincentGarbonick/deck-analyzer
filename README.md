# MTG Deck Analyzer User Guide

## Getting Started

1. Start the program:
```bash
npm run dev
```
The application will be available at http://localhost:3000

## Preparing Your Deck Files

Each decklist should be saved as a .txt file with the following format:

```
4 Lightning Bolt
4 Dragon's Rage Channeler
3 Mishra's Bauble

2 Blood Moon
2 Alpine Moon
```

Important formatting notes:
- Each line should start with the number of copies
- One card per line
- Leave a blank line between main deck and sideboard
- No special characters or formatting needed

## Using the Program

1. Upload your files:
   - Click the upload area, or
   - Drag and drop files into the upload area
   - You can select multiple files at once
   - **Recommended method:** Click upload area, navigate to directory, CTRL + A to select files 
   - Sample decks available in ./sampledecks directory

2. View the analysis:
   - Use the tabs to switch between Main Deck and Sideboard
   - You'll see:
     - Cards common to all decks
     - Distribution of cards across decks
     - Number of copies in each deck

3. Managing files:
   - Remove individual files using the "Remove" button
   - Clear all files using the "Clear all" button
   - Upload additional files at any time

4. Export results:
   - Click "Export Analysis" to download a text file
   - The export includes all data for both main deck and sideboard

## Troubleshooting

If your decklists aren't being parsed correctly, check:
- File format is .txt
- Each line starts with a number
- There's a blank line between main deck and sideboard
- No special formatting or characters are present

# AI Disclosure and License

## Development Disclosure

This MTG Deck Analyzer was primarily developed through collaboration with Anthropic's Claude AI assistant. The initial Python script was converted to a React-based web application through iterative AI-assisted development.

## Components Used
- Next.js framework
- shadcn/ui component library
- Tailwind CSS
- React
- Additional dependencies as listed in package.json

## License and Usage Rights

This software is released under the MIT License, meaning you can:
- Use it commercially
- Modify the source code
- Distribute it
- Use it privately
- Sublicense it

The only requirement is preservation of copyright and license notices.

## Acknowledgments

- Original Python script concept: Vincent Ray Garbonick
- AI Development Assistant: Claude (Anthropic)
- UI Components: shadcn/ui (MIT License)
- Framework: Next.js (MIT License)

## Contributing

While this project was AI-assisted, community contributions are welcome. Please feel free to fork, modify, and submit pull requests.
# LLM Environmental Impact Tracker - Installation Guide

## Quick Installation

1. **Download the Extension**
   - Ensure all files are in the `EnviromentalExtension` folder

2. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `EnviromentalExtension` folder
   - The extension should appear in your extensions list

3. **Verify Installation**
   - You should see the 🌱 icon in your Chrome toolbar
   - Click it to open the popup interface
   - Check for any console errors in Developer Tools

## Supported Platforms

This extension now tracks LLM usage on:

### Primary Platforms
- **ChatGPT** (chat.openai.com) - Full API and web interface tracking
- **Claude** (claude.ai) - Web interface tracking  
- **Google Bard/Gemini** (bard.google.com, gemini.google.com) - Web interface tracking

### Additional Platforms  
- **Poe** (poe.com) - Multi-model platform tracking
- **Character.AI** (character.ai) - Character chat tracking
- **You.com** (you.com) - AI search tracking
- **Perplexity** (perplexity.ai) - Research assistant tracking

### API Tracking
- OpenAI API calls
- Anthropic API calls  
- Cohere API calls
- Together AI API calls
- Replicate API calls

## How It Works

### Web Interface Tracking
- Detects when you submit prompts on supported websites
- Estimates token usage based on text length
- Tracks responses and conversation patterns
- Stores daily usage statistics

### API Tracking  
- Intercepts API requests to supported providers
- Extracts actual token usage from request/response headers
- More accurate than web interface estimation

### Environmental Calculations
- Energy consumption per token
- Carbon emissions estimates
- Water usage calculations
- Real-time environmental impact tracking

## Privacy & Data

- **Local Storage Only**: All data stays on your device
- **No External Servers**: Extension works completely offline
- **Limited Data**: Only stores aggregated statistics and recent prompt metadata
- **Auto-Cleanup**: Old data is automatically purged to save space

## Troubleshooting

### Extension Won't Load
- Check for syntax errors in Chrome Developer Tools
- Ensure all files are present in the folder
- Try refreshing the extension page

### Not Tracking Prompts
- Check if you're on a supported website
- Open Developer Tools console to see tracking logs
- Some sites may have changed their HTML structure

### Inaccurate Numbers
- Web interface tracking uses estimation (actual tokens may vary)
- API tracking is more accurate when available
- Numbers are meant for relative comparison, not absolute precision

## Contributing

The extension uses dynamic selectors to detect input fields and buttons on each platform. If a platform changes its design and stops working:

1. Open Developer Tools on the platform
2. Find the new CSS selectors for input areas and send buttons  
3. Update the `providerConfigs` object in `content.js`
4. Test the changes and submit improvements

## Environmental Impact Notes

This tracker helps raise awareness of AI's environmental cost:
- Each query consumes electricity for computation
- Data centers contribute to carbon emissions
- Water is used for cooling server infrastructure
- Goal is mindful usage, not elimination of AI tools

Use this data to make informed decisions about your AI usage patterns!

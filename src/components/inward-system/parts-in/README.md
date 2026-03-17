# Parts In System Components

This directory contains the components used for the Parts In system, which allows users to capture and manage parts inventory in both AI and Manual modes.

## Component Structure

1. **ModeSwitcher**: Toggles between AI Capture mode and Manual mode with smooth sliding animations using shadcn Button components.
2. **ContentWrapper**: Wraps the content and handles the animation between modes using Framer Motion.
3. **PartsInCapture**: AI Capture form with camera interface using MUI TextField and shadcn components.
4. **PartsInManual**: Manual entry form with multiple input fields using MUI TextField components.
5. **SummaryTable**: Integrates with the DataTable component to display a summary of parts data.

## Features

- Smooth sliding animations between modes
- Simplified form layouts with clear sections
- Responsive design for all screen sizes
- Integration with existing DataTable component
- Form validation for required fields
- Image capture functionality in AI mode
- Consistent use of components (MUI TextField, shadcn Button)
- Primary color theme throughout the UI

## Usage

The main page component in `src/pages/inward-system/parts-in/index.tsx` integrates all these components together.

To use different modes:

- Click on "AI Capture mode" or "Manual mode" buttons to switch between them
- The transition will be animated for a smooth user experience
- The summary table remains visible regardless of the selected mode

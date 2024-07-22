# Linguisize (proof of concept) (work in progress)

A dynamic text visualisation tool that adjusts the size of words based on their frequency in a given text, visually emphasising the relative importance based on the rarity of words within a document.

## How It Works

Linguisize processes text documents and applies the following transformations:

1. Calculates word frequencies across the entire text
2. Adjusts font sizes based on word frequency, using exponential scaling and emphasising the rarer words 
4. Maintains the original structure of chapters and pages

## Features
- Dynamic font sizing based on word frequency
- Exponential scaling for word emphasis
- Chapter and page navigation
- Support for multi-chapter texts
- Word frequency information on hover

## Customization

The visualization can be customised by adjusting the following parameters:

- `setMinFontSize(size)`: Set the minimum font size
- `setMaxFontSize(size)`: Set the maximum font size
- `setExponent(value)`: Adjust the exponential scaling
- `setSplitPoint(value)`: Set the split point at which the exponential scaling is mirrored




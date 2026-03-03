#!/usr/bin/env node

/**
 * MealMate Image Generator
 * Uses OpenAI DALL-E 3 to generate images for the website.
 *
 * Usage:
 *   node scripts/generate-images.mjs                  # generate all defined images
 *   node scripts/generate-images.mjs --only hero      # generate only "hero" image
 *   node scripts/generate-images.mjs --prompt "..."   # custom prompt, saved as custom.png
 *   node scripts/generate-images.mjs --list           # show available image IDs
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '../public/images');

// ─── Config ────────────────────────────────────────────────────
// Try to load from backend/.env
function loadEnvKey() {
  const envPaths = [
    path.resolve(__dirname, '../backend/.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../.env.local'),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/OPENAI_API_KEY=(.+)/);
      if (match) return match[1].trim();
    }
  }
  return process.env.OPENAI_API_KEY;
}

const apiKey = loadEnvKey();
if (!apiKey) {
  console.error('OPENAI_API_KEY not found. Set it in backend/.env or as env variable.');
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

// ─── Image Definitions ─────────────────────────────────────────
// Each image has an id, filename, prompt, and size.
// Style guidelines for all: photorealistic food photography,
// warm golden lighting, shallow depth of field, premium feel.

const IMAGES = [
  {
    id: 'hero',
    filename: 'hero-cooking.png',
    size: '1792x1024',
    prompt: `Professional food photography: a beautiful modern kitchen scene with fresh colorful ingredients on a marble countertop — ripe tomatoes, fresh herbs (basil, rosemary), olive oil in a glass bottle, pasta, and a wooden cutting board. Warm golden hour lighting streaming through a window. Shallow depth of field. No people, no text. Premium editorial style, like a cover of Bon Appétit magazine. Photorealistic.`,
  },
  {
    id: 'feature-recipe',
    filename: 'feature-recipe-gen.png',
    size: '1024x1024',
    prompt: `Overhead flat-lay food photography: a beautifully plated chicken dish with roasted vegetables on a ceramic plate, surrounded by fresh ingredients — herbs, lemon slices, garlic, cherry tomatoes. Rustic wooden table. Warm natural lighting. Steam rising from the dish. No text, no people. Photorealistic, editorial food photography style.`,
  },
  {
    id: 'feature-mealplan',
    filename: 'feature-meal-plan.png',
    size: '1024x1024',
    prompt: `Food photography: a top-down view of a week's meal prep — 5 glass containers with different colorful meals (grilled salmon with rice, pasta with vegetables, chicken salad, soup, stir-fry). Fresh ingredients scattered around. Clean modern kitchen counter. Bright natural lighting. Organized and appetizing. No text, no people. Photorealistic.`,
  },
  {
    id: 'feature-fridge',
    filename: 'feature-smart-fridge.png',
    size: '1024x1024',
    prompt: `Food photography: an open modern refrigerator filled with organized fresh ingredients — colorful fruits and vegetables, eggs, dairy, herbs in glass containers. Warm kitchen background with soft bokeh. The fridge glows warmly. Everything looks fresh and inviting. No text, no people. Photorealistic, lifestyle photography.`,
  },
  {
    id: 'cta-bg',
    filename: 'cta-background.png',
    size: '1792x1024',
    prompt: `Atmospheric food photography: a dark moody kitchen scene with dramatic golden side-lighting. A steaming pot on a professional stove, scattered herbs and spices on a dark surface, copper pans hanging in the background. Rich warm tones — dark browns, deep golds, amber. Cinematic feel, like a scene from a food documentary. No text, no people. Photorealistic.`,
  },
  {
    id: 'og-image',
    filename: 'og-mealmate.png',
    size: '1792x1024',
    prompt: `Premium food photography composition: a stunning arrangement of diverse dishes on a dark wooden table seen from above — a golden roasted chicken, colorful salad bowl, fresh bread, a bowl of soup, grilled vegetables. Golden cutlery, linen napkins. Warm ambient lighting with slight golden glow. Luxurious dinner party setting. No text, no people, no logos. Photorealistic, editorial quality.`,
  },
  {
    id: 'delivery',
    filename: 'feature-delivery.png',
    size: '1024x1024',
    prompt: `Lifestyle food photography: a paper grocery bag on a kitchen counter overflowing with fresh produce — colorful bell peppers, avocados, tomatoes, fresh bread, lemons, herbs. Warm morning light from a window. Clean modern kitchen background. Feeling of fresh grocery delivery. No text, no people, no brand logos. Photorealistic.`,
  },
  {
    id: 'cooking-mode',
    filename: 'feature-cooking-mode.png',
    size: '1024x1024',
    prompt: `Close-up food photography: hands stirring a beautiful pasta dish in a premium stainless steel pan. Fresh basil leaves, cherry tomatoes, golden olive oil. Steam rising. Shallow depth of field. Warm kitchen lighting. Action shot capturing the joy of cooking. No face visible, just hands and the cooking process. Photorealistic.`,
  },
];

// ─── Generator ──────────────────────────────────────────────────

async function generateImage(imageConfig) {
  const { id, filename, prompt, size } = imageConfig;
  const outPath = path.join(OUT_DIR, filename);

  // Skip if already exists (use --force to regenerate)
  if (fs.existsSync(outPath) && !process.argv.includes('--force')) {
    console.log(`  [skip] ${filename} already exists (use --force to regenerate)`);
    return outPath;
  }

  console.log(`  [gen]  ${id} → ${filename} (${size})...`);

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size,
      quality: 'hd',
      style: 'natural',
      response_format: 'b64_json',
    });

    const b64 = response.data[0].b64_json;
    const buffer = Buffer.from(b64, 'base64');
    fs.writeFileSync(outPath, buffer);

    // Also save the revised prompt for reference
    const revisedPrompt = response.data[0].revised_prompt;
    if (revisedPrompt) {
      fs.writeFileSync(outPath + '.prompt.txt', revisedPrompt);
    }

    console.log(`  [done] ${filename} (${(buffer.length / 1024).toFixed(0)} KB)`);
    return outPath;
  } catch (error) {
    console.error(`  [fail] ${id}: ${error.message}`);
    if (error.code === 'content_policy_violation') {
      console.error('         Prompt was rejected by content policy. Try adjusting it.');
    }
    if (error.code === 'billing_hard_limit_reached') {
      console.error('         OpenAI billing limit reached. Check your account.');
    }
    return null;
  }
}

async function generateCustom(prompt) {
  const filename = `custom-${Date.now()}.png`;
  return generateImage({
    id: 'custom',
    filename,
    prompt,
    size: '1024x1024',
  });
}

// ─── CLI ────────────────────────────────────────────────────────

async function main() {
  console.log('\nMealMate Image Generator (DALL-E 3)');
  console.log('─'.repeat(40));

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // --list
  if (process.argv.includes('--list')) {
    console.log('\nAvailable images:\n');
    for (const img of IMAGES) {
      const exists = fs.existsSync(path.join(OUT_DIR, img.filename));
      const status = exists ? '[exists]' : '[missing]';
      console.log(`  ${status} ${img.id.padEnd(20)} ${img.filename} (${img.size})`);
    }
    console.log(`\nUsage: node scripts/generate-images.mjs --only ${IMAGES[0].id}`);
    return;
  }

  // --prompt "custom prompt"
  const promptIdx = process.argv.indexOf('--prompt');
  if (promptIdx !== -1 && process.argv[promptIdx + 1]) {
    const customPrompt = process.argv[promptIdx + 1];
    console.log(`\nGenerating custom image...\n`);
    await generateCustom(customPrompt);
    return;
  }

  // --only <id>
  const onlyIdx = process.argv.indexOf('--only');
  if (onlyIdx !== -1 && process.argv[onlyIdx + 1]) {
    const targetId = process.argv[onlyIdx + 1];
    const imageConfig = IMAGES.find((img) => img.id === targetId);
    if (!imageConfig) {
      console.error(`\nUnknown image ID: "${targetId}". Use --list to see available IDs.`);
      process.exit(1);
    }
    console.log(`\nGenerating "${targetId}"...\n`);
    await generateImage(imageConfig);
    return;
  }

  // Generate all
  console.log(`\nGenerating ${IMAGES.length} images...\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const imageConfig of IMAGES) {
    const outPath = path.join(OUT_DIR, imageConfig.filename);
    if (fs.existsSync(outPath) && !process.argv.includes('--force')) {
      skipped++;
      console.log(`  [skip] ${imageConfig.filename} already exists`);
      continue;
    }
    const result = await generateImage(imageConfig);
    if (result) {
      generated++;
    } else {
      failed++;
    }
    // Small delay between requests to be nice to the API
    if (generated < IMAGES.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`Done! Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
  console.log(`Images saved to: ${OUT_DIR}/\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

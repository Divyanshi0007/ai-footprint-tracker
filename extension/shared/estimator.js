'use strict';

// ─── All constants are heuristic estimates — not exact billing/measurement data ─

// Pricing: USD per 1K tokens (public list prices, April 2026)
const PRICING = {
  chatgpt: { input: 0.0015, output: 0.002  },
  claude:  { input: 0.001,  output: 0.002  },
  gemini:  { input: 0.0005, output: 0.001  }
};

// Energy per 1K tokens (kWh)
// Source: IEA "Electricity 2024" report + Goldman Sachs "AI Power Demand" (2023)
// GPT-4 class:   ~0.006 kWh/1K tokens
// Claude 3 class:~0.004 kWh/1K tokens (Anthropic efficiency benchmarks)
// Gemini Pro:    ~0.003 kWh/1K tokens (Google DeepMind efficiency figures)
const ENERGY_PER_1K = {
  chatgpt: 0.006,
  claude:  0.004,
  gemini:  0.003
};

// Carbon intensity: kg CO₂ per kWh
// US grid average 2023: 0.386 kg/kWh (EPA eGRID)
// Global average: ~0.475 kg/kWh (IEA 2023)
// Using 0.4 as a conservative mid-point (major AI providers use partial renewables)
const CARBON_PER_KWH = 0.4;

// Water consumption: litres per kWh
// Source: Microsoft Sustainability Report 2023 (~1.8 L/kWh)
//         Google Environmental Report 2023  (~1.7 L/kWh)
//         "Making AI Less Thirsty" Li et al. 2023 (1.5–2.0 L/kWh range)
// Using 1.8 L/kWh — covers both direct cooling water + indirect power-gen water
const WATER_PER_KWH = 1.8;

// Token heuristic: ~4 characters per token for English text (OpenAI tokenizer average)
function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  return Math.ceil(text.length / 4);
}

function buildMetrics(platform, role, text) {
  const tokens       = estimateTokens(text);
  const inputTokens  = role === 'user'      ? tokens : 0;
  const outputTokens = role === 'assistant' ? tokens : 0;

  const rates      = PRICING[platform]        || PRICING.chatgpt;
  const energyRate = ENERGY_PER_1K[platform]  || ENERGY_PER_1K.chatgpt;

  const cost   = ((inputTokens * rates.input) + (outputTokens * rates.output)) / 1000;
  const energy = (tokens / 1000) * energyRate;
  const carbon = energy * CARBON_PER_KWH;
  const water  = energy * WATER_PER_KWH;

  return { inputTokens, outputTokens, cost, energy, carbon, water, messageCount: 1 };
}

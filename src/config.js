'use strict';

/**
 * AgriSphere configuration — everything is driven by environment variables
 * so the same code runs locally and on Render without edits.
 *
 * Optional integrations (all off by default — AgriSphere works with none of
 * them configured, but self-improves more when they are on):
 *   - OPENAI_API_KEY (+ optional OPENAI_BASE_URL, OPENAI_MODEL):
 *       LLM-assisted replies grounded in the built-in knowledge base.
 *   - WHATSAPP_TOKEN + WHATSAPP_PHONE_ID: Meta WhatsApp Cloud API outbound.
 *   - FACEBOOK_PAGE_TOKEN: Meta Messenger outbound.
 *   - TELEGRAM_TOKEN: Telegram Bot API outbound.
 *   - ADMIN_TOKEN / TEACH_TOKEN: protect admin endpoints you expose.
 */

const env = process.env;

module.exports = {
  // Runtime
  PORT: Number(env.PORT || 3000),
  HOST: env.HOST || '0.0.0.0',
  NODE_ENV: env.NODE_ENV || 'development',

  // Branding
  BOT_NAME: env.BOT_NAME || 'AgriSphere Assistant',
  DEFAULT_USER_NAME: env.DEFAULT_USER_NAME || 'farmer',

  // Engine behaviour
  ENABLE_LLM: env.ENABLE_LLM === 'true' || Boolean(env.OPENAI_API_KEY),
  LLM_KEY: env.OPENAI_API_KEY || '',
  LLM_BASE_URL: env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  LLM_MODEL: env.OPENAI_MODEL || 'gpt-4o-mini',
  LLM_TEMPERATURE: Number(env.LLM_TEMPERATURE || 0.3),
  MATCH_THRESHOLD: Number(env.MATCH_THRESHOLD || 0.30),
  MAX_HISTORY: Number(env.MAX_HISTORY || 12),

  // Webhook verification (WhatsApp & Messenger require it; Telegram uses a token path)
  VERIFY_TOKEN: env.VERIFY_TOKEN || 'agrisphere-verify-2026',

  // Channel tokens (leave unset to run in "dev echo" mode)
  WHATSAPP_TOKEN: env.WHATSAPP_TOKEN || '',
  WHATSAPP_PHONE_ID: env.WHATSAPP_PHONE_ID || '',
  FACEBOOK_PAGE_TOKEN: env.FACEBOOK_PAGE_TOKEN || '',
  TELEGRAM_TOKEN: env.TELEGRAM_TOKEN || '',

  // Simple protection for teach / admin endpoints
  TEACH_TOKEN: env.TEACH_TOKEN || '',
  ADMIN_TOKEN: env.ADMIN_TOKEN || '',

  // Persistence (free-tier friendly: local JSON; bring your own disk/Redis later)
  DATA_DIR: env.DATA_DIR || 'data',
};

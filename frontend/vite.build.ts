import type { BuildOptions, PluginOption } from 'vite'

// Scaffold from TICKET-0. TICKET-B owns the production build options and
// build-only plugins (Datadog chunk); vite.config.ts imports both exports.
export const buildOptions: BuildOptions = {}

export const buildPlugins: PluginOption[] = []
